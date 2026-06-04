import type { Appointment, Lead } from '../types';

const APPOINTMENTS_KEY = 'keva_appointments';
const LEADS_KEY = 'keva_leads';

function generateId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `DKSH-${num}`;
}

function generateLeadId(): string {
  return `LEAD-${Date.now().toString(36).toUpperCase()}`;
}

// ── Appointments ──

export function getAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    return raw ? (JSON.parse(raw) as Appointment[]) : [];
  } catch {
    return [];
  }
}

export function saveAppointment(data: Omit<Appointment, 'id' | 'status' | 'createdAt'>): Appointment {
  const appointments = getAppointments();
  const appointment: Appointment = {
    ...data,
    id: generateId(),
    status: 'confirmed',
    createdAt: Date.now(),
  };
  appointments.push(appointment);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  return appointment;
}

export function findAppointment(id: string): Appointment | undefined {
  return getAppointments().find((a) => a.id.toLowerCase() === id.toLowerCase());
}

export function rescheduleAppointment(
  id: string,
  newDate: string,
  newSlot: string,
): Appointment | null {
  const appointments = getAppointments();
  const idx = appointments.findIndex((a) => a.id.toLowerCase() === id.toLowerCase());
  if (idx === -1) return null;
  appointments[idx] = {
    ...appointments[idx],
    date: newDate,
    slot: newSlot,
    status: 'rescheduled',
  };
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  return appointments[idx];
}

export function cancelAppointment(id: string): Appointment | null {
  const appointments = getAppointments();
  const idx = appointments.findIndex((a) => a.id.toLowerCase() === id.toLowerCase());
  if (idx === -1) return null;
  appointments[idx] = { ...appointments[idx], status: 'cancelled' };
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  return appointments[idx];
}

export function clearAllAppointments(): void {
  localStorage.removeItem(APPOINTMENTS_KEY);
}

// ── Leads ──

export function getLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    return raw ? (JSON.parse(raw) as Lead[]) : [];
  } catch {
    return [];
  }
}

export function saveLead(data: { name: string; phone: string; concern: string }): Lead {
  const leads = getLeads();
  const existing = leads.find((l) => l.phone === data.phone);
  if (existing) return existing;
  const lead: Lead = {
    ...data,
    id: generateLeadId(),
    capturedAt: Date.now(),
    converted: false,
  };
  leads.push(lead);
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  return lead;
}

export function clearAllLeads(): void {
  localStorage.removeItem(LEADS_KEY);
}
