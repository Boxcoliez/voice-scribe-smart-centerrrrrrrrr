import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, Check, AlertCircle, Sparkles, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
}

export const ApiKeyInput = ({ apiKey, onApiKeyChange }: ApiKeyInputProps) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Test connection"
            }]
          }]
        }),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาใส่ API Key",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const isValid = await validateApiKey(tempApiKey.trim());
      
      if (isValid) {
        onApiKeyChange(tempApiKey.trim());
        toast({
          title: "สำเร็จ! 🎉",
          description: "Gemini API Key ถูกต้อง พร้อมใช้งาน",
        });
      } else {
        toast({
          title: "API Key ไม่ถูกต้อง",
          description: "ไม่สามารถเชื่อมต่อกับ Gemini ได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถตรวจสอบ API Key ได้",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearApiKey = () => {
    setTempApiKey("");
    onApiKeyChange("");
    toast({
      title: "ลบ API Key แล้ว",
      description: "คุณสามารถใส่ API Key ใหม่ได้",
    });
  };

  const providerInfo = {
    name: "Google Gemini",
    icon: <Sparkles className="h-5 w-5 text-blue-600" />,
    placeholder: "AIzaSy...",
    description: "ใส่ Gemini API Key เพื่อใช้งาน AI transcription (ระบบจะใช้ Whisper + Gemini แบบอัตโนมัติ)",
    keyGuide: "รับ API Key ฟรีจาก Google AI Studio"
  };

  return (
    <Card className="w-full shadow-custom-lg border-2 border-primary/20 bg-gradient-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Key className="h-6 w-6 text-primary" />
          API Configuration
        </CardTitle>
        <CardDescription className="text-base">
          ใส่ Gemini API Key เพื่อเริ่มใช้งาน AI transcription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">


        {/* API Key Input */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {providerInfo.icon}
            <Label htmlFor="apiKey" className="text-base font-semibold">{providerInfo.name} API Key</Label>
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-3">
              <Input
                id="apiKey"
                type="password"
                placeholder={`ใส่ ${providerInfo.name} API Key... (${providerInfo.placeholder})`}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="font-mono text-lg h-12 border-2 border-primary/20 focus:border-primary/40"
              />
              {apiKey ? (
                <Button 
                  onClick={handleClearApiKey}
                  variant="outline" 
                  size="lg"
                  className="shrink-0 h-12 px-4 border-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <AlertCircle className="h-5 w-5 mr-2" />
                  ลบ
                </Button>
              ) : (
                <Button 
                  onClick={handleSaveApiKey}
                  disabled={!tempApiKey.trim() || isValidating}
                  size="lg"
                  className="shrink-0 h-12 px-6 bg-gradient-primary hover:opacity-90 text-white font-semibold"
                >
                  {isValidating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ตรวจสอบ...
                    </div>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      ตรวจสอบ & บันทึก
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {providerInfo.keyGuide}
            </p>
          </div>
        </div>
        
        {/* Status */}
        {apiKey ? (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-success/20 to-success/10 text-success rounded-xl border-2 border-success/30">
            <Check className="h-6 w-6" />
            <div>
              <div className="font-semibold text-lg">{providerInfo.name} พร้อมใช้งาน</div>
              <div className="text-sm opacity-80">คุณสามารถอัปโหลดไฟล์เสียงได้แล้ว</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-warning/20 to-warning/10 text-warning rounded-xl border-2 border-warning/30">
            <AlertCircle className="h-6 w-6" />
            <div>
              <div className="font-semibold text-lg">รอการตั้งค่า API Key</div>
              <div className="text-sm opacity-80">กรุณาใส่ API Key เพื่อเริ่มใช้งาน</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};