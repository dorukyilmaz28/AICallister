import { useState, useEffect, useCallback } from 'react';

export function useSpeechSynthesis(language: string = 'tr-TR') {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Tarayıcı desteği kontrolü
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'speechSynthesis' in window;
      setIsSupported(supported);

      if (supported) {
        // Sesleri yükle
        const loadVoices = () => {
          const availableVoices = window.speechSynthesis.getVoices();
          setVoices(availableVoices);

          // Türkçe ses bul
          const turkishVoice = availableVoices.find(voice => 
            voice.lang.startsWith(language.split('-')[0])
          );
          
          if (turkishVoice) {
            setSelectedVoice(turkishVoice);
            console.log('[Speech Synthesis] Turkish voice found:', turkishVoice.name);
          } else {
            // Yoksa varsayılan sesi kullan
            setSelectedVoice(availableVoices[0] || null);
            console.log('[Speech Synthesis] Using default voice');
          }
        };

        loadVoices();
        
        // Sesler yüklendiğinde tekrar kontrol et
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }
      }
    }
  }, [language]);

  const speak = useCallback((text: string, options?: {
    rate?: number;  // Hız (0.5 - 2.0)
    pitch?: number; // Ton (0.0 - 2.0)
    volume?: number; // Ses seviyesi (0.0 - 1.0)
  }) => {
    if (!isSupported) {
      console.warn('[Speech Synthesis] Not supported');
      return;
    }

    // Devam eden konuşmayı durdur
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Ses ayarları
    utterance.lang = language;
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('[Speech Synthesis] Started speaking');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('[Speech Synthesis] Finished speaking');
    };

    utterance.onerror = (event) => {
      console.error('[Speech Synthesis] Error:', event);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, language]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      console.log('[Speech Synthesis] Stopped');
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.pause();
      console.log('[Speech Synthesis] Paused');
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.resume();
      console.log('[Speech Synthesis] Resumed');
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported,
    voices,
    selectedVoice,
    setSelectedVoice
  };
}

