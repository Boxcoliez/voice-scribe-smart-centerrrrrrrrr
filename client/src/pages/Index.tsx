import { useState } from "react";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { AudioUploader, TranscriptionResult } from "@/components/AudioUploader";
import { TranscriptionResult as TranscriptionResultComponent } from "@/components/TranscriptionResult";
import { TranscriptionHistory } from "@/components/TranscriptionHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mic, Sparkles, Zap, Shield, Globe, AudioLines } from "lucide-react";

const Index = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [currentResult, setCurrentResult] = useState<TranscriptionResult | null>(null);

  const handleTranscriptionResult = (result: TranscriptionResult) => {
    setCurrentResult(result);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <nav className="border-b border-border/60 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-professional">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 gradient-primary rounded-xl shadow-professional">
                <AudioLines className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Gemini Transcriber
                </h1>
                <p className="text-muted-foreground font-medium">
                  AI-Powered Audio to Text with Gemini
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {apiKey && (
                <div className="flex items-center gap-3 px-4 py-2 bg-success/10 text-success rounded-full border border-success/20 shadow-professional">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Gemini Ready</span>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="text-center space-y-6 mb-12 animate-fade-in">
          <div className="flex justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-full border border-primary/20 shadow-professional">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Gemini Powered</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-success/10 text-success rounded-full border border-success/20 shadow-professional">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-accent/10 text-accent rounded-full border border-accent/20 shadow-professional">
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">Multi-Language</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
            Audio Transcription with Gemini AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Upload your audio files and let Google's Gemini AI transcribe them into text with 
            exceptional accuracy and automatic language detection
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

            {/* Technology Information */}
            {apiKey && (
              <div className="animate-fade-in p-6 bg-primary/5 border border-primary/20 rounded-xl shadow-professional">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg mt-1">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary mb-2">
                      Gemini AI Transcription Technology
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Powered by Google Gemini 1.5 Flash model</p>
                      <p>• Direct audio file processing with multimodal AI</p>
                      <p>• Automatic language detection and transcription</p>
                      <p>• Maximum file size: 20MB</p>
                      <p>• Supported formats: MP3, WAV, M4A</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-professional">
            <div className="w-12 h-12 gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center shadow-professional">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Gemini AI Powered</h3>
            <p className="text-muted-foreground">Advanced multimodal AI for accurate transcription</p>
          </div>
          
          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-professional">
            <div className="w-12 h-12 bg-success rounded-xl mx-auto mb-4 flex items-center justify-center shadow-professional">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Multi-Language Support</h3>
            <p className="text-muted-foreground">Automatic detection and processing of multiple languages</p>
          </div>
          
          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-professional">
            <div className="w-12 h-12 gradient-accent rounded-xl mx-auto mb-4 flex items-center justify-center shadow-professional">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Secure Processing</h3>
            <p className="text-muted-foreground">Your audio files are processed securely with Google's infrastructure</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">Gemini Transcriber</span>
            </div>
            <p className="text-muted-foreground">
              Powered by{" "}
              <span className="font-semibold text-primary">Google Gemini AI</span>
              {" • "}
              Built for{" "}
              <span className="font-semibold gradient-accent bg-clip-text text-transparent">Professional Use</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Multi-language audio transcription • High accuracy • Lightning fast processing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;