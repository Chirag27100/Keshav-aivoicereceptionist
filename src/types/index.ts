export interface Appointment {
  id: string;
  name: string;
  phone: string;
  concern: string;
  date: string;
  slot: string;
  status: 'confirmed' | 'cancelled' | 'rescheduled';
  createdAt: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  concern: string;
  capturedAt: number;
  converted: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type TabView = 'chat' | 'appointments' | 'leads';

export type AppointmentFilter = 'all' | 'confirmed' | 'cancelled' | 'rescheduled';
