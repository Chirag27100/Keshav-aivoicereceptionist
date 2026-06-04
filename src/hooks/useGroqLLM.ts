import { useState, useCallback, useRef } from 'react';
import { KEVA_SYSTEM_PROMPT } from '../lib/kevaSystemPrompt';
import type { ChatMessage } from '../types';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface UseGroqLLMReturn {
  sendMessage: (
    userText: string,
    onChunk?: (sentence: string) => void,
  ) => Promise<string>;
  chatHistory: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  isThinking: boolean;
  error: string | null;
  clearHistory: () => void;
}

// Split streamed text into complete spoken sentences
function extractSentences(buffer: string): { sentences: string[]; remainder: string } {
  // Split on . ! ? followed by space or end — but keep abbreviations safe
  const sentenceEnd = /([.!?])\s+(?=[A-Z"'])|([.!?])$/gm;
  const sentences: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = sentenceEnd.exec(buffer)) !== null) {
    const end = match.index + match[0].trimEnd().length;
    const sentence = buffer.slice(lastIndex, end).trim();
    if (sentence.split(' ').length >= 3) {
      // Only speak sentences with ≥3 words to avoid speaking mid-word chunks
      sentences.push(sentence);
      lastIndex = match.index + match[0].length;
    }
  }

  return { sentences, remainder: buffer.slice(lastIndex) };
}

export function useGroqLLM(): UseGroqLLMReturn {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<ChatMessage[]>([]);

  const addMessage = useCallback((msg: ChatMessage) => {
    setChatHistory((prev) => {
      const next = [...prev, msg];
      historyRef.current = next;
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setChatHistory([]);
    historyRef.current = [];
  }, []);

  const sendMessage = useCallback(
    async (
      userText: string,
      onChunk?: (sentence: string) => void,
    ): Promise<string> => {
      setIsThinking(true);
      setError(null);

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: userText,
        timestamp: Date.now(),
      };
      addMessage(userMsg);

      try {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!apiKey) throw new Error('VITE_GROQ_API_KEY not set');

        const messages: GroqMessage[] = [
          { role: 'system', content: KEVA_SYSTEM_PROMPT },
          ...historyRef.current.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ];

        const response = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages,
              max_tokens: 200,
              temperature: 0.6,
              stream: true, // ← KEY CHANGE: streaming enabled
            }),
          },
        );

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Groq LLM error ${response.status}: ${errText}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let speakBuffer = '';

        // Read the SSE stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

          for (const line of lines) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;

            try {
              const json = JSON.parse(data);
              const token = json.choices?.[0]?.delta?.content ?? '';
              if (!token) continue;

              fullText += token;
              speakBuffer += token;

              // Extract complete sentences and fire them for immediate TTS
              if (onChunk) {
                const { sentences, remainder } = extractSentences(speakBuffer);
                for (const s of sentences) {
                  onChunk(s);
                }
                speakBuffer = remainder;
              }
            } catch {
              // malformed SSE chunk — skip
            }
          }
        }

        // Speak any leftover text after stream ends
        if (onChunk && speakBuffer.trim().split(' ').length >= 2) {
          onChunk(speakBuffer.trim());
        }

        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: fullText,
          timestamp: Date.now(),
        };
        addMessage(assistantMsg);

        return fullText;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'LLM request failed';
        setError(message);
        const fallback =
          "I'm having a little trouble right now. Please try again or call us at 080 2360 3146.";
        if (onChunk) onChunk(fallback);
        return fallback;
      } finally {
        setIsThinking(false);
      }
    },
    [addMessage],
  );

  return { sendMessage, chatHistory, addMessage, isThinking, error, clearHistory };
}
