import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Check, AlertCircle, Sparkles } from "lucide-react";
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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const hasGeminiModels = data.models?.some((model: any) => 
          model.name?.includes('gemini')
        );
        return hasGeminiModels;
      }
      
      return false;
    } catch (error) {
      console.error('API validation error:', error);
      return false;
    }
  };

  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter your Gemini API Key",
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
          title: "Success",
          description: "Gemini API Key validated successfully",
        });
      } else {
        toast({
          title: "Invalid API Key",
          description: "Please check your Gemini API Key and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Unable to validate API Key",
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
      title: "API Key Removed",
      description: "You can enter a new API Key",
    });
  };

  return (
    <Card className="w-full shadow-professional border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="p-2 gradient-primary rounded-lg">
            <Key className="h-5 w-5 text-white" />
          </div>
          Gemini API Configuration
        </CardTitle>
        <CardDescription className="text-base">
          Enter your Google Gemini API Key to enable audio transcription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <Label htmlFor="apiKey" className="text-sm font-medium">Gemini API Key</Label>
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-3">
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Gemini API Key..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="font-mono text-sm h-11 border-2 focus:border-primary/50 focus-ring"
              />
              {apiKey ? (
                <Button 
                  onClick={handleClearApiKey}
                  variant="outline" 
                  size="default"
                  className="shrink-0 h-11 px-4 border-2 border-destructive/20 text-destructive hover:bg-destructive/10 focus-ring"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              ) : (
                <Button 
                  onClick={handleSaveApiKey}
                  disabled={!tempApiKey.trim() || isValidating}
                  size="default"
                  className="shrink-0 h-11 px-6 gradient-primary hover:opacity-90 text-white font-medium focus-ring"
                >
                  {isValidating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Validating...
                    </div>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Validate & Save
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              Get your free API Key from Google AI Studio (aistudio.google.com)
            </p>
          </div>
        </div>
        
        {apiKey ? (
          <div className="flex items-center gap-3 p-4 bg-success/10 text-success rounded-lg border border-success/20">
            <Check className="h-5 w-5" />
            <div>
              <div className="font-medium">Gemini API Key Active</div>
              <div className="text-sm opacity-80">Ready for audio transcription</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-warning/10 text-warning rounded-lg border border-warning/20">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-medium">API Key Required</div>
              <div className="text-sm opacity-80">Please enter your Gemini API Key to continue</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};