import React, { useState } from 'react';
import { apiService, ApiError } from '../../services/api';
import { DocumentComparisonResult, SampleDocumentPreset } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  GitCompare,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Zap,
  Sliders,
} from 'lucide-react';

interface CompareTabProps {
  samplePresets: SampleDocumentPreset[];
}

export const CompareTab: React.FC<CompareTabProps> = ({ samplePresets }) => {
  const [docA, setDocA] = useState('');
  const [docB, setDocB] = useState('');
  const [titleA, setTitleA] = useState('Document A (Original)');
  const [titleB, setTitleB] = useState('Document B (Counter-Proposal)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentComparisonResult | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const handleCompare = async (textA?: string, textB?: string, tA?: string, tB?: string) => {
    const valA = textA !== undefined ? textA : docA;
    const valB = textB !== undefined ? textB : docB;
    const nameA = tA || titleA;
    const nameB = tB || titleB;

    if (!valA.trim() || !valB.trim()) {
      setError('Please provide text for both Document A and Document B to compare.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.compareDocuments(valA, valB, nameA, nameB);
      setResult(res);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Comparison failed. Please verify document formatting.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = (preset: SampleDocumentPreset) => {
    if (preset.documentB) {
      setTitleA(preset.documentA.title);
      setTitleB(preset.documentB.title);
      setDocA(preset.documentA.text);
      setDocB(preset.documentB.text);
      handleCompare(preset.documentA.text, preset.documentB.text, preset.documentA.title, preset.documentB.title);
    }
  };

  const getFavorabilityBadge = (favor: DocumentComparisonResult['favorability']) => {
    switch (favor) {
      case 'FAVORS_PARTY_A':
        return { text: 'Favors Document A (Original)', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'FAVORS_PARTY_B':
        return { text: 'Favors Document B (Counter-Party)', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'BALANCED':
        return { text: 'Mutually Balanced Terms', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'NEEDS_LEGAL_INTERVENTION':
        return { text: 'High Discrepancy - Needs Attorney Review', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
    }
  };

  const filteredMatches = result?.matchedClauses.filter(m => {
    if (filterSeverity === 'ALL') return true;
    return m.changeType === filterSeverity;
  }) || [];

  return (
    <div className="flex flex-col gap-8 animate-fade-in" style={{ padding: '2rem 0' }}>
      
      {/* Tab Header */}
      <div className="flex flex-col gap-2">
        <h1 style={{ letterSpacing: '-0.02em' }}>
          Contract Comparison & Redline Risk Differ
        </h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '800px' }}>
          Compare two drafts side-by-side (e.g. your standard NDA vs. a vendor counter-proposal). Automatically detects deleted safeguards, surprise obligations, and risk favorability shifts.
        </p>
      </div>

      {/* 1-Click Comparison Presets */}
      {samplePresets.filter(p => p.documentB).length > 0 && !result && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
            <Zap size={16} color="#3b82f6" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instant Comparison Demo
            </span>
          </div>
          <button
            onClick={() => handleLoadSample(samplePresets[0])}
            className="btn btn-secondary card-interactive"
            style={{
              padding: '0.85rem 1.25rem',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Load: {samplePresets[0].title}</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                {samplePresets[0].description}
              </p>
            </div>
            <ArrowRight size={18} color="#6366f1" />
          </button>
        </div>
      )}

      {/* Dual Input Panels */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Document A */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="doc-a-title" className="form-label">
              Document A Label
            </label>
            <input
              id="doc-a-title"
              type="text"
              value={titleA}
              onChange={e => setTitleA(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
              }}
            />
          </div>
          <div>
            <label htmlFor="doc-a-text" className="form-label">
              Document A Text
            </label>
            <textarea
              id="doc-a-text"
              rows={9}
              className="textarea-custom"
              placeholder="Paste original contract draft..."
              value={docA}
              onChange={e => setDocA(e.target.value)}
            />
          </div>
        </div>

        {/* Document B */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="doc-b-title" className="form-label">
              Document B Label
            </label>
            <input
              id="doc-b-title"
              type="text"
              value={titleB}
              onChange={e => setTitleB(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
              }}
            />
          </div>
          <div>
            <label htmlFor="doc-b-text" className="form-label">
              Document B Text
            </label>
            <textarea
              id="doc-b-text"
              rows={9}
              className="textarea-custom"
              placeholder="Paste revised counter-proposal or competing draft..."
              value={docB}
              onChange={e => setDocB(e.target.value)}
            />
          </div>
        </div>

      </div>

      {/* Error display */}
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
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Compare Action Buttons */}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        {(docA || docB || result) && (
          <button
            onClick={() => { setDocA(''); setDocB(''); setResult(null); setError(null); }}
            className="btn btn-secondary"
          >
            <RotateCcw size={15} />
            <span>Reset Comparison</span>
          </button>
        )}

        <button
          id="compare-submit-btn"
          onClick={() => handleCompare()}
          disabled={loading || !docA.trim() || !docB.trim()}
          className="btn btn-primary"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem', marginLeft: 'auto' }}
        >
          {loading ? (
            <>
              <Sparkles className="animate-spin" size={18} />
              <span>Comparing Clauses & Risks...</span>
            </>
          ) : (
            <>
              <GitCompare size={18} />
              <span>Compare Both Contracts</span>
            </>
          )}
        </button>
      </div>

      {/* Comparison Results */}
      {result && (
        <div className="flex flex-col gap-8 animate-fade-in">
          
          {/* Top Level Comparison Outcome Card */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div className="flex items-center gap-2">
                <GitCompare size={22} color="#6366f1" />
                <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Comparison Intelligence Result</h2>
              </div>
              {(() => {
                const badge = getFavorabilityBadge(result.favorability);
                return (
                  <span
                    style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      background: badge.bg,
                      color: badge.color,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      border: `1px solid ${badge.color}40`,
                    }}
                  >
                    {badge.text}
                  </span>
                );
              })()}
            </div>

            <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {result.overallSummary}
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              <strong>Net Assessment:</strong> {result.favorabilityExplanation}
            </p>

            {/* Key Differences List */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Key Structural Differences
              </span>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {result.keyDifferences.map((diff, idx) => (
                  <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {diff}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Omission Alerts (Clauses Only in A or B) */}
          {(result.onlyInA.length > 0 || result.onlyInB.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              
              {/* Present only in A (Omitted in B) */}
              <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                  <AlertTriangle size={18} color="#f59e0b" />
                  <h3 style={{ fontSize: '1rem', margin: 0, color: '#fbbf24' }}>
                    Omitted from {result.titleB} ({result.onlyInA.length})
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  These terms were in the original agreement but were removed in the revision:
                </p>
                <div className="flex flex-col gap-2" style={{ marginTop: '0.75rem' }}>
                  {result.onlyInA.map(c => (
                    <div key={c.id} style={{ padding: '0.6rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.05)', fontSize: '0.825rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{c.heading}:</strong> {c.plainExplanation}
                    </div>
                  ))}
                </div>
              </div>

              {/* Present only in B (Newly introduced) */}
              <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                  <AlertCircle size={18} color="#ef4444" />
                  <h3 style={{ fontSize: '1rem', margin: 0, color: '#f87171' }}>
                    Newly Introduced in {result.titleB} ({result.onlyInB.length})
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Fresh provisions not present in Document A:
                </p>
                <div className="flex flex-col gap-2" style={{ marginTop: '0.75rem' }}>
                  {result.onlyInB.map(c => (
                    <div key={c.id} style={{ padding: '0.6rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.05)', fontSize: '0.825rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{c.heading}:</strong> {c.plainExplanation}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Matched Clauses Deep Dive */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div className="flex items-center gap-2">
                <Sliders size={18} color="#3b82f6" />
                <h3 style={{ margin: 0 }}>Clause Cross-Comparison ({result.matchedClauses.length})</h3>
              </div>

              {/* Filter by severity */}
              <div className="flex items-center gap-1" style={{ background: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px' }}>
                {['ALL', 'IDENTICAL', 'MODIFIED_MINOR', 'MODIFIED_MAJOR', 'CONTRADICTORY'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className="btn"
                    style={{
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.725rem',
                      borderRadius: '6px',
                      background: filterSeverity === sev ? 'var(--accent-indigo)' : 'transparent',
                      color: filterSeverity === sev ? '#ffffff' : 'var(--text-secondary)',
                    }}
                  >
                    {sev.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Matched Clauses */}
            <div className="flex flex-col gap-4">
              {filteredMatches.map(m => (
                <div
                  key={m.id}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(15, 23, 42, 0.4)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                  }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {m.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                        {m.clauseCategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: m.changeType === 'IDENTICAL' ? 'rgba(16, 185, 129, 0.15)' :
                                    m.changeType === 'MODIFIED_MINOR' ? 'rgba(59, 130, 246, 0.15)' :
                                    m.changeType === 'MODIFIED_MAJOR' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: m.changeType === 'IDENTICAL' ? '#34d399' :
                               m.changeType === 'MODIFIED_MINOR' ? '#60a5fa' :
                               m.changeType === 'MODIFIED_MAJOR' ? '#fbbf24' : '#f87171',
                      }}>
                        {m.changeType.replace('_', ' ')} ({m.similarityPercentage}% Match)
                      </span>
                      <RiskBadge level={m.riskLevel} size="sm" />
                    </div>
                  </div>

                  {/* Change Explanation */}
                  <div style={{ padding: '0.65rem 0.85rem', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.02)', borderLeft: '3px solid var(--accent-indigo)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong>Shift Analysis:</strong> {m.changeSummary}
                  </div>

                  {/* Side-by-Side Text Blocks */}
                  <div className="grid grid-cols-2 gap-3" style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '4px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', fontFamily: 'var(--font-sans)', fontSize: '0.75rem' }}>
                        {result.titleA}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                        {m.textA}
                      </div>
                    </div>

                    <div style={{ padding: '0.75rem', borderRadius: '4px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', fontFamily: 'var(--font-sans)', fontSize: '0.75rem' }}>
                        {result.titleB}
                      </div>
                      <div style={{ color: 'var(--text-primary)', maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                        {m.textB}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div style={{ fontSize: '0.825rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                    <span><strong>Counter-Offer Strategy:</strong> {m.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Negotiation Advice */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Tactical Negotiation Playbook
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {result.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <span style={{ color: '#818cf8', fontWeight: 700 }}>{idx + 1}.</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
