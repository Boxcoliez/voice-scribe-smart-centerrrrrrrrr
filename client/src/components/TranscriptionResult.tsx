import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Check, FileText, Play, Pause, Volume2, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TranscriptionResult as TranscriptionResultType } from "./AudioUploader";

interface TranscriptionResultProps {
  result: TranscriptionResultType | null;
}

export const TranscriptionResult = ({ result }: TranscriptionResultProps) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  if (!result) {
    return (
      <Card className="w-full shadow-professional border-border/50">
        <CardHeader className="text-center py-12">
          <div className="mx-auto w-16 h-16 gradient-primary rounded-full flex items-center justify-center mb-6 shadow-professional">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-foreground text-2xl font-semibold">Transcription Result</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Your transcribed text will appear here with audio playback controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/20">
            <div className="text-center space-y-4">
              <div className="relative">
                <Languages className="h-12 w-12 mx-auto text-primary/60" />
              </div>
              <p className="text-xl font-medium">Waiting for audio upload</p>
              <p className="text-sm opacity-70">Upload an audio file to begin transcription</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: "Transcription text copied successfully",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy text to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadAsText = () => {
    const content = `Audio File: ${result.fileName}
Language: ${result.language}
Timestamp: ${result.timestamp.toLocaleString()}
Duration: ${result.duration ? Math.round(result.duration) + 's' : 'Unknown'}

Transcription:
${result.text}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${result.fileName.replace(/\.[^/.]+$/, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Complete",
      description: "Transcription file downloaded successfully",
    });
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLanguageColor = (language?: string) => {
    switch (language) {
      case 'Thai': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'English': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'Japanese': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
      case 'Chinese': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <Card className="w-full shadow-professional animate-fade-in border-success/30 bg-success/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-success rounded-lg shadow-professional">
            <Check className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-success text-xl font-semibold">Transcription Complete</CardTitle>
          {result.language && (
            <Badge className={`font-medium px-3 py-1 border ${getLanguageColor(result.language)}`}>
              {result.language}
            </Badge>
          )}
        </div>
        <CardDescription className="text-base">
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
            <span>📁 {result.fileName}</span>
            <span>•</span>
            <span>🕒 {result.timestamp.toLocaleString()}</span>
            {result.duration && (
              <>
                <span>•</span>
                <span>⏱️ {formatDuration(result.duration)}</span>
              </>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {result.audioUrl && (
          <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl border border-border/30 shadow-professional">
            <Button
              onClick={toggleAudioPlayback}
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 border-2 border-primary/20 focus-ring"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Volume2 className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">Play original audio</span>
            <audio
              ref={audioRef}
              src={result.audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            />
          </div>
        )}

        <div className="relative">
          <Textarea
            value={result.text}
            readOnly
            className="min-h-[150px] resize-none font-medium text-base leading-relaxed bg-background/50 border-2 border-primary/20 focus:border-primary/40 rounded-xl p-4 focus-ring"
            placeholder="Transcribed text will appear here..."
          />
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              {result.text.length} characters
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="lg"
            className="flex items-center gap-3 px-6 py-3 hover:bg-primary/10 border-2 border-primary/20 hover:border-primary/40 transition-all duration-200 focus-ring"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" />
                <span className="font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="font-medium">Copy Text</span>
              </>
            )}
          </Button>
          
          <Button
            onClick={downloadAsText}
            size="lg"
            className="gradient-primary hover:opacity-90 text-white font-medium px-6 py-3 shadow-professional transition-all duration-200 focus-ring"
          >
            <Download className="h-4 w-4 mr-2" />
            Download .txt
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="text-center p-3 bg-background/50 rounded-lg border border-border/20">
            <p className="text-sm text-muted-foreground">Word Count</p>
            <p className="text-lg font-bold text-primary">{result.text.split(' ').length}</p>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg border border-border/20">
            <p className="text-sm text-muted-foreground">Language</p>
            <p className="text-lg font-bold text-primary">{result.language || 'Unknown'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};