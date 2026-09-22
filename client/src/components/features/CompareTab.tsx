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
  Sliders,
  Scale,
} from 'lucide-react';

interface CompareTabProps {
  samplePresets: SampleDocumentPreset[];
}

export const CompareTab: React.FC<CompareTabProps> = ({ samplePresets }) => {
  const [docA, setDocA] = useState('');
  const [docB, setDocB] = useState('');
  const [titleA, setTitleA] = useState('Document A (Original Draft)');
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
    } catch (err: unknown) {
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
        return { text: 'Favors Document A (Original)', color: '#1e3a8a', bg: '#eff6ff', shadow: '0 2px 0 #93c5fd' };
      case 'FAVORS_PARTY_B':
        return { text: 'Favors Document B (Counter-Party)', color: '#b45309', bg: '#fffbeb', shadow: '0 2px 0 #fde68a' };
      case 'BALANCED':
        return { text: 'Equitably Balanced Terms', color: '#047857', bg: '#ecfdf5', shadow: '0 2px 0 #a7f3d0' };
      case 'NEEDS_LEGAL_INTERVENTION':
        return { text: 'Severe Divergence — Requires Counsel', color: '#be123c', bg: '#fff1f2', shadow: '0 2px 0 #fecdd3' };
    }
  };

  const filteredMatches = result?.matchedClauses.filter(m => {
    if (filterSeverity === 'ALL') return true;
    return m.changeType === filterSeverity;
  }) || [];

  return (
    <div className="flex flex-col gap-10 animate-fade-in" style={{ padding: '2.5rem 0' }}>
      
      {/* Italian Editorial Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800, color: 'var(--accent-gold)' }}>
            CONTRACT COMPARISON & REDLINE DIFFER
          </span>
          <span style={{ color: 'var(--border-subtle)' }}>/</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>COLLEZIONE MILANO</span>
        </div>

        <h1 style={{ letterSpacing: '-0.03em', fontSize: 'clamp(2.4rem, 4.5vw, 3.2rem)' }}>
          Bilateral Contract Differ <span className="font-editorial" style={{ fontWeight: 400, color: 'var(--accent-gold)' }}>& Redline Intelligence</span>
        </h1>

        <p style={{ fontSize: '1.1rem', maxWidth: '820px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          Cross-compare two agreements side-by-side. Automatically uncovers deleted safeguards, unilateral risk shifts, stealth additions, and armors you with tactical counter-offer strategies.
        </p>
      </div>

      {/* 3D Curated Comparison Demo Button */}
      {samplePresets.filter(p => p.documentB).length > 0 && !result && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div className="flex items-center gap-3">
              <div style={{
                background: 'var(--bg-tertiary)',
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)',
              }}>
                <Scale size={20} color="var(--accent-gold)" />
              </div>
              <div>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Load Curated Verification: {samplePresets[0].title}
                </span>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  {samplePresets[0].description}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleLoadSample(samplePresets[0])}
              className="btn btn-secondary"
            >
              <span>Launch 1-Click Comparison</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Dual Architectural Ingestion Panels */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Document A */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="doc-a-title" className="form-label">
              Document A Designation (Baseline / Original)
            </label>
            <input
              id="doc-a-title"
              type="text"
              value={titleA}
              onChange={e => setTitleA(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 1rem',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-inset)',
              }}
            />
          </div>
          <div>
            <label htmlFor="doc-a-text" className="form-label">
              Baseline Contract Language
            </label>
            <textarea
              id="doc-a-text"
              rows={9}
              className="textarea-custom"
              placeholder="Paste original baseline draft or standard NDA..."
              value={docA}
              onChange={e => setDocA(e.target.value)}
            />
          </div>
        </div>

        {/* Document B */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="doc-b-title" className="form-label">
              Document B Designation (Counter-Proposal / Revised)
            </label>
            <input
              id="doc-b-title"
              type="text"
              value={titleB}
              onChange={e => setTitleB(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 1rem',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-inset)',
              }}
            />
          </div>
          <div>
            <label htmlFor="doc-b-text" className="form-label">
              Counter-Proposal Contract Language
            </label>
            <textarea
              id="doc-b-text"
              rows={9}
              className="textarea-custom"
              placeholder="Paste revised counter-offer or counterparty draft..."
              value={docB}
              onChange={e => setDocB(e.target.value)}
            />
          </div>
        </div>

      </div>

      {/* Error Callout */}
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
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* 3D Action Controls */}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        {(docA || docB || result) && (
          <button
            onClick={() => { setDocA(''); setDocB(''); setResult(null); setError(null); }}
            className="btn btn-outline"
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
          style={{ padding: '0.85rem 2.25rem', fontSize: '1rem', marginLeft: 'auto' }}
        >
          {loading ? (
            <>
              <Sparkles className="animate-spin" size={18} />
              <span>Analyzing Comparative Redlines...</span>
            </>
          ) : (
            <>
              <GitCompare size={18} color="#dfb15b" />
              <span>Execute Bilateral Comparison</span>
            </>
          )}
        </button>
      </div>

      {/* Comparison Results */}
      {result && (
        <div className="flex flex-col gap-8 animate-fade-in">
          
          {/* Top Level Comparison Outcome Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="flex items-center gap-3">
                <GitCompare size={24} color="var(--accent-gold)" />
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Comparative Synthesis Report</h2>
              </div>

              {(() => {
                const badge = getFavorabilityBadge(result.favorability);
                return (
                  <span
                    style={{
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      background: badge.bg,
                      color: badge.color,
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      border: `1.5px solid ${badge.color}40`,
                      boxShadow: badge.shadow,
                    }}
                  >
                    {badge.text}
                  </span>
                );
              })()}
            </div>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>
              {result.overallSummary}
            </p>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', marginTop: '0.65rem' }}>
              <strong>Net Assessment:</strong> {result.favorabilityExplanation}
            </p>

            {/* Key Differences List */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Primary Structural Discrepancies
              </span>
              <ul style={{ marginTop: '0.75rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.keyDifferences.map((diff, idx) => (
                  <li key={idx} style={{ fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {diff}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Omission Alerts (Clauses Only in A or B) */}
          {(result.onlyInA.length > 0 || result.onlyInB.length > 0) && (
            <div className="grid grid-cols-2 gap-6">
              
              {/* Present only in A (Omitted in B) */}
              <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '5px solid var(--risk-medium)' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.65rem' }}>
                  <AlertTriangle size={20} color="var(--risk-medium)" />
                  <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--risk-medium)' }}>
                    Omitted from Counter-Proposal ({result.onlyInA.length})
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  These protective provisions existed in Document A but were removed in Document B:
                </p>
                <div className="flex flex-col gap-2" style={{ marginTop: '1rem' }}>
                  {result.onlyInA.map(c => (
                    <div key={c.id} style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{c.heading}:</strong> {c.plainExplanation}
                    </div>
                  ))}
                </div>
              </div>

              {/* Present only in B (Newly introduced) */}
              <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '5px solid var(--risk-critical)' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.65rem' }}>
                  <AlertCircle size={20} color="var(--risk-critical)" />
                  <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--risk-critical)' }}>
                    Newly Introduced in Counter-Proposal ({result.onlyInB.length})
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Fresh covenants injected into Document B not found in the original draft:
                </p>
                <div className="flex flex-col gap-2" style={{ marginTop: '1rem' }}>
                  {result.onlyInB.map(c => (
                    <div key={c.id} style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{c.heading}:</strong> {c.plainExplanation}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Matched Clauses Deep Dive */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="flex items-center gap-2">
                <Sliders size={20} color="var(--accent-gold)" />
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Clause-by-Clause Cross Comparison ({result.matchedClauses.length})</h3>
              </div>

              {/* Severity Filter Controls */}
              <div
                className="flex items-center gap-1"
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '4px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-inset)',
                }}
              >
                {['ALL', 'IDENTICAL', 'MODIFIED_MINOR', 'MODIFIED_MAJOR', 'CONTRADICTORY'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className="btn"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.725rem',
                      borderRadius: '8px',
                      background: filterSeverity === sev ? '#ffffff' : 'transparent',
                      color: filterSeverity === sev ? 'var(--text-primary)' : 'var(--text-muted)',
                      boxShadow: filterSeverity === sev ? '0 2px 0 #ded8cd, 0 4px 8px rgba(0,0,0,0.04)' : 'none',
                      border: filterSeverity === sev ? '1px solid var(--border-subtle)' : 'none',
                      fontWeight: filterSeverity === sev ? 800 : 600,
                    }}
                  >
                    {sev.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Matched Clauses */}
            <div className="flex flex-col gap-5">
              {filteredMatches.map(m => (
                <div
                  key={m.id}
                  style={{
                    border: '1.5px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: 'var(--shadow-3d-white)',
                  }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                        {m.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                        {m.clauseCategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: m.changeType === 'IDENTICAL' ? 'var(--risk-low-bg)' :
                                    m.changeType === 'MODIFIED_MINOR' ? '#eff6ff' :
                                    m.changeType === 'MODIFIED_MAJOR' ? 'var(--risk-medium-bg)' : 'var(--risk-critical-bg)',
                        color: m.changeType === 'IDENTICAL' ? 'var(--risk-low)' :
                               m.changeType === 'MODIFIED_MINOR' ? '#1e3a8a' :
                               m.changeType === 'MODIFIED_MAJOR' ? 'var(--risk-medium)' : 'var(--risk-critical)',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        {m.changeType.replace('_', ' ')} ({m.similarityPercentage}% Match)
                      </span>
                      <RiskBadge level={m.riskLevel} size="sm" />
                    </div>
                  </div>

                  {/* Change Explanation */}
                  <div style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    borderLeft: '4px solid var(--accent-gold)',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}>
                    <strong>Shift Analysis:</strong> {m.changeSummary}
                  </div>

                  {/* Side-by-Side Text Blocks */}
                  <div className="grid grid-cols-2 gap-4" style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                    <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-inset)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {result.titleA}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', maxHeight: '140px', overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {m.textA}
                      </div>
                    </div>

                    <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1.5px solid var(--border-subtle)', boxShadow: 'var(--shadow-inset)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '0.4rem', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {result.titleB}
                      </div>
                      <div style={{ color: 'var(--text-primary)', maxHeight: '140px', overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {m.textB}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div style={{ fontSize: '0.875rem', color: 'var(--risk-low)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                    <span><strong>Counter-Offer Strategy:</strong> {m.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Negotiation Playbook */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)', fontSize: '1.3rem' }}>
              Tactical Counter-Offer Playbook
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {result.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1.15rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-inset)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    fontSize: '0.9rem',
                    lineHeight: 1.55,
                  }}
                >
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.95rem' }}>{idx + 1}.</span>
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
