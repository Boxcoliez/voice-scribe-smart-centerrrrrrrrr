import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { History, Eye, Copy, Download, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TranscriptionResult } from "./AudioUploader";

interface TranscriptionHistoryProps {
  currentResult: TranscriptionResult | null;
}

export const TranscriptionHistory = ({ currentResult }: TranscriptionHistoryProps) => {
  const [history, setHistory] = useState<TranscriptionResult[]>([]);
  const { toast } = useToast();

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('transcription-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(historyWithDates);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  // Save current result to history
  useEffect(() => {
    if (currentResult) {
      setHistory(prev => {
        const newHistory = [currentResult, ...prev.filter(item => item.id !== currentResult.id)];
        const limitedHistory = newHistory.slice(0, 50); // Keep only last 50 items
        localStorage.setItem('transcription-history', JSON.stringify(limitedHistory));
        return limitedHistory;
      });
    }
  }, [currentResult]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "คัดลอกแล้ว",
        description: "คัดลอกข้อความไปยังคลิปบอร์ดเรียบร้อยแล้ว",
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคัดลอกข้อความได้",
        variant: "destructive",
      });
    }
  };

  const downloadAsText = (result: TranscriptionResult) => {
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

  const deleteItem = (id: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id);
      localStorage.setItem('transcription-history', JSON.stringify(newHistory));
      return newHistory;
    });
    
    toast({
      title: "ลบแล้ว",
      description: "ลบรายการจากประวัติเรียบร้อยแล้ว",
    });
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem('transcription-history');
    toast({
      title: "ล้างประวัติแล้ว",
      description: "ลบประวัติทั้งหมดเรียบร้อยแล้ว",
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card className="w-full shadow-custom-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              ประวัติการใช้งาน
            </CardTitle>
            <CardDescription>
              รายการ transcription ทั้งหมด ({history.length} รายการ)
            </CardDescription>
          </div>
          {history.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  ล้างทั้งหมด
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    ยืนยันการลบ
                  </DialogTitle>
                  <DialogDescription>
                    คุณต้องการลบประวัติการใช้งานทั้งหมดหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm">
                    ยกเลิก
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={clearAllHistory}
                  >
                    ลบทั้งหมด
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>ยังไม่มีประวัติการใช้งาน</p>
            <p className="text-sm">เริ่มต้นด้วยการอัปโหลดไฟล์เสียงเพื่อสร้างประวัติแรก</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{item.fileName}</p>
                    {item.language && (
                      <Badge variant="secondary" className="text-xs">
                        {item.language}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.timestamp.toLocaleString('th-TH')}
                  </p>
                  <p className="text-sm text-foreground">
                    {truncateText(item.text)}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>ผลลัพธ์ Transcription</DialogTitle>
                        <DialogDescription>
                          {item.fileName} • {item.timestamp.toLocaleString('th-TH')}
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        value={item.text}
                        readOnly
                        className="min-h-[200px] resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => copyToClipboard(item.text)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          คัดลอก
                        </Button>
                        <Button
                          onClick={() => downloadAsText(item)}
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          ดาวน์โหลด
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    onClick={() => copyToClipboard(item.text)}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={() => downloadAsText(item)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={() => deleteItem(item.id)}
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};