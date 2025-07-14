import OpenAI from "openai";
import { writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface TranscriptionResult {
  id: string;
  fileName: string;
  text: string;
  language: string;
  duration: number;
  audioUrl: string;
  timestamp: Date;
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<TranscriptionResult> {
  try {
    // Create a unique filename and save the audio file temporarily
    const fileId = nanoid();
    const fileExtension = mimeType.includes('wav') ? 'wav' : 
                         mimeType.includes('m4a') ? 'm4a' : 'mp3';
    const tempFileName = `${fileId}.${fileExtension}`;
    const tempFilePath = path.join(process.cwd(), 'temp', tempFileName);
    
    // Ensure temp directory exists
    const fs = await import('fs/promises');
    try {
      await fs.mkdir(path.join(process.cwd(), 'temp'), { recursive: true });
    } catch (error) {
      // Directory might already exist, that's ok
    }
    
    // Write the audio buffer to a temporary file
    await writeFile(tempFilePath, audioBuffer);
    
    // Create a ReadStream for OpenAI
    const audioReadStream = await import('fs').then(fs => 
      fs.createReadStream(tempFilePath)
    );
    
    // Transcribe the audio with language detection
    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      response_format: "verbose_json",
      language: undefined // Let OpenAI auto-detect the language
    });
    
    // Clean up the temporary file
    try {
      await fs.unlink(tempFilePath);
    } catch (error) {
      console.warn('Could not delete temporary file:', error);
    }
    
    // Create audio URL for playback (in a real app, you'd use cloud storage)
    const audioUrl = `/api/audio/${fileId}`;
    
    const result: TranscriptionResult = {
      id: fileId,
      fileName: fileName,
      text: transcription.text,
      language: transcription.language || 'unknown',
      duration: transcription.duration || 0,
      audioUrl: audioUrl,
      timestamp: new Date()
    };
    
    return result;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

export function getLanguageName(languageCode: string): string {
  const languageMap: Record<string, string> = {
    'en': 'English',
    'th': 'ไทย (Thai)',
    'zh': '中文 (Chinese)',
    'ja': '日本語 (Japanese)',
    'ko': '한국어 (Korean)',
    'es': 'Español (Spanish)',
    'fr': 'Français (French)',
    'de': 'Deutsch (German)',
    'it': 'Italiano (Italian)',
    'pt': 'Português (Portuguese)',
    'ru': 'Русский (Russian)',
    'ar': 'العربية (Arabic)',
    'hi': 'हिन्दी (Hindi)',
  };
  
  return languageMap[languageCode] || languageCode.toUpperCase();
}