import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileAudio, X, Loader2, Play, Sparkles, Pause, Volume2, Languages, AudioLines } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

interface AudioUploaderProps {
  disabled: boolean;
  onTranscriptionResult: (result: TranscriptionResult) => void;
  apiKey: string;
}

export interface TranscriptionResult {
  id: string;
  fileName: string;
  text: string;
  timestamp: Date;
  language?: string;
  audioUrl?: string;
  duration?: number;
}

export const AudioUploader = ({ disabled, onTranscriptionResult, apiKey }: AudioUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/m4a', 'audio/x-m4a'];
  const maxFileSize = 25 * 1024 * 1024; // 25MB

  const validateFile = (file: File): boolean => {
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
      toast({
        title: "Unsupported File Type",
        description: "Please use .mp3, .wav, or .m4a files only",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxFileSize) {
      toast({
        title: "File Too Large",
        description: "File size must not exceed 25MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setDetectedLanguage(null);
      
      // Create URL for audio playback
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      // Create audio element to get duration
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });

      toast({
        title: "Audio File Ready! 🎵",
        description: `${file.name} selected. Click the button to start transcription`,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const transcribeWithWhisper = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');

    try {
      // Use environment OPENAI_API_KEY for Whisper transcription
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('Whisper API rate limit exceeded - Please wait a moment and try again');
        } else if (response.status === 401) {
          throw new Error('Unable to access Whisper API - Please try again');
        } else if (response.status === 413) {
          throw new Error('Audio file too large - Please use a file smaller than 25MB');
        } else {
          throw new Error(`Whisper API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
      }

      const result = await response.json();
      
      if (!result.text) {
        throw new Error('ไม่สามารถถอดข้อความจากไฟล์เสียงได้');
      }
      
      return result.text;
    } catch (error: any) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Unable to connect to Whisper API - Please check your internet connection');
      }
      throw error;
    }
  };

  const processWithGemini = async (text: string): Promise<string> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Please improve and format the following transcribed text for better readability. Add proper punctuation, correct any errors, and organize the text appropriately:

${text}

Please return only the improved text without any explanation or additional content.`
            }]
          }]
        }),
      });

      if (!response.ok) {
        console.warn('Gemini processing failed, using original text');
        return text;
      }

      const result = await response.json();
      const processedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      return processedText || text;
    } catch (error) {
      console.warn('Gemini processing failed, using original text:', error);
      return text;
    }
  };

  const detectLanguage = (text: string): string => {
    // Simple language detection based on character patterns
    const thaiPattern = /[\u0E00-\u0E7F]/;
    const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    const chinesePattern = /[\u4E00-\u9FFF]/;
    const koreanPattern = /[\uAC00-\uD7AF]/;
    const arabicPattern = /[\u0600-\u06FF]/;
    
    if (thaiPattern.test(text)) return 'Thai';
    if (japanesePattern.test(text)) return 'Japanese';
    if (chinesePattern.test(text)) return 'Chinese';
    if (koreanPattern.test(text)) return 'Korean';
    if (arabicPattern.test(text)) return 'Arabic';
    return 'English';
  };

  const transcribeAudioFile = async (file: File): Promise<TranscriptionResult> => {
    try {
      setProgress(15);
      
      // Step 1: Use Whisper to transcribe audio to text
      const rawTranscriptionText = await transcribeWithWhisper(file);
      
      setProgress(50);
      
      // Step 2: Process with Gemini for improvement
      const processedText = await processWithGemini(rawTranscriptionText);
      
      setProgress(70);
      
      const detectedLanguage = detectLanguage(processedText);
      setDetectedLanguage(detectedLanguage);
      
      setProgress(90);

      return {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        text: processedText,
        timestamp: new Date(),
        language: detectedLanguage,
        audioUrl: audioUrl || '',
        duration: audioDuration
      };
    } catch (error: any) {
      console.error('Transcription error:', error);
      
      let errorMessage = 'Unable to transcribe audio file';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      throw new Error(errorMessage);
    }
  };

  const getLanguageName = (languageCode: string): string => {
    const languageMap: Record<string, string> = {
      'en': 'English',
      'th': 'ไทย (Thai)',
      'zh': '中文 (Chinese)',
      'ja': '日本語 (Japanese)',
      'ko': '한국어 (Korean)',
      'es': 'Español (Spanish)',
      'fr': 'Français (French)',
      'de': 'Deutsch (German)',
      'it': 'Italiano (Italian)',
      'pt': 'Português (Portuguese)',
      'ru': 'Русский (Russian)',
      'ar': 'العربية (Arabic)',
      'hi': 'हिन्दी (Hindi)',
    };
    
    return languageMap[languageCode] || languageCode.toUpperCase();
  };

  const processTranscription = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await transcribeAudioFile(selectedFile);
      setProgress(100);

      setTimeout(() => {
        onTranscriptionResult(result);
        setSelectedFile(null);
        setAudioUrl(null);
        setAudioDuration(0);
        setIsProcessing(false);
        setProgress(0);
        setDetectedLanguage(null);
        
        toast({
          title: "Transcription Successful! 🎉",
          description: `Audio transcription completed successfully`,
        });
      }, 800);

    } catch (error: any) {
      console.error('Transcription error:', error);
      setIsProcessing(false);
      setProgress(0);
      
      const errorMessage = error?.message || 'Unable to transcribe audio file. Please try again.';
      
      toast({
        title: "Transcription Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const removeFile = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setSelectedFile(null);
    setAudioUrl(null);
    setAudioDuration(0);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`w-full shadow-custom-lg transition-all duration-300 border-2 ${
      disabled ? 'opacity-50 pointer-events-none border-muted' : 'border-primary/20 hover:border-primary/40'
    } ${selectedFile ? 'bg-gradient-to-br from-primary/5 to-accent/5' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <FileAudio className="h-6 w-6 text-white" />
          </div>
          Upload Audio File
        </CardTitle>
        <CardDescription className="text-base">
          Supports .mp3, .wav, .m4a files up to 25MB • Professional audio transcription service
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!selectedFile && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              isDragOver 
                ? 'border-primary bg-primary/10 scale-105' 
                : 'border-border hover:border-primary/60 hover:bg-primary/5'
            }`}
          >
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-custom-md animate-float">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Drag Files Here</h3>
                <p className="text-muted-foreground text-lg">Or click to select files from your device</p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-3 text-lg shadow-custom-md hover:scale-105 transition-all duration-200"
              >
                <Upload className="h-5 w-5 mr-2" />
                Select Audio File
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,audio/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}

        {selectedFile && !isProcessing && (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-secondary to-secondary/50 rounded-xl border border-primary/20 shadow-custom-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-primary rounded-lg shadow-custom-sm">
                    <FileAudio className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{selectedFile.name}</p>
                    <p className="text-muted-foreground">
                      Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      {audioDuration > 0 && ` • Duration: ${formatDuration(audioDuration)}`}
                    </p>
                  </div>
                </div>
                <Button onClick={removeFile} variant="outline" size="sm" className="hover:bg-destructive/10">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Audio Player */}
              {audioUrl && (
                <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-primary/10">
                  <Button
                    onClick={toggleAudioPlayback}
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/10"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to play audio file</span>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                  />
                </div>
              )}
            </div>
            
            {/* Start Transcription Button */}
            <div className="flex justify-center">
              <Button 
                onClick={processTranscription} 
                disabled={disabled || !selectedFile || isProcessing}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-12 py-6 text-xl shadow-xl transform hover:scale-105 transition-all duration-200 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-6 w-6 mr-3" />
                Start Transcription
                <Sparkles className="h-6 w-6 ml-3" />
              </Button>
            </div>
            

          </div>
        )}

        {isProcessing && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/30">
              <div className="p-3 bg-gradient-primary rounded-lg shadow-custom-sm">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">Processing: {selectedFile?.name}</p>
                <p className="text-muted-foreground text-base">
                  Using Whisper + Gemini AI for transcription and enhancement...
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Progress</span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-secondary" />
              <div className="text-center text-sm text-muted-foreground">
                {progress < 30 && "Transcribing audio with Whisper AI..."}
                {progress >= 30 && progress < 60 && "Enhancing text with Gemini AI..."}
                {progress >= 60 && progress < 90 && "Detecting language and refining text..."}
                {progress >= 90 && "Finalizing results..."}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};