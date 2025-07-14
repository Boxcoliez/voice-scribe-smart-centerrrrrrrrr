import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileAudio, X, Loader2 } from "lucide-react";
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
}

export const AudioUploader = ({ disabled, onTranscriptionResult, apiKey }: AudioUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const simulateTranscription = async (file: File): Promise<string> => {
    // Simulate AI transcription process
    const mockTexts = [
      "สวัสดีครับ ยินดีต้อนรับสู่ Contact Center ของเรา ขอบคุณสำหรับการโทรเข้ามา วันนี้ผมสามารถช่วยอะไรคุณได้บ้างครับ",
      "Thank you for calling our support center. How may I assist you today? I'm here to help resolve any issues you might have.",
      "ご連絡いただきありがとうございます。本日はどのようなご用件でしょうか。お手伝いできることがございましたら、お気軽にお申し付けください。"
    ];
    
    return mockTexts[Math.floor(Math.random() * mockTexts.length)];
  };

  const processTranscription = async () => {
    if (!selectedFile || !apiKey) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate transcription API call
      const transcriptionText = await simulateTranscription(selectedFile);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Create result
      const result: TranscriptionResult = {
        id: `trans_${Date.now()}`,
        fileName: selectedFile.name,
        text: transcriptionText,
        timestamp: new Date(),
        language: 'auto-detected'
      };

      setTimeout(() => {
        onTranscriptionResult(result);
        setSelectedFile(null);
        setIsProcessing(false);
        setProgress(0);
        
        toast({
          title: "สำเร็จ!",
          description: "แปลงเสียงเป็นข้อความเรียบร้อยแล้ว",
        });
      }, 500);

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
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={`w-full shadow-custom-sm transition-all duration-200 ${
      disabled ? 'opacity-50 pointer-events-none' : ''
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-5 w-5 text-primary" />
          Upload Audio File
        </CardTitle>
        <CardDescription>
          รองรับไฟล์ .mp3, .wav, .m4a ขนาดไม่เกิน 25MB
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!selectedFile && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">ลากไฟล์มาวางที่นี่</p>
            <p className="text-muted-foreground mb-4">หรือคลิกเพื่อเลือกไฟล์</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              variant="outline"
            >
              เลือกไฟล์เสียง
            </Button>
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
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <FileAudio className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={removeFile} variant="outline" size="sm">
                <X className="h-4 w-4" />
              </Button>
              <Button onClick={processTranscription} size="sm">
                เริ่มแปลง
              </Button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <div className="flex-1">
                <p className="font-medium">กำลังประมวลผล: {selectedFile?.name}</p>
                <p className="text-sm text-muted-foreground">
                  กำลังแปลงเสียงเป็นข้อความ...
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>ความคืบหน้า</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};