import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TranscriptionResult as TranscriptionResultType } from "./AudioUploader";

interface TranscriptionResultProps {
  result: TranscriptionResultType | null;
}

export const TranscriptionResult = ({ result }: TranscriptionResultProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!result) {
    return (
      <Card className="w-full shadow-custom-sm border-muted">
        <CardHeader>
          <CardTitle className="text-muted-foreground">ผลลัพธ์ Transcription</CardTitle>
          <CardDescription>
            ข้อความที่แปลงได้จะแสดงที่นี่
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-lg">
            ยังไม่มีการแปลงไฟล์เสียง
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
        title: "คัดลอกแล้ว",
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
      title: "ดาวน์โหลดแล้ว",
      description: "ไฟล์ข้อความถูกดาวน์โหลดเรียบร้อยแล้ว",
    });
  };

  return (
    <Card className="w-full shadow-custom-sm animate-fade-in">
      <CardHeader>
        <CardTitle className="text-success">ผลลัพธ์ Transcription</CardTitle>
        <CardDescription>
          แปลงจากไฟล์: {result.fileName} • {result.timestamp.toLocaleString('th-TH')}
          {result.language && ` • ภาษา: ${result.language}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={result.text}
          readOnly
          className="min-h-[120px] resize-none font-medium"
          placeholder="ข้อความที่แปลงได้จะแสดงที่นี่..."
        />
        
        <div className="flex gap-2 justify-end">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" />
                คัดลอกแล้ว
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                คัดลอก
              </>
            )}
          </Button>
          
          <Button
            onClick={downloadAsText}
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download .txt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};