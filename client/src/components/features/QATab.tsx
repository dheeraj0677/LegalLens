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
    } catch (err: any) {
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
    <div className="flex flex-col gap-8 animate-fade-in" style={{ padding: '2rem 0' }}>
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 style={{ letterSpacing: '-0.02em' }}>
          Interactive Document Q&A & Citation Verifier
        </h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '800px' }}>
          Ask precise questions about your contract and receive verifiable, citation-backed answers with verbatim quotes. Eliminates black-box AI hallucinations through strict source grounding.
        </p>
      </div>

      {/* Preset Pickers */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
          <Zap size={16} color="#3b82f6" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Load Contract for Q&A
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
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
                padding: '0.75rem',
                height: 'auto',
                border: docText === p.documentA.text ? '1px solid var(--accent-blue)' : undefined,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{p.title}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.suggestedQuestions.length} Sample Questions</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Q&A Interface Grid */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Left Column: Document Reference Text (1 col) */}
        <div className="glass-panel" style={{ padding: '1.25rem', height: 'fit-content' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <label htmlFor="qa-doc-text" className="form-label" style={{ margin: 0 }}>
              Underlying Document Context
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {docText.length.toLocaleString()} chars
            </span>
          </div>
          <textarea
            id="qa-doc-text"
            rows={14}
            className="textarea-custom"
            style={{ fontSize: '0.8rem', lineHeight: 1.5 }}
            placeholder="Paste contract or agreement to interrogate..."
            value={docText}
            onChange={e => setDocText(e.target.value)}
          />
        </div>

        {/* Right Column: Interactive Chat & Citations (2 cols) */}
        <div className="flex flex-col gap-4" style={{ gridColumn: 'span 2' }}>
          
          {/* Query Input Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <label htmlFor="qa-question-input" className="form-label">
              Ask Any Question About This Document
            </label>

            {/* Suggested Question Chips */}
            {activePreset?.suggestedQuestions && (
              <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Suggested:</span>
                {activePreset.suggestedQuestions.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setQuestion(sq); handleAsk(sq); }}
                    className="btn btn-outline"
                    style={{ padding: '2px 8px', fontSize: '0.75rem', borderRadius: '9999px' }}
                  >
                    {sq}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                id="qa-question-input"
                type="text"
                placeholder="e.g., Does this contract have an automatic renewal or non-compete clause?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAsk(); }}
                style={{
                  flex: 1,
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.925rem',
                }}
              />
              <button
                id="qa-submit-btn"
                onClick={() => handleAsk()}
                disabled={loading || !question.trim() || !docText.trim()}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.25rem' }}
              >
                {loading ? (
                  <Sparkles className="animate-spin" size={18} />
                ) : (
                  <>
                    <Send size={16} />
                    <span>Ask</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--risk-critical-bg)',
                  border: '1px solid var(--risk-critical-border)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Results Stream / Chat History */}
          <div className="flex flex-col gap-4">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel animate-fade-in"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {/* Question Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquareText size={18} color="#3b82f6" />
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {item.question}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: item.confidence === 'HIGH' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: item.confidence === 'HIGH' ? '#34d399' : '#fbbf24',
                  }}>
                    {item.confidence} CONFIDENCE
                  </span>
                </div>

                {/* Grounded Answer */}
                <div style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                }}>
                  {item.answer}
                </div>

                {/* Verbatim Citations & Traceability */}
                {item.citations.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Supporting Verbatim Citations ({item.citations.length})
                    </span>
                    <div className="flex flex-col gap-2" style={{ marginTop: '0.5rem' }}>
                      {item.citations.map((cite, cIdx) => (
                        <div
                          key={cIdx}
                          style={{
                            padding: '0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(0, 0, 0, 0.25)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem',
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Quote size={14} color="#818cf8" />
                            <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#818cf8' }}>
                              {cite.clauseReference}
                            </span>
                          </div>
                          <blockquote style={{
                            margin: 0,
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.825rem',
                            color: 'var(--text-secondary)',
                            fontStyle: 'italic',
                            paddingLeft: '0.5rem',
                            borderLeft: '2px solid var(--accent-indigo)',
                          }}>
                            "{cite.exactQuote}"
                          </blockquote>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            {cite.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Prompts */}
                {item.suggestedFollowUpQuestions.length > 0 && (
                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Follow-up inquiries:</span>
                    <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', marginTop: '0.35rem' }}>
                      {item.suggestedFollowUpQuestions.map((fq, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => { setQuestion(fq); handleAsk(fq); }}
                          className="btn btn-outline"
                          style={{ padding: '2px 8px', fontSize: '0.75rem', borderRadius: '9999px' }}
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
              <div className="glass-panel flex flex-col items-center justify-center text-center" style={{ padding: '3rem 1.5rem' }}>
                <ShieldCheck size={40} color="#6366f1" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Questions Asked Yet</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '420px' }}>
                  Click one of the suggested chips above or enter a custom question to inspect clauses, deadlines, and liabilities with zero hallucinations.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
