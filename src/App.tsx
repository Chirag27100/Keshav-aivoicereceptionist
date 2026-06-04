import { useState, useCallback } from 'react';
import type { TabView } from './types';
import { useGroqSTT } from './hooks/useGroqSTT';
import { useGroqLLM } from './hooks/useGroqLLM';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import {
  saveAppointment,
  rescheduleAppointment,
  cancelAppointment,
  saveLead,
} from './lib/appointmentStore';
import { HospitalCard } from './components/HospitalCard';
import { InfoPanel } from './components/InfoPanel';
import { ChatLog } from './components/ChatLog';
import { VoiceInterface } from './components/VoiceInterface';
import { AppointmentsDashboard } from './components/AppointmentsDashboard';
import { LeadsDashboard } from './components/LeadsDashboard';

function parseActions(text: string) {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[1].trim());
  } catch {
    return null;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('chat');
  const [mobilePanel, setMobilePanel] = useState<'info' | null>(null);

  const { transcribe, isTranscribing } = useGroqSTT();
  const { sendMessage, chatHistory, isThinking, clearHistory } = useGroqLLM();
  const { speak, queueSentence, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();

  const isProcessing = isTranscribing || isThinking;

  const handleActions = useCallback((responseText: string) => {
    const action = parseActions(responseText);
    if (!action) return;

    switch (action.action) {
      case 'book': {
        const apt = saveAppointment({
          name: action.name,
          phone: action.phone,
          concern: action.concern,
          date: action.date,
          slot: action.slot,
        });
        saveLead({ name: action.name, phone: action.phone, concern: action.concern });
        console.log('Appointment booked:', apt);
        break;
      }
      case 'reschedule':
        rescheduleAppointment(action.appointmentId, action.date, action.slot);
        break;
      case 'cancel':
        cancelAppointment(action.appointmentId);
        break;
    }
  }, []);

  // Voice path: audio blob → transcribe → stream LLM → sentence-queue TTS
  const handleAudioBlob = useCallback(
    async (blob: Blob) => {
      stopSpeaking(); // interrupt KEVA if she was still speaking

      const transcript = await transcribe(blob);
      if (!transcript.trim()) return;

      // Stream LLM — each sentence fires queueSentence for immediate TTS
      const fullResponse = await sendMessage(transcript, (sentence) => {
        queueSentence(sentence);
      });

      handleActions(fullResponse);
    },
    [transcribe, sendMessage, queueSentence, stopSpeaking, handleActions],
  );

  // Text path: submit → stream LLM → sentence-queue TTS
  const handleTextSubmit = useCallback(
    async (text: string) => {
      stopSpeaking();

      const fullResponse = await sendMessage(text, (sentence) => {
        queueSentence(sentence);
      });

      handleActions(fullResponse);
    },
    [sendMessage, queueSentence, stopSpeaking, handleActions],
  );

  const tabs: { label: string; value: TabView; icon: string }[] = [
    { label: 'Chat', value: 'chat', icon: '💬' },
    { label: 'Appointments', value: 'appointments', icon: '📋' },
    { label: 'Leads', value: 'leads', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary noise-bg">
      {/* Header */}
      <header className="relative z-10 border-b border-border-custom bg-bg-card/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-gold to-accent-skin flex items-center justify-center">
              <span className="text-bg-primary font-heading font-bold text-sm">K</span>
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold gold-gradient-text">KEVA</h1>
              <p className="text-text-muted text-[10px] tracking-wider uppercase">
                AI Voice Receptionist
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobilePanel(mobilePanel ? null : 'info')}
              className="lg:hidden p-2 rounded-lg border border-border-custom text-text-muted hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button
              onClick={() => { stopSpeaking(); clearHistory(); }}
              className="p-2 rounded-lg border border-border-custom text-text-muted hover:text-error transition-colors"
              title="New conversation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Nav */}
      <nav className="relative z-10 border-b border-border-custom bg-bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                  activeTab === tab.value
                    ? 'text-accent-gold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.value && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent-gold rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Info Overlay */}
      {mobilePanel === 'info' && (
        <div className="lg:hidden fixed inset-0 z-40 bg-bg-primary/90 backdrop-blur-sm overflow-y-auto p-4 pt-20">
          <button
            onClick={() => setMobilePanel(null)}
            className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary"
          >
            ✕
          </button>
          <HospitalCard />
          <div className="mt-4">
            <InfoPanel />
          </div>
        </div>
      )}

      {/* Main */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'chat' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-6">
            <aside className="hidden lg:block">
              <div className="sticky top-6">
                <HospitalCard />
              </div>
            </aside>

            <div
              className="flex flex-col bg-bg-card rounded-2xl border border-border-custom overflow-hidden"
              style={{ height: 'calc(100vh - 180px)' }}
            >
              <ChatLog messages={chatHistory} isThinking={isThinking} />
              <div className="border-t border-border-custom p-4 bg-bg-card">
                <VoiceInterface
                  onTextSubmit={handleTextSubmit}
                  onAudioBlob={handleAudioBlob}
                  isProcessing={isProcessing}
                  isSpeaking={isSpeaking}
                  isTranscribing={isTranscribing}
                  isThinking={isThinking}
                />
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-6">
                <InfoPanel />
              </div>
            </aside>
          </div>
        ) : activeTab === 'appointments' ? (
          <div className="glass-card rounded-2xl p-6">
            <AppointmentsDashboard />
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6">
            <LeadsDashboard />
          </div>
        )}
      </main>
    </div>
  );
}
