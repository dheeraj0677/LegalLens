import { AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', padding: '2.5rem 0 1.5rem 0' }}>
      <div className="container flex flex-col gap-6">
        
        {/* Crucial Legal Disclaimer Box (WCAG Accessible) */}
        <div
          role="note"
          aria-label="Legal Disclaimer"
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          <AlertCircle size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h2 style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
              Important Legal & AI Transparency Notice
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              LegalLens is an AI-powered document intelligence assistant created to make legal information and basic contracts more accessible and understandable. 
              <strong> LegalLens does not provide legal advice, legal representation, or replace consultation with a licensed attorney.</strong> 
              Outputs should be used for research, clause understanding, and negotiation preparation. For binding transactions or formal disputes, always consult qualified legal counsel.
            </p>
          </div>
        </div>

        {/* Footer Meta & Accreditations */}
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck size={16} color="#10b981" />
              <span>Enterprise Privacy: No Client Data Stored</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={16} color="#3b82f6" />
              <span>WCAG 2.2 AA Accessible Design</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span>Built with precision for accessibility & legal empowerment</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
