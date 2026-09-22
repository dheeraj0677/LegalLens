import React, { useState } from 'react';
import { apiService, ApiError } from '../../services/api';
import { DocumentAnalysisResult, SampleDocumentPreset } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  FileText,
  Upload,
  Sparkles,
  AlertCircle,
  CheckSquare,
  Square,
  HelpCircle,
  Download,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface AnalyzeTabProps {
  samplePresets: SampleDocumentPreset[];
  onSwitchToCompare?: (docA: string, docB: string) => void;
}

export const AnalyzeTab: React.FC<AnalyzeTabProps> = ({ samplePresets }) => {
  const [docText, setDocText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);

  // Filter state for clauses
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [expandedClauses, setExpandedClauses] = useState<Record<string, boolean>>({});
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAnalyze = async (textToUse?: string, titleToUse?: string) => {
    const text = textToUse !== undefined ? textToUse : docText;
    const title = titleToUse !== undefined ? titleToUse : docTitle;

    if (!text || text.trim().length === 0) {
      setError('Please paste a legal document or select a curated Italian preset.');
      return;
    }

    if (text.length > 100000) {
      setError(`Document length (${text.length.toLocaleString()} chars) exceeds 100,000 maximum allowed characters.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.analyzeDocument(text, title || undefined);
      setResult(res);
      const initialExpanded: Record<string, boolean> = {};
      res.clauses.forEach(c => {
        if (c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH') {
          initialExpanded[c.id] = true;
        }
      });
      setExpandedClauses(initialExpanded);
      setCompletedTasks({});
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to analyze document. Please check the network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPreset = (preset: SampleDocumentPreset) => {
    setDocTitle(preset.documentA.title);
    setDocText(preset.documentA.text);
    handleAnalyze(preset.documentA.text, preset.documentA.title);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        setDocText(content);
      }
    };
    reader.readAsText(file);
  };

  const toggleClause = (id: string) => {
    setExpandedClauses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTask = (id: string) => {
    setCompletedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportReport = () => {
    if (!result) return;
    const lines = [
      `# LegalLens Intelligence Audit: ${result.documentTitle}`,
      `Audited: ${new Date(result.analyzedAt).toLocaleString()}`,
      `Risk Profile: ${result.overallRiskLevel} (Index: ${result.overallRiskScore}/100)`,
      `Classification: ${result.documentType}`,
      '',
      '## Executive Brief',
      result.executiveSummary,
      '',
      '## Actionable Governance Checklist',
      ...result.actionChecklist.map(t => `- [${completedTasks[t.id] ? 'X' : ' '}] (${t.priority} Priority) ${t.task}`),
      '',
      '## Strategic Counsel Inquiries',
      ...result.suggestedQuestionsForLawyer.map(q => `1. ${q}`),
      '',
      '## Clause Risk Dissection',
      ...result.clauses.map(c => 
        `### ${c.heading} [${c.riskLevel} RISK - ${c.riskScore}/10]\nCategory: ${c.category}\n\n**Plain Meaning:**\n${c.plainExplanation}\n\n**Risk Context:**\n${c.riskReason}\n\n**Actionable Safeguard:**\n${c.suggestedAction}\n\n---\n`
      ),
      '',
      '> LegalLens is an assistive tool and does not constitute formal legal advice.',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.documentTitle.toLowerCase().replace(/\W+/g, '-')}-legallens-audit.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredClauses = result?.clauses.filter(c => {
    if (filterRisk === 'ALL') return true;
    return c.riskLevel === filterRisk;
  }) || [];

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const totalTasks = result?.actionChecklist.length || 0;

  return (
    <div className="flex flex-col gap-10 animate-fade-in" style={{ padding: '2.5rem 0' }}>
      
      {/* Italian Editorial Hero Title */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 800,
              color: 'var(--accent-gold)',
            }}
          >
            PRECISION LEGAL AUDITING
          </span>
          <span style={{ color: 'var(--border-subtle)' }}>/</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>COLLEZIONE MILANO</span>
        </div>

        <h1 style={{ letterSpacing: '-0.03em', fontSize: 'clamp(2.4rem, 4.5vw, 3.2rem)' }}>
          Contract Risk Architecture <span className="font-editorial" style={{ fontWeight: 400, color: 'var(--accent-gold)' }}>& Clause Intelligence</span>
        </h1>
        
        <p style={{ fontSize: '1.1rem', maxWidth: '820px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          Architectural contract dissection and risk discovery. Unravels hidden liability traps, translates labyrinthine clauses into pure everyday clarity, and equips you with actionable negotiation checklists.
        </p>
      </div>

      {/* 3D Floating Curated Preset Cards */}
      {samplePresets.length > 0 && !result && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass size={18} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.825rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                Curated Verification Presets (1-Click Test)
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready for instant review</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {samplePresets.map(p => (
              <div
                key={p.id}
                onClick={() => handleLoadPreset(p)}
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
                  <span style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    color: 'var(--accent-gold)',
                    background: 'var(--bg-tertiary)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}>
                    {p.category}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', margin: '0.6rem 0 0.25rem 0', color: 'var(--text-primary)' }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {p.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-1" style={{ marginTop: '1rem', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 700 }}>
                  <span>Analyze Contract</span>
                  <ArrowRight size={14} color="var(--accent-gold)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Sculpted Document Ingestion Console */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <label htmlFor="doc-title-input" className="form-label">
              Document Designation
            </label>
            <input
              id="doc-title-input"
              type="text"
              placeholder="e.g., Master SaaS Subscription Agreement — Milano Edition"
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 1rem',
                color: 'var(--text-primary)',
                fontSize: '0.925rem',
                fontWeight: 600,
                minWidth: '340px',
                boxShadow: 'var(--shadow-inset)',
              }}
            />
          </div>

          {/* Action Hardware Controls */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="doc-file-upload"
              className="btn btn-secondary"
              style={{ cursor: 'pointer', fontSize: '0.85rem' }}
            >
              <Upload size={16} strokeWidth={2.2} />
              <span>Upload Document</span>
              <input
                id="doc-file-upload"
                type="file"
                accept=".txt,.md,.text"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>

            {docText && (
              <button
                onClick={() => { setDocText(''); setDocTitle(''); setResult(null); setError(null); }}
                className="btn btn-outline"
                title="Reset Document"
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 3D Inset Text Area */}
        <div>
          <label htmlFor="doc-text-area" className="form-label flex items-center justify-between">
            <span>Contract Text Ingestion</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: docText.length > 90000 ? 'var(--risk-critical)' : 'var(--text-muted)' }}>
              {docText.length.toLocaleString()} / 100,000 chars
            </span>
          </label>
          <textarea
            id="doc-text-area"
            rows={8}
            className="textarea-custom"
            placeholder="Paste your legal agreement, contract clauses, non-disclosure terms, or commercial covenants here..."
            value={docText}
            onChange={e => setDocText(e.target.value)}
          />
        </div>

        {/* Error Callout */}
        {error && (
          <div
            role="alert"
            style={{
              marginTop: '1.25rem',
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

        {/* 3D Submission Button */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            id="analyze-submit-btn"
            onClick={() => handleAnalyze()}
            disabled={loading || !docText.trim()}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2.25rem', fontSize: '1rem' }}
          >
            {loading ? (
              <>
                <Sparkles className="animate-spin" size={18} />
                <span>Architecting Risk Profile...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} color="#dfb15b" />
                <span>Perform Legal Risk Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Display (Italian Sculpted Dossier) */}
      {result && (
        <div className="flex flex-col gap-8 animate-fade-in">
          
          {/* Top Overview Grid */}
          <div className="grid grid-cols-3 gap-6">
            
            {/* Executive Summary (Spans 2 columns) */}
            <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '2rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <div className="flex items-center gap-2">
                  <FileText size={22} color="var(--accent-gold)" />
                  <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Executive Dossier: {result.documentTitle}</h2>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  {result.documentType}
                </span>
              </div>

              <p style={{ fontSize: '1.025rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
                {result.executiveSummary}
              </p>

              <div className="flex items-center gap-4" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                <span>Audited: {new Date(result.analyzedAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{result.clauses.length} Structured Clauses Evaluated</span>
                <span>•</span>
                <span>{result.charCount.toLocaleString()} Characters Processed</span>
              </div>
            </div>

            {/* 3D Sculpted Risk Dial Dial / Meter Card */}
            <div className="glass-panel flex flex-col items-center justify-center text-center" style={{ padding: '2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
                Aggregate Risk Index
              </span>

              {/* 3D Embossed Score Badge */}
              <div style={{
                margin: '1rem 0',
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                background: 'linear-gradient(145deg, #ffffff 0%, #f3efe6 100%)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 2px 4px #ffffff, inset 0 -2px 4px rgba(0,0,0,0.05)',
                border: '2px solid rgba(184, 134, 11, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: '2.6rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  lineHeight: 1,
                  color: result.overallRiskScore > 70 ? 'var(--risk-critical)' : result.overallRiskScore > 40 ? 'var(--risk-medium)' : 'var(--risk-low)',
                }}>
                  {result.overallRiskScore}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>/ 100</span>
              </div>

              <RiskBadge level={result.overallRiskLevel} size="lg" />

              {/* Breakdown Pills */}
              <div className="flex items-center gap-2" style={{ marginTop: '1.25rem', fontSize: '0.78rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--risk-critical)' }}>{result.riskDistribution.critical} Crit</span>
                <span>•</span>
                <span style={{ color: 'var(--risk-high)' }}>{result.riskDistribution.high} High</span>
                <span>•</span>
                <span style={{ color: 'var(--risk-medium)' }}>{result.riskDistribution.medium} Med</span>
                <span>•</span>
                <span style={{ color: 'var(--risk-low)' }}>{result.riskDistribution.low} Low</span>
              </div>
            </div>

          </div>

          {/* Actionable Governance Checklist & Counsel Inquiries */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* 3D Action Checklist */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                <div className="flex items-center gap-2">
                  <CheckSquare size={20} color="var(--risk-low)" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Governance Checklist</h3>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: 'var(--risk-low-bg)',
                  color: 'var(--risk-low)',
                  border: '1px solid var(--risk-low-border)',
                }}>
                  {completedCount} of {totalTasks} Satisfied
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {result.actionChecklist.map(task => {
                  const done = Boolean(completedTasks[task.id]);
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="card-interactive"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.85rem',
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        background: done ? 'var(--bg-tertiary)' : '#ffffff',
                        border: done ? '1px solid rgba(4, 120, 87, 0.3)' : '1px solid var(--border-subtle)',
                        boxShadow: done ? 'none' : 'var(--shadow-3d-white)',
                      }}
                    >
                      <button
                        type="button"
                        aria-label={`Mark task as ${done ? 'incomplete' : 'complete'}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: done ? 'var(--risk-low)' : 'var(--text-muted)', marginTop: '2px' }}
                      >
                        {done ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontSize: '0.925rem',
                          fontWeight: done ? 500 : 600,
                          color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: done ? 'line-through' : 'none',
                          lineHeight: 1.5,
                        }}>
                          {task.task}
                        </span>
                        <div style={{ marginTop: '6px' }}>
                          <span style={{
                            fontSize: '0.675rem',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: task.priority === 'HIGH' ? 'var(--risk-critical-bg)' : 'var(--risk-medium-bg)',
                            color: task.priority === 'HIGH' ? 'var(--risk-critical)' : 'var(--risk-medium)',
                          }}>
                            {task.priority} PRIORITY
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strategic Questions for Legal Counsel */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                <div className="flex items-center gap-2">
                  <HelpCircle size={20} color="var(--accent-gold)" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Questions for Your Attorney</h3>
                </div>
                <button
                  onClick={exportReport}
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                >
                  <Download size={14} />
                  <span>Export Audit</span>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {result.suggestedQuestionsForLawyer.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-inset)',
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.95rem' }}>{idx + 1}.</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Clause-by-Clause Dissection Explorer */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>
                  Clause-by-Clause Risk Dissection ({result.clauses.length})
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Click any provision to uncover plain meaning, trap alerts, and recommended counter-actions
                </p>
              </div>

              {/* 3D Segmented Filter Controls */}
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
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setFilterRisk(lvl)}
                    className="btn"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      borderRadius: '8px',
                      background: filterRisk === lvl ? '#ffffff' : 'transparent',
                      color: filterRisk === lvl ? 'var(--text-primary)' : 'var(--text-muted)',
                      boxShadow: filterRisk === lvl ? '0 2px 0 #ded8cd, 0 4px 8px rgba(0,0,0,0.04)' : 'none',
                      border: filterRisk === lvl ? '1px solid var(--border-subtle)' : 'none',
                      fontWeight: filterRisk === lvl ? 800 : 600,
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Clauses List */}
            <div className="flex flex-col gap-4">
              {filteredClauses.map(clause => {
                const isExpanded = Boolean(expandedClauses[clause.id]);
                return (
                  <div
                    key={clause.id}
                    style={{
                      border: '1.5px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      background: '#ffffff',
                      boxShadow: 'var(--shadow-3d-white)',
                      overflow: 'hidden',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleClause(clause.id)}
                      className="flex items-center justify-between card-interactive"
                      style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
                        background: isExpanded ? 'var(--bg-secondary)' : '#ffffff',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                          {clause.heading}
                        </span>
                        <span style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-muted)',
                        }}>
                          {clause.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <RiskBadge level={clause.riskLevel} score={clause.riskScore} />
                        {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {/* Expanded Detail Body */}
                    {isExpanded && (
                      <div style={{ padding: '1.5rem', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        
                        {/* Plain English Translation Card */}
                        <div style={{
                          padding: '1.25rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-secondary)',
                          border: '1.5px solid rgba(184, 134, 11, 0.25)',
                          boxShadow: 'var(--shadow-inset)',
                        }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Plain Meaning & Core Legal Effect
                          </span>
                          <p style={{ fontSize: '0.975rem', color: 'var(--text-primary)', margin: '0.4rem 0 0 0', lineHeight: 1.65 }}>
                            {clause.plainExplanation}
                          </p>
                        </div>

                        {/* Risk & Recommendation Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div style={{
                            padding: '1.15rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--risk-critical-bg)',
                            border: '1px solid var(--risk-critical-border)',
                          }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--risk-critical)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Risk Context & Covert Trap Alert
                            </span>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0 0', lineHeight: 1.55 }}>
                              {clause.riskReason}
                            </p>
                          </div>

                          <div style={{
                            padding: '1.15rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--risk-low-bg)',
                            border: '1px solid var(--risk-low-border)',
                          }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--risk-low)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Tactical Counter-Measure
                            </span>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0 0', lineHeight: 1.55 }}>
                              {clause.suggestedAction}
                            </p>
                          </div>
                        </div>

                        {/* Raw Original Text Block with Copy Action */}
                        <div>
                          <div className="flex items-center justify-between" style={{ marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                              Verbatim Clause Language
                            </span>
                            <button
                              onClick={() => copyToClipboard(clause.originalText, clause.id)}
                              className="btn btn-outline"
                              style={{ padding: '3px 9px', fontSize: '0.725rem' }}
                            >
                              {copiedId === clause.id ? <Check size={13} color="var(--risk-low)" /> : <Copy size={13} />}
                              <span>{copiedId === clause.id ? 'Copied to Clipboard' : 'Copy Language'}</span>
                            </button>
                          </div>
                          
                          <div style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.825rem',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '160px',
                            overflowY: 'auto',
                            boxShadow: 'var(--shadow-inset)',
                            lineHeight: 1.6,
                          }}>
                            {clause.originalText}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
