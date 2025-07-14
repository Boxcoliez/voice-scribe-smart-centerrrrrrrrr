import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { History, Eye, Copy, Download, Trash2, AlertTriangle, Clock, FileText } from "lucide-react";
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
        title: "คัดลอกแล้ว! 📋",
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
      title: "ดาวน์โหลดแล้ว! 📁",
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
      title: "ลบแล้ว! 🗑️",
      description: "ลบรายการจากประวัติเรียบร้อยแล้ว",
    });
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem('transcription-history');
    toast({
      title: "ล้างประวัติแล้ว! 🧹",
      description: "ลบประวัติทั้งหมดเรียบร้อยแล้ว",
    });
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getLanguageColor = (language?: string) => {
    switch (language) {
      case 'ไทย': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'English': return 'bg-green-100 text-green-800 border-green-200';
      case '日本語': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full shadow-custom-lg border-2 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-custom-sm">
              <History className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">ประวัติการใช้งาน</CardTitle>
              <CardDescription className="text-base">
                รายการ transcription ทั้งหมด ({history.length} รายการ)
              </CardDescription>
            </div>
          </div>
          {history.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hover:bg-destructive/10 border-destructive/30">
                  <Trash2 className="h-4 w-4 mr-2" />
                  ล้างทั้งหมด
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    ยืนยันการลบ
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    คุณต้องการลบประวัติการใช้งานทั้งหมดหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 justify-end pt-4">
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
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
              <History className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-muted-foreground">ยังไม่มีประวัติการใช้งาน</p>
              <p className="text-muted-foreground">เริ่มต้นด้วยการอัปโหลดไฟล์เสียงเพื่อสร้างประวัติแรก</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div
                key={item.id}
                className={`group relative p-5 border-2 rounded-xl transition-all duration-200 hover:shadow-custom-md ${
                  index === 0 ? 'border-success/30 bg-gradient-to-r from-success/5 to-primary/5' : 'border-border hover:border-primary/30 hover:bg-primary/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <p className="font-semibold text-base truncate">{item.fileName}</p>
                      </div>
                      {item.language && (
                        <Badge className={`text-xs font-medium border ${getLanguageColor(item.language)}`}>
                          {item.language}
                        </Badge>
                      )}
                      {index === 0 && (
                        <Badge className="bg-success/20 text-success border-success/30 text-xs">
                          ล่าสุด
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{item.timestamp.toLocaleString('th-TH')}</span>
                      <span>•</span>
                      <span>{item.text.split(' ').length} คำ</span>
                    </div>
                    
                    <p className="text-foreground leading-relaxed">
                      {truncateText(item.text)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="hover:bg-primary/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            ผลลัพธ์ Transcription
                          </DialogTitle>
                          <DialogDescription className="text-base">
                            {item.fileName} • {item.timestamp.toLocaleString('th-TH')}
                            {item.language && ` • ${item.language}`}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            value={item.text}
                            readOnly
                            className="min-h-[250px] resize-none text-base leading-relaxed"
                          />
                          <div className="flex gap-3 justify-end">
                            <Button
                              onClick={() => copyToClipboard(item.text)}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              คัดลอก
                            </Button>
                            <Button
                              onClick={() => downloadAsText(item)}
                              size="sm"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              ดาวน์โหลด
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      onClick={() => copyToClipboard(item.text)}
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={() => downloadAsText(item)}
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary/10"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={() => deleteItem(item.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};