import { useState, useEffect, useCallback } from 'react';

// Web Speech API TypeScript definitions
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export function useSpeechRecognition(language: string = 'tr-TR') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tarayıcı desteği kontrolü
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setIsSupported(supported);
      
      if (!supported) {
        setError('Tarayıcınız ses tanımayı desteklemiyor. Chrome, Edge veya Safari kullanın.');
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Ses tanıma desteklenmiyor');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false; // Tek seferde dinle
      recognition.interimResults = true; // Ara sonuçları göster
      recognition.lang = language; // Türkçe veya İngilizce

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;
        
        setTranscript(transcriptResult);
        
        // Final result (konuşma bitti)
        if (event.results[current].isFinal) {
          console.log('[Speech] Final transcript:', transcriptResult);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('[Speech] Error:', event.error);
        setError(`Hata: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('[Speech] Listening ended');
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
      setError(null);
      console.log('[Speech] Listening started...');

    } catch (err: any) {
      console.error('[Speech] Start error:', err);
      setError('Mikrofon başlatılamadı');
      setIsListening(false);
    }
  }, [isSupported, language]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    console.log('[Speech] Stopped');
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  };
}

