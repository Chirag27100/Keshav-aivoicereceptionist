import { useState, useEffect } from 'react';
import type { Lead } from '../types';
import { getLeads, clearAllLeads } from '../lib/appointmentStore';

export function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const load = () => setLeads(getLeads());
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    if (confirm('Clear all leads? This cannot be undone.')) {
      clearAllLeads();
      setLeads([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl text-text-primary font-semibold">
          Leads Captured
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            {leads.length} total lead{leads.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={handleClear}
            className="text-xs text-error/70 hover:text-error transition-colors px-3 py-1.5 rounded-lg border border-error/20 hover:border-error/40"
          >
            Clear All
          </button>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">
          No leads captured yet. KEVA auto-saves contact details from conversations.
        </div>
      ) : (
        <div className="grid gap-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="glass-card rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-gold font-heading text-sm font-bold">
                    {lead.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">
                    {lead.name}
                  </p>
                  <p className="text-text-muted text-xs font-mono">{lead.phone}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-text-muted text-xs truncate max-w-[200px]">
                  {lead.concern}
                </p>
                <p className="text-text-muted/50 text-[10px] mt-0.5">
                  {new Date(lead.capturedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
