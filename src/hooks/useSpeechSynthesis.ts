import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  queueSentence: (sentence: string) => void;
  stop: () => void;
  isSpeaking: boolean;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const queueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Preload and cache the best available voice on mount
  useEffect(() => {
    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Priority: natural-sounding English voices
      const priority = [
        'google uk english female',
        'samantha',           // macOS
        'karen',              // macOS AU
        'victoria',           // macOS
        'microsoft aria',     // Windows 11 neural
        'microsoft jenny',    // Windows 11 neural
        'microsoft zira',     // Windows fallback
      ];

      let found: SpeechSynthesisVoice | undefined;
      for (const name of priority) {
        found = voices.find((v) => v.name.toLowerCase().includes(name));
        if (found) break;
      }

      // Fallback: any english voice that doesn't say "male"
      voiceRef.current =
        found ??
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            !v.name.toLowerCase().includes('male'),
        ) ??
        voices.find((v) => v.lang.startsWith('en')) ??
        voices[0] ??
        null;
    };

    loadVoice();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoice);
    return () =>
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoice);
  }, []);

  const playNext = useCallback(() => {
    if (isPlayingRef.current || queueRef.current.length === 0) {
      if (queueRef.current.length === 0) {
        setIsSpeaking(false);
        isPlayingRef.current = false;
      }
      return;
    }

    const text = queueRef.current.shift()!;
    if (!text.trim()) {
      playNext();
      return;
    }

    // Strip markdown/JSON artifacts before speaking
    const clean = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[*_`#~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) {
      playNext();
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(clean);
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.rate = 1.0;   // natural speed — 0.95 felt slow
    utterance.pitch = 1.05;
    utterance.volume = 1;

    utterance.onend = () => {
      isPlayingRef.current = false;
      // Tiny gap between sentences — sounds more natural
      setTimeout(playNext, 60);
    };

    utterance.onerror = () => {
      isPlayingRef.current = false;
      setTimeout(playNext, 60);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Queue a sentence (called as each sentence streams in)
  const queueSentence = useCallback(
    (sentence: string) => {
      queueRef.current.push(sentence);
      playNext(); // starts playing immediately if not already playing
    },
    [playNext],
  );

  // Speak a full block at once (for text input fallback)
  const speak = useCallback(
    (text: string) => {
      window.speechSynthesis.cancel();
      queueRef.current = [];
      isPlayingRef.current = false;

      // Split into sentences and queue
      const sentences = text
        .replace(/([.!?])\s+/g, '$1|||')
        .split('|||')
        .map((s) => s.trim())
        .filter(Boolean);

      for (const s of sentences) {
        queueRef.current.push(s);
      }
      playNext();
    },
    [playNext],
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    queueRef.current = [];
    isPlayingRef.current = false;
    setIsSpeaking(false);
  }, []);

  return { speak, queueSentence, stop, isSpeaking };
}
