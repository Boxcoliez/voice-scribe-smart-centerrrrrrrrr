import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileAudio, X, Loader2, Play, Pause, Volume2, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/m4a', 'audio/x-m4a'];
  const maxFileSize = 20 * 1024 * 1024; // 20MB (Gemini limit)

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
        description: "File size must not exceed 20MB for Gemini API",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });

      toast({
        title: "Audio File Ready",
        description: `${file.name} selected successfully`,
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

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data:audio/xxx;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const getMimeType = (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp3':
        return 'audio/mp3';
      case 'wav':
        return 'audio/wav';
      case 'm4a':
        return 'audio/mp4';
      default:
        return file.type || 'audio/mp3';
    }
  };

  const detectLanguage = (text: string): string => {
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

  const transcribeWithGemini = async (file: File): Promise<TranscriptionResult> => {
    try {
      setProgress(20);
      
      // Convert file to base64
      const base64Data = await convertFileToBase64(file);
      const mimeType = getMimeType(file);
      
      setProgress(40);

      // Call Gemini API with audio file
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Please transcribe this audio file to text. Provide only the transcribed text without any additional explanation or formatting."
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }]
        }),
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('Gemini API rate limit exceeded - Please wait a moment and try again');
        } else if (response.status === 401) {
          throw new Error('Invalid API Key - Please check your Gemini API Key');
        } else if (response.status === 413) {
          throw new Error('Audio file too large - Please use a file smaller than 20MB');
        } else {
          throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
      }

      const result = await response.json();
      setProgress(90);
      
      const transcribedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!transcribedText) {
        throw new Error('Unable to transcribe audio file - No text returned from Gemini');
      }

      const detectedLanguage = detectLanguage(transcribedText);
      
      setProgress(100);

      return {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        text: transcribedText.trim(),
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

  const processTranscription = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await transcribeWithGemini(selectedFile);

      setTimeout(() => {
        onTranscriptionResult(result);
        setSelectedFile(null);
        setAudioUrl(null);
        setAudioDuration(0);
        setIsProcessing(false);
        setProgress(0);
        
        toast({
          title: "Transcription Complete",
          description: `Successfully transcribed ${selectedFile.name}`,
        });
      }, 500);

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
    <Card className={`w-full shadow-professional transition-all duration-300 border-border/50 ${
      disabled ? 'opacity-50 pointer-events-none' : ''
    } ${selectedFile ? 'bg-primary/5' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="p-2 gradient-primary rounded-lg">
            <Mic className="h-5 w-5 text-white" />
          </div>
          Audio Upload
        </CardTitle>
        <CardDescription className="text-base">
          Upload audio files (.mp3, .wav, .m4a) up to 20MB for Gemini AI transcription
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!selectedFile && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 focus-ring ${
              isDragOver 
                ? 'border-primary bg-primary/10 scale-[1.02]' 
                : 'border-border hover:border-primary/60 hover:bg-primary/5'
            }`}
          >
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 gradient-primary rounded-full flex items-center justify-center shadow-professional">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Drop Audio Files Here</h3>
                <p className="text-muted-foreground text-base">Or click to browse from your device</p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                size="lg"
                className="gradient-primary hover:opacity-90 text-white font-medium px-8 py-3 text-base shadow-professional focus-ring"
              >
                <FileAudio className="h-5 w-5 mr-2" />
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
            <div className="p-6 bg-secondary/50 rounded-xl border border-border/50 shadow-professional">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 gradient-primary rounded-lg shadow-professional">
                    <FileAudio className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{selectedFile.name}</p>
                    <p className="text-muted-foreground">
                      Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      {audioDuration > 0 && ` • Duration: ${formatDuration(audioDuration)}`}
                    </p>
                  </div>
                </div>
                <Button onClick={removeFile} variant="outline" size="sm" className="hover:bg-destructive/10 focus-ring">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {audioUrl && (
                <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border/30">
                  <Button
                    onClick={toggleAudioPlayback}
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/10 focus-ring"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">Preview audio file</span>
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
            
            <div className="flex justify-center">
              <Button 
                onClick={processTranscription} 
                disabled={disabled || !selectedFile || isProcessing}
                size="lg"
                className="gradient-primary hover:opacity-90 text-white font-semibold px-12 py-6 text-lg shadow-professional-lg focus-ring"
              >
                <Play className="h-5 w-5 mr-3" />
                Start Transcription
              </Button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-6 bg-primary/10 rounded-xl border border-primary/30">
              <div className="p-3 gradient-primary rounded-lg shadow-professional">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">Processing: {selectedFile?.name}</p>
                <p className="text-muted-foreground text-base">
                  Using Gemini AI for audio transcription...
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
                {progress < 30 && "Preparing audio file..."}
                {progress >= 30 && progress < 60 && "Uploading to Gemini AI..."}
                {progress >= 60 && progress < 90 && "Transcribing audio with Gemini..."}
                {progress >= 90 && "Finalizing transcription..."}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};