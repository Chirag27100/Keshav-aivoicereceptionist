import { useState, useCallback, useEffect } from 'react';
import { useVAD } from '../hooks/useVAD';

interface VoiceInterfaceProps {
  onTextSubmit: (text: string) => void;
  onAudioBlob: (blob: Blob) => void;
  isProcessing: boolean;
  isSpeaking: boolean;
  isTranscribing: boolean;
  isThinking: boolean;
}

type ModeStatus =
  | 'idle'           // not yet started
  | 'listening'      // VAD active, waiting for voice
  | 'voice_active'   // voice detected, recording
  | 'processing'     // transcribing or LLM thinking
  | 'speaking';      // KEVA is speaking

const STATUS_LABEL: Record<ModeStatus, string> = {
  idle: 'Press to start listening',
  listening: 'Listening... speak anytime',
  voice_active: 'Heard you — recording',
  processing: 'Processing...',
  speaking: 'KEVA is speaking',
};

export function VoiceInterface({
  onTextSubmit,
  onAudioBlob,
  isProcessing,
  isSpeaking,
  isTranscribing,
  isThinking,
}: VoiceInterfaceProps) {
  const [textInput, setTextInput] = useState('');
  const [mode, setMode] = useState<ModeStatus>('idle');
  const [vadActive, setVadActive] = useState(false);

  const { startListening, stopListening, isListening, isVoiceActive } = useVAD({
    onSpeechStart: () => setMode('voice_active'),
    onSpeechEnd: (blob) => {
      setMode('processing');
      onAudioBlob(blob);
    },
    silenceThresholdMs: 1400, // 1.4s silence = done speaking
    minSpeechMs: 250,
  });

  // Sync status label with what's actually happening
  useEffect(() => {
    if (isSpeaking) {
      setMode('speaking');
    } else if (isProcessing) {
      setMode('processing');
    } else if (isVoiceActive) {
      setMode('voice_active');
    } else if (isListening) {
      setMode('listening');
    } else {
      setMode('idle');
    }
  }, [isSpeaking, isProcessing, isVoiceActive, isListening]);

  // When KEVA finishes speaking, resume listening automatically
  useEffect(() => {
    if (!isSpeaking && !isProcessing && vadActive && !isListening) {
      startListening();
    }
  }, [isSpeaking, isProcessing, vadActive, isListening, startListening]);

  const toggleVAD = useCallback(async () => {
    if (vadActive) {
      stopListening();
      setVadActive(false);
      setMode('idle');
    } else {
      setVadActive(true);
      await startListening();
    }
  }, [vadActive, startListening, stopListening]);

  const handleTextSubmit = () => {
    const trimmed = textInput.trim();
    if (!trimmed || isProcessing) return;
    onTextSubmit(trimmed);
    setTextInput('');
  };

  // Mic button visual states
  const micButtonClass = (() => {
    if (mode === 'voice_active')
      return 'bg-error scale-110 shadow-lg shadow-red-500/30';
    if (mode === 'speaking')
      return 'bg-accent-skin/30 border-2 border-accent-skin cursor-default';
    if (mode === 'processing')
      return 'bg-accent-gold/20 border-2 border-accent-gold/40 cursor-wait';
    if (mode === 'listening')
      return 'bg-accent-gold/90 hover:bg-accent-gold scale-105 shadow-lg shadow-accent-gold/20';
    // idle
    return 'bg-gradient-to-br from-accent-gold to-accent-skin hover:scale-105';
  })();

  return (
    <div className="space-y-4">
      {/* Status + Mic */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-text-muted text-xs tracking-widest uppercase min-h-[16px]">
          {STATUS_LABEL[mode]}
        </p>

        <div className="relative">
          {/* Outer pulse ring — listening */}
          {mode === 'listening' && (
            <>
              <span className="absolute inset-[-8px] rounded-full bg-accent-gold/20 animate-ping" />
              <span className="absolute inset-[-4px] rounded-full bg-accent-gold/10 animate-pulse" />
            </>
          )}

          {/* Tight pulse ring — voice active (talking) */}
          {mode === 'voice_active' && (
            <>
              <span className="absolute inset-[-6px] rounded-full bg-error/30 animate-ping" />
              <span className="absolute inset-[-3px] rounded-full bg-error/20 animate-pulse" />
            </>
          )}

          <button
            onClick={toggleVAD}
            disabled={mode === 'processing' || mode === 'speaking'}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${micButtonClass} ${
              mode === 'processing' || mode === 'speaking'
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
            title={vadActive ? 'Click to stop listening' : 'Click to start listening'}
          >
            {mode === 'speaking' ? (
              // Animated waveform bars while KEVA speaks
              <div className="flex items-end gap-[3px]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="w-[3px] bg-accent-skin rounded-full animate-wave_dot"
                    style={{
                      height: '16px',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            ) : mode === 'processing' ? (
              // Spinner while thinking
              <svg
                className="w-8 h-8 text-accent-gold animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : mode === 'voice_active' ? (
              // Red square = recording
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              // Mic icon — idle or listening
              <svg
                className={`w-8 h-8 ${vadActive ? 'text-bg-primary' : 'text-bg-primary'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mode hint */}
        <p className="text-text-muted/50 text-[10px] tracking-wider">
          {vadActive
            ? isTranscribing
              ? 'Transcribing...'
              : isThinking
              ? 'Thinking...'
              : 'Auto-detecting your voice'
            : 'Click mic to activate hands-free mode'}
        </p>
      </div>

      {/* Text fallback */}
      <div className="flex gap-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
          placeholder="Or type a message..."
          disabled={isProcessing}
          className="flex-1 bg-bg-surface border border-border-custom rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent-gold/40 transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleTextSubmit}
          disabled={isProcessing || !textInput.trim()}
          className="px-4 py-3 rounded-xl bg-accent-gold/15 border border-accent-gold/20 text-accent-gold text-sm hover:bg-accent-gold/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
