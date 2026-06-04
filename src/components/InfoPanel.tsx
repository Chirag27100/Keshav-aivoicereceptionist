import { HOSPITAL, SERVICES } from '../lib/hospitalData';

export function InfoPanel() {
  return (
    <div className="space-y-4">
      {/* Timings */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-heading text-accent-gold text-base font-semibold mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Timings
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Mon – Sat</span>
            <span className="text-text-primary text-xs">{HOSPITAL.timings.weekdays}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Sunday</span>
            <span className="text-error text-xs">{HOSPITAL.timings.sunday}</span>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-heading text-accent-gold text-base font-semibold mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          Services
        </h3>
        <div className="space-y-3">
          <ServiceCategory label="Skin" items={SERVICES.skin.slice(0, 5)} color="text-accent-skin" />
          <ServiceCategory label="Hair" items={SERVICES.hair.slice(0, 4)} color="text-accent-gold" />
          <ServiceCategory label="Aesthetic" items={SERVICES.aesthetic.slice(0, 4)} color="text-text-primary" />
        </div>
        <p className="text-text-muted text-xs mt-3 italic">+ many more treatments available</p>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-heading text-accent-gold text-base font-semibold mb-3">Quick Links</h3>
        <div className="space-y-2">
          <a
            href={`tel:${HOSPITAL.phone.replace(/\s/g, '')}`}
            className="block w-full text-center py-2.5 rounded-xl bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-sm font-medium hover:bg-accent-gold/20 transition-colors"
          >
            📞 Call Now
          </a>
          <a
            href={`https://${HOSPITAL.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2.5 rounded-xl bg-bg-surface border border-border-custom text-text-muted text-sm hover:text-text-primary transition-colors"
          >
            🌐 Visit Website
          </a>
        </div>
      </div>
    </div>
  );
}

function ServiceCategory({
  label,
  items,
  color,
}: {
  label: string;
  items: readonly string[];
  color: string;
}) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wider ${color} mb-1`}>
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="text-[11px] px-2 py-0.5 rounded-full bg-bg-surface border border-border-custom text-text-muted"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
