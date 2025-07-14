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
  apiProvider: "openai" | "gemini";
  onProviderChange: (provider: "openai" | "gemini") => void;
}

export const ApiKeyInput = ({ apiKey, onApiKeyChange, apiProvider, onProviderChange }: ApiKeyInputProps) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateApiKey = async (key: string, provider: "openai" | "gemini"): Promise<boolean> => {
    try {
      if (provider === "openai") {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        });
        return response.ok;
      } else if (provider === "gemini") {
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
      }
      return false;
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
      const isValid = await validateApiKey(tempApiKey.trim(), apiProvider);
      
      if (isValid) {
        onApiKeyChange(tempApiKey.trim());
        toast({
          title: "สำเร็จ! 🎉",
          description: `${apiProvider === "gemini" ? "Gemini" : "OpenAI"} API Key ถูกต้อง พร้อมใช้งาน`,
        });
      } else {
        toast({
          title: "API Key ไม่ถูกต้อง",
          description: `ไม่สามารถเชื่อมต่อกับ ${apiProvider === "gemini" ? "Gemini" : "OpenAI"} ได้`,
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

  const getProviderInfo = () => {
    if (apiProvider === "gemini") {
      return {
        name: "Google Gemini",
        icon: <Sparkles className="h-5 w-5 text-orange-600" />,
        placeholder: "AIzaSy...",
        description: "⚠️ Gemini ยังไม่รองรับการแปลงเสียงโดยตรง กรุณาใช้ OpenAI",
        keyGuide: "หมายเหตุ: สำหรับ transcription ให้ใช้ OpenAI Whisper แทน"
      };
    } else {
      return {
        name: "OpenAI",
        icon: <Brain className="h-5 w-5 text-green-600" />,
        placeholder: "sk-...",
        description: "ใส่ OpenAI API Key เพื่อใช้งาน Whisper transcription",
        keyGuide: "รับ API Key จาก platform.openai.com"
      };
    }
  };

  const providerInfo = getProviderInfo();

  return (
    <Card className="w-full shadow-custom-lg border-2 border-primary/20 bg-gradient-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Key className="h-6 w-6 text-primary" />
          API Configuration
        </CardTitle>
        <CardDescription className="text-base">
          เลือก AI provider และใส่ API Key เพื่อเริ่มใช้งาน transcription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-3">
          <Label htmlFor="provider" className="text-base font-semibold">AI Provider</Label>
          <Select value={apiProvider} onValueChange={onProviderChange}>
            <SelectTrigger className="w-full h-12 text-lg border-2 border-primary/20">
              <SelectValue placeholder="เลือก AI Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini" className="h-12">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">Google Gemini</div>
                    <div className="text-sm text-orange-600">ยังไม่รองรับ audio transcription</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="openai" className="h-12">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-semibold">OpenAI Whisper</div>
                    <div className="text-sm text-muted-foreground">High accuracy</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

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