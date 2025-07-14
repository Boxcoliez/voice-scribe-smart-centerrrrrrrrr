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
  apiProvider: "openai" | "gemini";
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

export const AudioUploader = ({ disabled, onTranscriptionResult, apiKey, apiProvider }: AudioUploaderProps) => {
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
        title: "ไฟล์ไม่รองรับ",
        description: "กรุณาใช้ไฟล์ .mp3, .wav หรือ .m4a เท่านั้น",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxFileSize) {
      toast({
        title: "ไฟล์ใหญ่เกินไป",
        description: "ขนาดไฟล์ต้องไม่เกิน 25MB",
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
        title: "ไฟล์เสียงพร้อมแล้ว! 🎵",
        description: `เลือกไฟล์ ${file.name} แล้ว กดปุ่มเพื่อเริ่มแปลงเป็นข้อความ`,
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

  const transcribeWithOpenAI = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    return result.text;
  };

  const transcribeWithGemini = async (file: File): Promise<string> => {
    // Convert file to base64
    const base64Audio = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:audio/... prefix
      };
      reader.readAsDataURL(file);
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Please transcribe this audio file. Only return the transcribed text, nothing else."
          }, {
            inline_data: {
              mime_type: file.type,
              data: base64Audio
            }
          }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
  };

  const detectLanguage = (text: string): string => {
    // Simple language detection based on character patterns
    const thaiPattern = /[\u0E00-\u0E7F]/;
    const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    const chinesePattern = /[\u4E00-\u9FFF]/;
    
    if (thaiPattern.test(text)) return 'ไทย';
    if (japanesePattern.test(text)) return '日本語';
    if (chinesePattern.test(text)) return '中文';
    return 'English';
  };

  const transcribeAudioFile = async (file: File): Promise<TranscriptionResult> => {
    try {
      let transcriptionText: string;
      setProgress(20);

      if (apiProvider === "openai") {
        transcriptionText = await transcribeWithOpenAI(file);
      } else {
        transcriptionText = await transcribeWithGemini(file);
      }

      setProgress(80);
      const detectedLanguage = detectLanguage(transcriptionText);
      setDetectedLanguage(detectedLanguage);
      
      toast({
        title: "แปลงเสียงสำเร็จ! ✨",
        description: `ตรวจพบภาษา: ${detectedLanguage} ด้วย ${apiProvider === "gemini" ? "Gemini" : "OpenAI"}`,
      });

      return {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        text: transcriptionText,
        timestamp: new Date(),
        language: detectedLanguage,
        audioUrl: audioUrl || '',
        duration: audioDuration
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`ไม่สามารถแปลงไฟล์เสียงด้วย ${apiProvider === "gemini" ? "Gemini" : "OpenAI"} ได้: ${error}`);
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
          title: "สำเร็จ! 🎉",
          description: `แปลงเสียงเป็นข้อความเรียบร้อยแล้ว`,
        });
      }, 800);

    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแปลงไฟล์เสียงได้ กรุณาลองใหม่อีกครั้ง",
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
          อัปโหลดไฟล์เสียง
        </CardTitle>
        <CardDescription className="text-base">
          รองรับไฟล์ .mp3, .wav, .m4a ขนาดไม่เกิน 25MB • ระบบจะถอดข้อความจากเสียงจริง
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
                <h3 className="text-xl font-semibold">ลากไฟล์มาวางที่นี่</h3>
                <p className="text-muted-foreground text-lg">หรือคลิกเพื่อเลือกไฟล์จากเครื่องของคุณ</p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-3 text-lg shadow-custom-md hover:scale-105 transition-all duration-200"
              >
                <Upload className="h-5 w-5 mr-2" />
                เลือกไฟล์เสียง
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
                      ขนาด: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      {audioDuration > 0 && ` • ความยาว: ${formatDuration(audioDuration)}`}
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
                  <span className="text-sm text-muted-foreground">คลิกเพื่อฟังไฟล์เสียง</span>
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
            
            {/* ปุ่มเริ่มแปลงที่ใหญ่และชัดเจน */}
            <div className="flex justify-center">
              <Button 
                onClick={processTranscription} 
                size="lg"
                className="bg-gradient-accent hover:opacity-90 text-accent-foreground font-bold px-16 py-8 text-2xl shadow-custom-lg transform hover:scale-105 transition-all duration-200 animate-glow rounded-2xl"
              >
                <Play className="h-8 w-8 mr-4" />
                เริ่มแปลงเสียงเป็นข้อความ
                <Sparkles className="h-8 w-8 ml-4" />
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
                <p className="font-semibold text-lg">กำลังประมวลผล: {selectedFile?.name}</p>
                <p className="text-muted-foreground text-base">
                  กำลังวิเคราะห์และถอดข้อความจากเสียง...
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">ความคืบหน้า</span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-secondary" />
              <div className="text-center text-sm text-muted-foreground">
                {progress < 30 && "กำลังวิเคราะห์ไฟล์เสียง..."}
                {progress >= 30 && progress < 60 && "กำลังตรวจจับภาษา..."}
                {progress >= 60 && progress < 90 && "กำลังถอดข้อความจากเสียง..."}
                {progress >= 90 && "กำลังจัดรูปแบบผลลัพธ์..."}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};