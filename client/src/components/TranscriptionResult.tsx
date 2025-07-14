import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Check, FileText, Sparkles, Play, Pause, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TranscriptionResult as TranscriptionResultType } from "./AudioUploader";

interface TranscriptionResultProps {
  result: TranscriptionResultType | null;
}

export const TranscriptionResult = ({ result }: TranscriptionResultProps) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  if (!result) {
    return (
      <Card className="w-full shadow-custom-lg border-2 border-dashed border-muted">
        <CardHeader className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mb-4 animate-float">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-muted-foreground text-xl">ผลลัพธ์ Transcription</CardTitle>
          <CardDescription className="text-base">
            ข้อความที่แปลงได้จะแสดงที่นี่หลังจากการประมวลผลเสร็จสิ้น
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-xl bg-muted/20">
            <div className="text-center space-y-2">
              <Sparkles className="h-8 w-8 mx-auto opacity-50 animate-shimmer" />
              <p className="text-lg">รอการอัปโหลดไฟล์เสียง</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      toast({
        title: "คัดลอกแล้ว! 📋",
        description: "คัดลอกข้อความไปยังคลิปบอร์ดเรียบร้อยแล้ว",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคัดลอกข้อความได้",
        variant: "destructive",
      });
    }
  };

  const downloadAsText = () => {
    const element = document.createElement('a');
    const file = new Blob([result.text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcription_${result.fileName.split('.')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "ดาวน์โหลดแล้ว! 📁",
      description: "ไฟล์ข้อความถูกดาวน์โหลดเรียบร้อยแล้ว",
    });
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

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLanguageColor = (language?: string) => {
    switch (language) {
      case 'ไทย': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'English': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case '日本語': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <Card className="w-full shadow-custom-lg animate-fade-in border-2 border-success/30 bg-gradient-to-br from-success/5 to-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-success to-success/80 rounded-lg shadow-custom-sm">
            <Check className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-success text-xl">ผลลัพธ์ Transcription</CardTitle>
          {result.language && (
            <Badge className={`font-semibold px-3 py-1 border ${getLanguageColor(result.language)}`}>
              {result.language}
            </Badge>
          )}
        </div>
        <CardDescription className="text-base">
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
            <span>📁 {result.fileName}</span>
            <span>•</span>
            <span>🕒 {result.timestamp.toLocaleString('th-TH')}</span>
            {result.duration && (
              <>
                <span>•</span>
                <span>⏱️ {formatDuration(result.duration)}</span>
              </>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Audio Player */}
        {result.audioUrl && (
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-xl border border-primary/20 shadow-custom-sm">
            <Button
              onClick={toggleAudioPlayback}
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 border-2 border-primary/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Volume2 className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">ฟังไฟล์เสียงต้นฉบับ</span>
            <audio
              ref={audioRef}
              src={result.audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            />
          </div>
        )}

        <div className="relative">
          <Textarea
            value={result.text}
            readOnly
            className="min-h-[150px] resize-none font-medium text-base leading-relaxed bg-background/50 border-2 border-primary/20 focus:border-primary/40 rounded-xl p-4"
            placeholder="ข้อความที่แปลงได้จะแสดงที่นี่..."
          />
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              {result.text.length} ตัวอักษร
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="lg"
            className="flex items-center gap-3 px-6 py-3 hover:bg-primary/10 border-2 border-primary/20 hover:border-primary/40 transition-all duration-200"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 text-success" />
                <span className="font-semibold">คัดลอกแล้ว</span>
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                <span className="font-semibold">คัดลอกข้อความ</span>
              </>
            )}
          </Button>
          
          <Button
            onClick={downloadAsText}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-6 py-3 shadow-custom-md transition-all duration-200 hover:scale-105"
          >
            <Download className="h-5 w-5 mr-2" />
            ดาวน์โหลด .txt
          </Button>
        </div>

        {/* แสดงข้อมูลเพิ่มเติม */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="text-center p-3 bg-background/50 rounded-lg border border-primary/10">
            <p className="text-sm text-muted-foreground">จำนวนคำ</p>
            <p className="text-lg font-bold text-primary">{result.text.split(' ').length}</p>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg border border-primary/10">
            <p className="text-sm text-muted-foreground">ภาษาที่ตรวจพบ</p>
            <p className="text-lg font-bold text-primary">{result.language || 'ไม่ระบุ'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};