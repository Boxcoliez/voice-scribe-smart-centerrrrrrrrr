import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
}

export const ApiKeyInput = ({ apiKey, onApiKeyChange }: ApiKeyInputProps) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

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
    
    // Simulate API validation
    setTimeout(() => {
      onApiKeyChange(tempApiKey);
      setIsValidating(false);
      toast({
        title: "สำเร็จ",
        description: "API Key ถูกต้อง พร้อมใช้งาน",
        variant: "default",
      });
    }, 1000);
  };

  const handleClearApiKey = () => {
    setTempApiKey("");
    onApiKeyChange("");
    toast({
      title: "ลบ API Key แล้ว",
      description: "คุณสามารถใส่ API Key ใหม่ได้",
    });
  };

  return (
    <Card className="w-full shadow-custom-sm border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Key className="h-5 w-5 text-primary" />
          Gemini API Key
        </CardTitle>
        <CardDescription>
          ใส่ API Key ของ Google Gemini เพื่อเริ่มใช้งาน transcription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="flex gap-2">
            <Input
              id="apiKey"
              type="password"
              placeholder="ใส่ Gemini API Key ของคุณ..."
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="font-mono"
            />
            {apiKey ? (
              <Button 
                onClick={handleClearApiKey}
                variant="outline" 
                size="icon"
                className="shrink-0"
              >
                <AlertCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSaveApiKey}
                disabled={!tempApiKey.trim() || isValidating}
                className="shrink-0"
              >
                {isValidating ? (
                  <div className="animate-pulse-slow">กำลังตรวจสอบ...</div>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    บันทึก
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {apiKey && (
          <div className="flex items-center gap-2 text-sm text-success">
            <Check className="h-4 w-4" />
            API Key พร้อมใช้งาน
          </div>
        )}
        
        {!apiKey && (
          <div className="flex items-center gap-2 text-sm text-warning">
            <AlertCircle className="h-4 w-4" />
            กรุณาใส่ API Key ก่อนเริ่มใช้งาน
          </div>
        )}
      </CardContent>
    </Card>
  );
};