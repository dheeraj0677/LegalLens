import React, { useState } from 'react';
import { apiService, ApiError } from '../../services/api';
import { SimplifiedResult } from '../../types';
import {
  BookOpen,
  Sparkles,
  AlertCircle,
  Clock,
  GraduationCap,
  Flame,
  HelpCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

const SAMPLE_LEGALESE_SNIPPETS = [
  {
    title: 'Indemnity & Hold Harmless Trap',
    text: 'To the fullest extent permitted by applicable law, Contractor shall unconditionally defend, indemnify, and hold harmless Company, its affiliates, directors, officers, agents, and employees from and against any and all claims, demands, causes of action, damages, liabilities, losses, costs, and expenses (including reasonable attorneys’ fees and court disbursements) arising out of or resulting from Contractor’s performance or non-performance, notwithstanding anything herein to the contrary and irrespective of whether such liability is caused in part by the negligence of Company.',
  },
  {
    title: 'Perpetual Non-Disclosure Trap',
    text: 'Recipient covenants and agrees that it shall hold in utmost strict confidence and shall not, directly or indirectly, disclose, publish, or disseminate any Proprietary Information to any third party in perpetuity. In the event of breach, Disclosing Party shall be entitled to immediate ex parte equitable relief and liquidated damages of $100,000 without requirement of proving actual monetary damages.',
  },
  {
    title: 'Work For Hire IP Forfeiture',
    text: 'All inventions, discoveries, designs, software, improvements, trade secrets, formulas, and works of authorship conceived, developed, or reduced to practice by Contractor, solely or jointly, during the term hereof shall be deemed works made for hire and are hereby irrevocably assigned to Company in their entirety worldwide.',
  },
];

export const SimplifyTab: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimplifiedResult | null>(null);

  const handleSimplify = async (textToUse?: string) => {
    const text = textToUse !== undefined ? textToUse : inputText;
    if (!text.trim()) {
      setError('Please enter or select a legal snippet to simplify.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.simplifyText(text);
      setResult(res);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Simplification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSnippet = (snippet: typeof SAMPLE_LEGALESE_SNIPPETS[0]) => {
    setInputText(snippet.text);
    handleSimplify(snippet.text);
  };

  return (
    <div className="flex flex-col gap-10 animate-fade-in" style={{ padding: '2.5rem 0' }}>
      
      {/* Italian Editorial Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800, color: 'var(--accent-gold)' }}>
            ACCESSIBLE PLAIN LANGUAGE TRANSLATOR
          </span>
          <span style={{ color: 'var(--border-subtle)' }}>/</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>COLLEZIONE MILANO</span>
        </div>

        <h1 style={{ letterSpacing: '-0.03em', fontSize: 'clamp(2.4rem, 4.5vw, 3.2rem)' }}>
          Plain English <span className="font-editorial" style={{ fontWeight: 400, color: 'var(--accent-gold)' }}>Legal Demystifier</span>
        </h1>

        <p style={{ fontSize: '1.1rem', maxWidth: '820px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          Translates impenetrable legalese, Latin expressions, and endless sentences into crystal-clear 8th-grade English. Unmasks stealth traps and provides an instant Jargon Buster glossary.
        </p>
      </div>

      {/* 3D Curated Samples */}
      {!result && (
        <div className="flex flex-col gap-3">
          <span style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Try a Complex Legalese Sample (1-Click Test)
          </span>
          <div className="grid grid-cols-3 gap-4">
            {SAMPLE_LEGALESE_SNIPPETS.map((s, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSnippet(s)}
                className="glass-panel card-interactive"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.4rem 0', color: 'var(--text-primary)' }}>
                    {s.title}
                  </h3>
                  <p style={{
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.5,
                  }}>
                    {s.text}
                  </p>
                </div>
                
                <div className="flex items-center gap-1" style={{ marginTop: '1rem', color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 700 }}>
                  <span>Translate Snippet</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Inset Input Panel */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="simplify-input-text" className="form-label flex items-center justify-between">
            <span>Paste Confusing Legal Clause or Agreement Excerpt</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {inputText.length.toLocaleString()} characters
            </span>
          </label>
          <textarea
            id="simplify-input-text"
            rows={6}
            className="textarea-custom"
            placeholder="Paste confusing legalese here (e.g., 'Notwithstanding anything herein to the contrary, the receiving party shall unconditionally indemnify and hold harmless...')"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--risk-critical-bg)',
              border: '1.5px solid var(--risk-critical-border)',
              color: 'var(--risk-critical)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          {inputText && (
            <button
              onClick={() => { setInputText(''); setResult(null); setError(null); }}
              className="btn btn-outline"
            >
              <RotateCcw size={15} />
              <span>Clear</span>
            </button>
          )}

          <button
            id="simplify-submit-btn"
            onClick={() => handleSimplify()}
            disabled={loading || !inputText.trim()}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2.25rem', fontSize: '1rem', marginLeft: 'auto' }}
          >
            {loading ? (
              <>
                <Sparkles className="animate-spin" size={18} />
                <span>Demystifying Legalese...</span>
              </>
            ) : (
              <>
                <BookOpen size={18} color="#dfb15b" />
                <span>Translate to Plain English</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="flex flex-col gap-8 animate-fade-in">
          
          {/* Readability Benchmarking Bar */}
          <div className="grid grid-cols-3 gap-6">
            
            <div className="glass-panel flex items-center gap-4" style={{ padding: '1.5rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: '14px', background: 'var(--risk-critical-bg)', border: '1px solid var(--risk-critical-border)' }}>
                <GraduationCap size={26} color="var(--risk-critical)" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                  Before (Legalese)
                </span>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--risk-critical)', marginTop: '2px' }}>
                  {result.readingGradeBefore}
                </div>
              </div>
            </div>

            <div className="glass-panel flex items-center gap-4" style={{ padding: '1.5rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: '14px', background: 'var(--risk-low-bg)', border: '1px solid var(--risk-low-border)' }}>
                <GraduationCap size={26} color="var(--risk-low)" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                  After (LegalLens)
                </span>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--risk-low)', marginTop: '2px' }}>
                  {result.readingGradeAfter}
                </div>
              </div>
            </div>

            <div className="glass-panel flex items-center gap-4" style={{ padding: '1.5rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: '14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                <Clock size={26} color="var(--accent-gold)" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                  Estimated Reading Time
                </span>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  ~{result.readingTimeMinutes} minute{result.readingTimeMinutes > 1 ? 's' : ''}
                </div>
              </div>
            </div>

          </div>

          {/* Hidden Traps Alert Box */}
          {result.hiddenTraps.length > 0 && (
            <div
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--risk-critical-bg)',
                border: '1.5px solid var(--risk-critical-border)',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start',
                boxShadow: 'var(--shadow-3d-white)',
              }}
            >
              <Flame size={26} color="var(--risk-critical)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--risk-critical)', margin: '0 0 0.5rem 0' }}>
                  Covert Gotchas & Hidden Traps Unmasked
                </h3>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {result.hiddenTraps.map((trap, idx) => (
                    <li key={idx} style={{ fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {trap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Side-by-Side: Original vs Simplified */}
          <div className="grid grid-cols-2 gap-6">
            
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Original Dense Phrasing
              </h3>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                lineHeight: 1.65,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                background: 'var(--bg-tertiary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-inset)',
              }}>
                {result.originalText}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', border: '1.5px solid rgba(184, 134, 11, 0.35)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                <Sparkles size={20} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', margin: 0 }}>
                  Plain English Translation
                </h3>
              </div>
              <div style={{
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                background: 'var(--bg-secondary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-inset)',
              }}>
                {result.simplifiedText}
              </div>
            </div>

          </div>

          {/* Key Takeaways & Jargon Buster */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* Takeaways */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>
                Bottom-Line Takeaways
              </h3>
              <div className="flex flex-col gap-3">
                {result.keyTakeaways.map((takeaway, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-inset)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      fontSize: '0.925rem',
                    }}
                  >
                    <ArrowRight size={16} color="var(--accent-gold)" style={{ marginTop: '3px', flexShrink: 0 }} />
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Jargon Glossary */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <HelpCircle size={20} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                  Jargon Buster Glossary ({result.jargonGlossary.length})
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {result.jargonGlossary.map((term, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-3d-white)',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-gold)' }}>
                      {term.term}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: '4px 0', lineHeight: 1.5 }}>
                      <strong>Meaning:</strong> {term.plainMeaning}
                    </p>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
                      <strong>Why it matters:</strong> {term.whyItMatters}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
