import { HOSPITAL, DOCTOR } from '../lib/hospitalData';

export function HospitalCard() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      {/* Logo / Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-gold to-accent-skin flex items-center justify-center flex-shrink-0">
          <span className="font-heading text-bg-primary text-2xl font-bold">DK</span>
        </div>
        <div className="min-w-0">
          <h2 className="font-heading text-lg font-semibold text-text-primary leading-tight">
            {HOSPITAL.name}
          </h2>
          <p className="text-xs text-text-muted mt-0.5 italic">{HOSPITAL.tagline}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-surface border border-border-custom">
        <span className="text-accent-gold text-lg">★</span>
        <span className="text-text-primary font-medium text-sm">
          {HOSPITAL.rating}
        </span>
        <span className="text-text-muted text-xs">
          ({HOSPITAL.reviewCount.toLocaleString()} Google Reviews)
        </span>
      </div>

      {/* Contact */}
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <svg
            className="w-4 h-4 text-accent-gold mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <a
            href={`tel:${HOSPITAL.phone.replace(/\s/g, '')}`}
            className="text-text-primary hover:text-accent-gold transition-colors"
          >
            {HOSPITAL.phone}
          </a>
        </div>

        <div className="flex items-start gap-3">
          <svg
            className="w-4 h-4 text-accent-gold mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-text-muted text-xs leading-relaxed">{HOSPITAL.address}</p>
        </div>
      </div>

      {/* Doctor */}
      <div className="border-t border-border-custom pt-4 space-y-1">
        <p className="text-accent-gold font-medium text-sm">{DOCTOR.name}</p>
        <p className="text-text-muted text-xs">{DOCTOR.title}</p>
        <p className="text-text-muted text-xs">{DOCTOR.experience} experience</p>
        <div className="flex items-center gap-1.5 mt-2">
          <svg
            className="w-3.5 h-3.5 text-accent-gold"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-text-muted text-xs">{DOCTOR.award}</span>
        </div>
      </div>
    </div>
  );
}
