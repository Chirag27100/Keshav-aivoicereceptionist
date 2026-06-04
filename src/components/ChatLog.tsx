import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';

interface ChatLogProps {
  messages: ChatMessage[];
  isThinking: boolean;
}

export function ChatLog({ messages, isThinking }: ChatLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (messages.length === 0 && !isThinking) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-3 opacity-60">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-accent-gold/20 to-accent-skin/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-text-muted text-sm font-body">
            Tap the mic or type below to start talking with KEVA
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isThinking && <ThinkingIndicator />}
      <div ref={endRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const displayText = message.content.replace(/```json[\s\S]*?```/g, '').trim();

  return (
    <div
      className={`flex animate-fade_in_up ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-accent-gold/15 border border-accent-gold/20 text-text-primary rounded-br-md'
            : 'bg-bg-surface border border-border-custom text-text-primary rounded-bl-md'
        }`}
      >
        {!isUser && (
          <span className="text-accent-gold text-xs font-semibold block mb-1">KEVA</span>
        )}
        {displayText || message.content}
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-start animate-fade_in_up">
      <div className="bg-bg-surface border border-border-custom rounded-2xl rounded-bl-md px-4 py-3">
        <span className="text-accent-gold text-xs font-semibold block mb-1.5">KEVA</span>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-accent-gold/60 animate-wave_dot"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
