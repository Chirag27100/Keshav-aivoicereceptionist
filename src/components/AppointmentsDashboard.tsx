import { useState, useEffect } from 'react';
import type { Appointment, AppointmentFilter } from '../types';
import { getAppointments, clearAllAppointments } from '../lib/appointmentStore';

export function AppointmentsDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<AppointmentFilter>('all');

  useEffect(() => {
    const load = () => setAppointments(getAppointments());
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered =
    filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  const handleClear = () => {
    if (confirm('Clear all appointments? This cannot be undone.')) {
      clearAllAppointments();
      setAppointments([]);
    }
  };

  const filters: { label: string; value: AppointmentFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Rescheduled', value: 'rescheduled' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const statusColors: Record<string, string> = {
    confirmed: 'bg-success/15 text-success border-success/20',
    rescheduled: 'bg-accent-gold/15 text-accent-gold border-accent-gold/20',
    cancelled: 'bg-error/15 text-error border-error/20',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl text-text-primary font-semibold">
          Appointments
        </h2>
        <button
          onClick={handleClear}
          className="text-xs text-error/70 hover:text-error transition-colors px-3 py-1.5 rounded-lg border border-error/20 hover:border-error/40"
        >
          Clear All
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f.value
                ? 'bg-accent-gold/15 border-accent-gold/30 text-accent-gold'
                : 'border-border-custom text-text-muted hover:text-text-primary'
            }`}
          >
            {f.label}
            {f.value === 'all' && (
              <span className="ml-1 opacity-60">({appointments.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">
          No appointments found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-custom">
                <th className="text-left py-3 px-3 text-text-muted font-medium text-xs uppercase tracking-wider">
                  ID
                </th>
                <th className="text-left py-3 px-3 text-text-muted font-medium text-xs uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-3 px-3 text-text-muted font-medium text-xs uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left py-3 px-3 text-text-muted font-medium text-xs uppercase tracking-wider">
                  Concern
                </th>
                <th className="text-left py-3 px-3 text-text-muted font-medium text-xs uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-3 px-3 text-text-muted font-medium text-xs uppercase tracking-wider">
                  Slot
                </th>
                <th className="text-left py-3 px-3 text-text-muted font-medium text-xs uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((apt) => (
                <tr
                  key={apt.id}
                  className="border-b border-border-custom/50 hover:bg-bg-surface/50 transition-colors"
                >
                  <td className="py-3 px-3 text-accent-gold font-mono text-xs">
                    {apt.id}
                  </td>
                  <td className="py-3 px-3 text-text-primary">{apt.name}</td>
                  <td className="py-3 px-3 text-text-muted font-mono text-xs">
                    {apt.phone}
                  </td>
                  <td className="py-3 px-3 text-text-muted max-w-[150px] truncate">
                    {apt.concern}
                  </td>
                  <td className="py-3 px-3 text-text-primary text-xs">{apt.date}</td>
                  <td className="py-3 px-3 text-text-primary text-xs">{apt.slot}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        statusColors[apt.status] ?? ''
                      }`}
                    >
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
