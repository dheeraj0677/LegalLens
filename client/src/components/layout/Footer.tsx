import { CheckCircle2, ShieldCheck, Scale } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-primary)',
        padding: '3rem 0 2rem 0',
      }}
    >
      <div className="container flex flex-col gap-8">
        
        {/* Italian Luxury Legal Disclaimer Box */}
        <div
          role="note"
          aria-label="Legal Disclaimer"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1.5px solid var(--border-accent)',
            display: 'flex',
            gap: '1.25rem',
            alignItems: 'flex-start',
            boxShadow: 'var(--shadow-3d-white)',
          }}
        >
          <div
            style={{
              background: 'var(--bg-tertiary)',
              padding: '0.65rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              flexShrink: 0,
            }}
          >
            <Scale size={22} color="var(--accent-gold)" />
          </div>

          <div>
            <h2 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 800, margin: '0 0 0.35rem 0', letterSpacing: '-0.01em' }}>
              Legal Transparency & Advisory Notice — Collezione Milano
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              LegalLens is an AI-powered document intelligence assistant designed to bring clarity, transparency, and accessible understanding to complex contracts and agreements. 
              <strong> LegalLens does not provide formal legal advice, legal representation, or substitute for consultation with a licensed legal practitioner.</strong> 
              Audits, comparisons, and risk indexes are generated for research, clause understanding, and negotiation preparation. For binding commercial transactions or judicial disputes, always engage qualified legal counsel.
            </p>
          </div>
        </div>

        {/* Footer Meta & Accreditations */}
        <div
          className="flex items-center justify-between"
          style={{
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
          }}
        >
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5" style={{ fontWeight: 600 }}>
              <ShieldCheck size={16} color="var(--risk-low)" />
              <span>Zero Client Secret Retention</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5" style={{ fontWeight: 600 }}>
              <CheckCircle2 size={16} color="var(--accent-gold)" />
              <span>WCAG 2.2 AA Inclusive Architecture</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5" style={{ fontWeight: 600, letterSpacing: '0.04em' }}>
            <span>MILANO • EST. 2026 • GENAI DOCUMENT INTELLIGENCE</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
