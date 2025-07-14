import { useState } from "react";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { AudioUploader, TranscriptionResult } from "@/components/AudioUploader";
import { TranscriptionResult as TranscriptionResultComponent } from "@/components/TranscriptionResult";
import { TranscriptionHistory } from "@/components/TranscriptionHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Mic, Sparkles } from "lucide-react";

const Index = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [currentResult, setCurrentResult] = useState<TranscriptionResult | null>(null);

  const handleTranscriptionResult = (result: TranscriptionResult) => {
    setCurrentResult(result);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="transcriber-theme">
      <div className="min-h-screen bg-gradient-secondary">
        {/* Header */}
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Smart Transcriber
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Voice2Text Contact Center
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {apiKey && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">พร้อมใช้งาน</span>
                  </div>
                )}
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* API Key Section */}
          <section className="animate-fade-in">
            <ApiKeyInput 
              apiKey={apiKey} 
              onApiKeyChange={setApiKey} 
            />
          </section>

          {/* Upload Section */}
          <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <AudioUploader
              disabled={!apiKey}
              onTranscriptionResult={handleTranscriptionResult}
              apiKey={apiKey}
            />
          </section>

          {/* Result Section */}
          <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <TranscriptionResultComponent result={currentResult} />
          </section>

          {/* History Section */}
          <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <TranscriptionHistory currentResult={currentResult} />
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t bg-card/50 backdrop-blur-sm mt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Powered by{" "}
                <span className="font-semibold text-primary">Gemini AI</span>
                {" • "}
                สร้างโดย{" "}
                <span className="font-semibold">Smart Transcriber Team</span>
              </p>
              <p className="mt-1">
                รองรับการแปลงเสียงเป็นข้อความในหลายภาษา
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Index;