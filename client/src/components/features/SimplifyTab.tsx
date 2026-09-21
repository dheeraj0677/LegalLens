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
    <div className="flex flex-col gap-8 animate-fade-in" style={{ padding: '2rem 0' }}>
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 style={{ letterSpacing: '-0.02em' }}>
          Plain English Legal Translator
        </h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '800px' }}>
          Demystify convoluted legalese, Latin phrases, and endless run-on sentences. Translate dense clauses into crystal-clear everyday English with readability scoring and jargon busting.
        </p>
      </div>

      {/* Preset Snippets */}
      {!result && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Try a Complex Legalese Sample
          </span>
          <div className="grid grid-cols-3 gap-3" style={{ marginTop: '0.75rem' }}>
            {SAMPLE_LEGALESE_SNIPPETS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSnippet(s)}
                className="btn btn-secondary card-interactive"
                style={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0.85rem',
                  height: 'auto',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{s.title}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {s.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="simplify-input-text" className="form-label flex items-center justify-between">
            <span>Paste Confusing Legal Clause or Paragraph</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {inputText.length.toLocaleString()} characters
            </span>
          </label>
          <textarea
            id="simplify-input-text"
            rows={6}
            className="textarea-custom"
            placeholder="Paste confusing legalese here (e.g., 'Notwithstanding anything herein to the contrary, the receiving party agrees to unconditionally indemnify...')"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--risk-critical-bg)',
              border: '1px solid var(--risk-critical-border)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          {inputText && (
            <button
              onClick={() => { setInputText(''); setResult(null); setError(null); }}
              className="btn btn-secondary"
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
            style={{ padding: '0.75rem 1.75rem', fontSize: '1rem', marginLeft: 'auto' }}
          >
            {loading ? (
              <>
                <Sparkles className="animate-spin" size={18} />
                <span>Translating to Plain English...</span>
              </>
            ) : (
              <>
                <BookOpen size={18} />
                <span>Translate to Plain English</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="flex flex-col gap-8 animate-fade-in">
          
          {/* Readability & Time Bar */}
          <div className="grid grid-cols-3 gap-4">
            
            <div className="glass-panel flex items-center gap-4" style={{ padding: '1.25rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)' }}>
                <GraduationCap size={24} color="#f87171" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Before (Legalese)</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f87171' }}>
                  {result.readingGradeBefore}
                </div>
              </div>
            </div>

            <div className="glass-panel flex items-center gap-4" style={{ padding: '1.25rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)' }}>
                <GraduationCap size={24} color="#34d399" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>After (LegalLens)</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#34d399' }}>
                  {result.readingGradeAfter}
                </div>
              </div>
            </div>

            <div className="glass-panel flex items-center gap-4" style={{ padding: '1.25rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)' }}>
                <Clock size={24} color="#60a5fa" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reading Time</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  ~{result.readingTimeMinutes} minute{result.readingTimeMinutes > 1 ? 's' : ''}
                </div>
              </div>
            </div>

          </div>

          {/* Hidden Traps Warning Banner */}
          {result.hiddenTraps.length > 0 && (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <Flame size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '1rem', color: '#f87171', margin: '0 0 0.5rem 0' }}>
                  Hidden Traps & Gotchas Uncovered
                </h3>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {result.hiddenTraps.map((trap, idx) => (
                    <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {trap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Side-by-Side: Original vs Simplified */}
          <div className="grid grid-cols-2 gap-4">
            
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Original Legal Phrasing
              </h3>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}>
                {result.originalText}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                <Sparkles size={18} color="#3b82f6" />
                <h3 style={{ fontSize: '1rem', color: '#60a5fa', margin: 0 }}>
                  Everyday Plain English Translation
                </h3>
              </div>
              <div style={{
                fontSize: '0.95rem',
                lineHeight: 1.65,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                background: 'rgba(59, 130, 246, 0.05)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(59, 130, 246, 0.15)'
              }}>
                {result.simplifiedText}
              </div>
            </div>

          </div>

          {/* Key Takeaways & Jargon Buster */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Takeaways */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Bottom-Line Takeaways
              </h3>
              <div className="flex flex-col gap-2">
                {result.keyTakeaways.map((takeaway, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    <ArrowRight size={15} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Jargon Glossary */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                <HelpCircle size={18} color="#f59e0b" />
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
                  Jargon Buster Glossary ({result.jargonGlossary.length})
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {result.jargonGlossary.map((term, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(245, 158, 11, 0.04)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fbbf24' }}>
                      {term.term}
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-primary)', margin: '4px 0' }}>
                      <strong>Meaning:</strong> {term.plainMeaning}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
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
