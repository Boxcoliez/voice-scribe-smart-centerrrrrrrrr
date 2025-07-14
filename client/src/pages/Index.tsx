import { useState } from "react";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { AudioUploader, TranscriptionResult } from "@/components/AudioUploader";
import { TranscriptionResult as TranscriptionResultComponent } from "@/components/TranscriptionResult";
import { TranscriptionHistory } from "@/components/TranscriptionHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mic, Sparkles, Zap, Shield, Globe } from "lucide-react";

const Index = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [currentResult, setCurrentResult] = useState<TranscriptionResult | null>(null);

  const handleTranscriptionResult = (result: TranscriptionResult) => {
    setCurrentResult(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation Header */}
      <nav className="border-b border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl shadow-soft">
                <Mic className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient-primary">
                  AI Transcription Studio
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Professional Audio-to-Text Service
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {apiKey && (
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/30 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-700 shadow-soft">
                  <Sparkles className="h-5 w-5" />
                  <span className="hidden sm:inline font-semibold">Gemini Ready</span>
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
            <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full border border-blue-200 dark:border-blue-700 shadow-soft">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-full border border-emerald-200 dark:border-emerald-700 shadow-soft">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Enterprise Secure</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-800/30 rounded-full border border-violet-200 dark:border-violet-700 shadow-soft">
              <Globe className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-semibold text-violet-800 dark:text-violet-200">Multi-Language</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gradient-primary mb-8 leading-tight">
            Professional Audio Transcription
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Advanced AI-powered speech-to-text service with automatic language detection, 
            exceptional accuracy, and enterprise-grade processing capabilities
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

            {/* Hybrid Transcription Information */}
            {apiKey && (
              <div className="animate-fade-in p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg mt-1">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      Hybrid AI Transcription Technology
                    </h3>
                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <p>• Powered by Whisper AI for audio-to-text conversion</p>
                      <p>• Enhanced and refined by Gemini AI processing</p>
                      <p>• Maximum file size: 25MB</p>
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
          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-primary/20 shadow-custom-md">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Fast Processing</h3>
            <p className="text-muted-foreground">Convert audio files to text within seconds</p>
          </div>
          
          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-success/20 shadow-custom-md">
            <div className="w-12 h-12 bg-gradient-to-r from-success to-success/80 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Multi-Language Support</h3>
            <p className="text-muted-foreground">Automatic detection and processing of Thai, English, and Japanese</p>
          </div>
          
          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-accent/20 shadow-custom-md">
            <div className="w-12 h-12 bg-gradient-accent rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">Enterprise Security</h3>
            <p className="text-muted-foreground">Your data is protected with the highest security standards</p>
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
              <span className="font-bold text-lg">AI Transcription Studio</span>
            </div>
            <p className="text-muted-foreground">
              Powered by{" "}
              <span className="font-semibold text-primary">Gemini AI</span>
              {" • "}
              Built by{" "}
              <span className="font-semibold bg-gradient-accent bg-clip-text text-transparent">Professional Development Team</span>
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