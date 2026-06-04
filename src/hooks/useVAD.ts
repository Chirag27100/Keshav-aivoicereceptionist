import { useCallback, useRef, useState } from 'react';

interface UseVADOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: (blob: Blob) => void;
  silenceThresholdMs?: number; // how long silence before auto-stop (default 1500ms)
  minSpeechMs?: number;        // minimum speech before it counts (default 300ms)
}

interface UseVADReturn {
  startListening: () => Promise<void>;
  stopListening: () => void;
  isListening: boolean;
  isVoiceActive: boolean;
}

/**
 * Voice Activity Detection (VAD) hook
 *
 * Uses Web Audio API AnalyserNode to watch amplitude levels in real time.
 * Automatically starts recording when voice is detected and stops after silence.
 * No manual press/release needed.
 */
export function useVAD({
  onSpeechStart,
  onSpeechEnd,
  silenceThresholdMs = 1500,
  minSpeechMs = 300,
}: UseVADOptions = {}): UseVADReturn {
  const [isListening, setIsListening] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechStartTimeRef = useRef<number | null>(null);
  const isCapturingRef = useRef(false);
  const isListeningRef = useRef(false);

  // Amplitude threshold — calibrated for typical mic levels
  // 0–255 scale from AnalyserNode (getByteFrequencyData)
  const VOICE_THRESHOLD = 18;      // below = silence
  const VOICE_CONFIRM_THRESHOLD = 22; // above = confirmed speech

  const stopCapture = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
    isCapturingRef.current = false;
    setIsVoiceActive(false);
    speechStartTimeRef.current = null;
  }, []);

  const startCapture = useCallback(() => {
    if (!streamRef.current || isCapturingRef.current) return;

    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm',
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const duration = speechStartTimeRef.current
        ? Date.now() - speechStartTimeRef.current
        : 0;
      if (duration >= minSpeechMs && chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onSpeechEnd?.(blob);
      }
      chunksRef.current = [];
    };

    recorderRef.current = recorder;
    recorder.start(100); // collect chunks every 100ms
    isCapturingRef.current = true;
    speechStartTimeRef.current = Date.now();
    setIsVoiceActive(true);
    onSpeechStart?.();
  }, [minSpeechMs, onSpeechEnd, onSpeechStart]);

  const tick = useCallback(() => {
    if (!isListeningRef.current) return;

    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Average amplitude across all frequency bins
    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

    if (avg > VOICE_CONFIRM_THRESHOLD) {
      // Voice detected
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (!isCapturingRef.current) {
        startCapture();
      }
    } else if (avg < VOICE_THRESHOLD && isCapturingRef.current) {
      // Silence detected — start countdown
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          stopCapture();
          silenceTimerRef.current = null;
        }, silenceThresholdMs);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [silenceThresholdMs, startCapture, stopCapture]);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Whisper's native rate — less resampling overhead
        },
      });

      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;       // smaller = faster FFT
      analyser.smoothingTimeConstant = 0.3; // react quickly to speech onset

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      streamRef.current = stream;
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      isListeningRef.current = true;
      setIsListening(true);

      rafRef.current = requestAnimationFrame(tick);
    } catch {
      console.error('Microphone access denied');
    }
  }, [tick]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setIsVoiceActive(false);

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    stopCapture();

    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    recorderRef.current = null;
  }, [stopCapture]);

  return { startListening, stopListening, isListening, isVoiceActive };
}
