import { useState } from "react";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { AudioUploader, TranscriptionResult } from "@/components/AudioUploader";
import { TranscriptionResult as TranscriptionResultComponent } from "@/components/TranscriptionResult";
import { TranscriptionHistory } from "@/components/TranscriptionHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mic, Sparkles, Zap, Shield, Globe } from "lucide-react";

const Index = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [apiProvider, setApiProvider] = useState<"openai" | "gemini">("openai");
  const [currentResult, setCurrentResult] = useState<TranscriptionResult | null>(null);

  const handleTranscriptionResult = (result: TranscriptionResult) => {
    setCurrentResult(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Navigation Header */}
      <nav className="border-b bg-card/95 backdrop-blur-xl sticky top-0 z-50 shadow-custom-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-primary rounded-2xl shadow-custom-md">
                <Mic className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Smart Transcriber Pro
                </h1>
                <p className="text-muted-foreground font-medium">
                  Premium Voice2Text Contact Center • AI-Powered
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {apiKey && (
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-success/20 to-success/10 text-success rounded-full border-2 border-success/30 shadow-custom-sm">
                  <Sparkles className="h-5 w-5" />
                  <span className="hidden sm:inline font-semibold">{apiProvider === "gemini" ? "Gemini Ready" : "OpenAI Ready"}</span>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">ความเร็วสูง</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full border border-success/20">
              <Shield className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">ปลอดภัย</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
              <Globe className="h-4 w-4 text-accent-foreground" />
              <span className="text-sm font-medium">หลายภาษา</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            แปลงเสียงเป็นข้อความด้วย AI ที่ทันสมัยที่สุด
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            รองรับการตรวจจับภาษาอัตโนมัติ ความแม่นยำสูง และประมวลผลรวดเร็ว
          </p>
        </div>
      </section>

      {/* Main Layout */}
      <main className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-8">
            {/* API Key Section */}
            <div className="animate-fade-in">
              <ApiKeyInput 
                apiKey={apiKey} 
                onApiKeyChange={setApiKey}
                apiProvider={apiProvider}
                onProviderChange={setApiProvider}
              />
            </div>

            {/* Upload Section */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <AudioUploader
                disabled={!apiKey}
                onTranscriptionResult={handleTranscriptionResult}
                apiKey={apiKey}
                apiProvider={apiProvider}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-8">
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

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-primary/20 shadow-custom-md">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">ประมวลผลเร็ว</h3>
            <p className="text-muted-foreground">แปลงไฟล์เสียงเป็นข้อความภายในไม่กี่วินาที</p>
          </div>
          
          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-success/20 shadow-custom-md">
            <div className="w-12 h-12 bg-gradient-to-r from-success to-success/80 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">รองรับหลายภาษา</h3>
            <p className="text-muted-foreground">ตรวจจับและแปลงภาษาไทย อังกฤษ และญี่ปุ่นอัตโนมัติ</p>
          </div>
          
          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-accent/20 shadow-custom-md">
            <div className="w-12 h-12 bg-gradient-accent rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">ความปลอดภัยสูง</h3>
            <p className="text-muted-foreground">ข้อมูลของคุณได้รับการปกป้องด้วยมาตรฐานสูงสุด</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">Smart Transcriber Pro</span>
            </div>
            <p className="text-muted-foreground">
              Powered by{" "}
              <span className="font-semibold text-primary">Gemini AI</span>
              {" • "}
              สร้างโดย{" "}
              <span className="font-semibold bg-gradient-accent bg-clip-text text-transparent">Smart Transcriber Team</span>
            </p>
            <p className="text-sm text-muted-foreground">
              รองรับการแปลงเสียงเป็นข้อความในหลายภาษาอัตโนมัติ • ความแม่นยำสูง • ประมวลผลรวดเร็ว
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;