import { useState } from "react";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { AudioUploader, TranscriptionResult } from "@/components/AudioUploader";
import { TranscriptionResult as TranscriptionResultComponent } from "@/components/TranscriptionResult";
import { TranscriptionHistory } from "@/components/TranscriptionHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mic, Sparkles } from "lucide-react";

const Index = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [currentResult, setCurrentResult] = useState<TranscriptionResult | null>(null);

  const handleTranscriptionResult = (result: TranscriptionResult) => {
    setCurrentResult(result);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Navigation Header */}
      <nav className="border-b bg-card/90 backdrop-blur-md sticky top-0 z-50 shadow-custom-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-primary rounded-xl shadow-custom-md">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Smart Transcriber Pro
                </h1>
                <p className="text-sm text-muted-foreground">
                  Premium Voice2Text Contact Center
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {apiKey && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full border border-success/20">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-medium">พร้อมใช้งาน</span>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout with Tabs */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* API Key Section */}
            <div className="animate-fade-in">
              <ApiKeyInput 
                apiKey={apiKey} 
                onApiKeyChange={setApiKey} 
              />
            </div>

            {/* Upload Section */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <AudioUploader
                disabled={!apiKey}
                onTranscriptionResult={handleTranscriptionResult}
                apiKey={apiKey}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Result Section */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <TranscriptionResultComponent result={currentResult} />
            </div>

            {/* History Section */}
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <TranscriptionHistory currentResult={currentResult} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/70 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Powered by{" "}
              <span className="font-semibold text-primary">Gemini AI</span>
              {" • "}
              สร้างโดย{" "}
              <span className="font-semibold bg-gradient-accent bg-clip-text text-transparent">Smart Transcriber Team</span>
            </p>
            <p className="mt-1">
              รองรับการแปลงเสียงเป็นข้อความในหลายภาษาอัตโนมัติ
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;