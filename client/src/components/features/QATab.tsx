import React, { useState } from 'react';
import { apiService, ApiError } from '../../services/api';
import { QAResult, SampleDocumentPreset } from '../../types';
import {
  MessageSquareText,
  Sparkles,
  AlertCircle,
  Quote,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';

interface QATabProps {
  samplePresets: SampleDocumentPreset[];
}

export const QATab: React.FC<QATabProps> = ({ samplePresets }) => {
  const [docText, setDocText] = useState(samplePresets[0]?.documentA?.text || '');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<QAResult[]>([]);

  const handleAsk = async (questionToAsk?: string) => {
    const q = questionToAsk || question;
    if (!docText.trim()) {
      setError('Please provide document text to interrogate.');
      return;
    }
    if (!q.trim()) {
      setError('Please enter a question to ask.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.askQuestion(docText, q);
      setChatHistory(prev => [res, ...prev]);
      setQuestion('');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get answer. Please check document content.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (preset: SampleDocumentPreset) => {
    setDocText(preset.documentA.text);
    if (preset.suggestedQuestions.length > 0) {
      setQuestion(preset.suggestedQuestions[0]);
    }
  };

  const activePreset = samplePresets.find(p => p.documentA.text === docText) || samplePresets[0];

  return (
    <div className="flex flex-col gap-10 animate-fade-in" style={{ padding: '2.5rem 0' }}>
      
      {/* Italian Editorial Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800, color: 'var(--accent-gold)' }}>
            PRECISION INTERROGATION & CITATION ENGINE
          </span>
          <span style={{ color: 'var(--border-subtle)' }}>/</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>COLLEZIONE MILANO</span>
        </div>

        <h1 style={{ letterSpacing: '-0.03em', fontSize: 'clamp(2.4rem, 4.5vw, 3.2rem)' }}>
          Document Interrogation <span className="font-editorial" style={{ fontWeight: 400, color: 'var(--accent-gold)' }}>& Citation Verifier</span>
        </h1>

        <p style={{ fontSize: '1.1rem', maxWidth: '820px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          Ask precise contractual inquiries and receive verifiable, citation-backed answers with verbatim quotes. Eradicates AI hallucinations through strict source grounding.
        </p>
      </div>

      {/* 3D Curated Contract Selector */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
          <Zap size={18} color="var(--accent-gold)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Select Contract for Interrogation (1-Click Presets)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {samplePresets.map(p => (
            <button
              key={p.id}
              onClick={() => handlePresetSelect(p)}
              className="btn btn-secondary card-interactive"
              style={{
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '1.1rem',
                height: 'auto',
                border: docText === p.documentA.text ? '2px solid var(--accent-noir)' : undefined,
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--text-primary)' }}>{p.title}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{p.suggestedQuestions.length} Curated Questions</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Q&A Interface Grid */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Left Column: Document Reference Text (1 col) */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.65rem' }}>
            <label htmlFor="qa-doc-text" className="form-label" style={{ margin: 0 }}>
              Underlying Document Context
            </label>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {docText.length.toLocaleString()} chars
            </span>
          </div>
          <textarea
            id="qa-doc-text"
            rows={15}
            className="textarea-custom"
            style={{ fontSize: '0.825rem', lineHeight: 1.55 }}
            placeholder="Paste contract or agreement to interrogate..."
            value={docText}
            onChange={e => setDocText(e.target.value)}
          />
        </div>

        {/* Right Column: Interactive Chat & Citations (2 cols) */}
        <div className="flex flex-col gap-6" style={{ gridColumn: 'span 2' }}>
          
          {/* Query Console Card */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <label htmlFor="qa-question-input" className="form-label">
              Interrogate This Agreement
            </label>

            {/* Suggested Question Chips */}
            {activePreset?.suggestedQuestions && (
              <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Suggested:</span>
                {activePreset.suggestedQuestions.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setQuestion(sq); handleAsk(sq); }}
                    className="btn btn-outline"
                    style={{ padding: '4px 12px', fontSize: '0.78rem', borderRadius: '9999px' }}
                  >
                    {sq}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                id="qa-question-input"
                type="text"
                placeholder="e.g., Does this contract contain an automatic renewal or non-compete clause?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAsk(); }}
                style={{
                  flex: 1,
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1.15rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-inset)',
                }}
              />
              <button
                id="qa-submit-btn"
                onClick={() => handleAsk()}
                disabled={loading || !question.trim() || !docText.trim()}
                className="btn btn-primary"
                style={{ padding: '0.85rem 1.75rem' }}
              >
                {loading ? (
                  <Sparkles className="animate-spin" size={18} />
                ) : (
                  <>
                    <Send size={16} color="#dfb15b" />
                    <span>Inquire</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--risk-critical-bg)',
                  border: '1.5px solid var(--risk-critical-border)',
                  color: 'var(--risk-critical)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontWeight: 600,
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Results Stream / Dossier */}
          <div className="flex flex-col gap-5">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel animate-fade-in"
                style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                {/* Question Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquareText size={20} color="var(--accent-gold)" />
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                      {item.question}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: item.confidence === 'HIGH' ? 'var(--risk-low-bg)' : 'var(--risk-medium-bg)',
                    color: item.confidence === 'HIGH' ? 'var(--risk-low)' : 'var(--risk-medium)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    {item.confidence} CONFIDENCE
                  </span>
                </div>

                {/* Grounded Answer */}
                <div style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-inset)',
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.65,
                }}>
                  {item.answer}
                </div>

                {/* Verbatim Citations & Traceability */}
                {item.citations.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Supporting Verbatim Citations ({item.citations.length})
                    </span>
                    <div className="flex flex-col gap-3" style={{ marginTop: '0.65rem' }}>
                      {item.citations.map((cite, cIdx) => (
                        <div
                          key={cIdx}
                          style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius-sm)',
                            background: '#ffffff',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: 'var(--shadow-3d-white)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Quote size={15} color="var(--accent-gold)" />
                            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                              {cite.clauseReference}
                            </span>
                          </div>
                          <blockquote style={{
                            margin: 0,
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            fontStyle: 'italic',
                            paddingLeft: '0.65rem',
                            borderLeft: '3px solid var(--accent-gold)',
                            lineHeight: 1.55,
                          }}>
                            "{cite.exactQuote}"
                          </blockquote>
                          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            {cite.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Prompts */}
                {item.suggestedFollowUpQuestions.length > 0 && (
                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Follow-up inquiries:</span>
                    <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', marginTop: '0.4rem' }}>
                      {item.suggestedFollowUpQuestions.map((fq, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => { setQuestion(fq); handleAsk(fq); }}
                          className="btn btn-outline"
                          style={{ padding: '3px 10px', fontSize: '0.78rem', borderRadius: '9999px' }}
                        >
                          {fq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}

            {chatHistory.length === 0 && !loading && (
              <div className="glass-panel flex flex-col items-center justify-center text-center" style={{ padding: '3.5rem 2rem' }}>
                <ShieldCheck size={44} color="var(--accent-gold)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Questions Asked Yet</h3>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', maxWidth: '440px', lineHeight: 1.6 }}>
                  Click one of the suggested chips above or enter a custom inquiry to inspect covenants, liability caps, and termination rights with zero hallucinations.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default QATab;
