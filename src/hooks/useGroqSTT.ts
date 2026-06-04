import { useCallback, useRef, useState } from 'react';

interface UseGroqSTTReturn {
  transcribe: (audioBlob: Blob) => Promise<string>;
  isTranscribing: boolean;
  error: string | null;
}

export function useGroqSTT(): UseGroqSTTReturn {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const transcribe = useCallback(async (audioBlob: Blob): Promise<string> => {
    setIsTranscribing(true);
    setError(null);
    abortRef.current = new AbortController();

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error('VITE_GROQ_API_KEY not set');

      // Convert to WAV-compatible format — Groq Whisper turbo is faster with webm
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      // whisper-large-v3-turbo: ~216ms median latency vs ~600ms for large-v3
      formData.append('model', 'whisper-large-v3-turbo');
      formData.append('language', 'en'); // skip language detection step — saves ~100ms
      formData.append('response_format', 'json');

      const response = await fetch(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}` },
          body: formData,
          signal: abortRef.current.signal,
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Whisper error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      return data.text?.trim() ?? '';
    } catch (err) {
      if ((err as Error).name === 'AbortError') return '';
      const message = err instanceof Error ? err.message : 'Transcription failed';
      setError(message);
      return '';
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  return { transcribe, isTranscribing, error };
}
