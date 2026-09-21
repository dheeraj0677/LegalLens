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
  Filter,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
  Zap,
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
      setError('Please paste a legal document or select a sample preset.');
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
      // Auto-expand high & critical clauses by default
      const initialExpanded: Record<string, boolean> = {};
      res.clauses.forEach(c => {
        if (c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH') {
          initialExpanded[c.id] = true;
        }
      });
      setExpandedClauses(initialExpanded);
      setCompletedTasks({});
    } catch (err: any) {
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
      `# LegalLens Analysis: ${result.documentTitle}`,
      `Generated on: ${new Date(result.analyzedAt).toLocaleString()}`,
      `Overall Risk: ${result.overallRiskLevel} (${result.overallRiskScore}/100)`,
      `Document Type: ${result.documentType}`,
      '',
      '## Executive Summary',
      result.executiveSummary,
      '',
      '## Action Checklist',
      ...result.actionChecklist.map(t => `- [${completedTasks[t.id] ? 'X' : ' '}] (${t.priority} Priority) ${t.task}`),
      '',
      '## Key Questions for Your Lawyer',
      ...result.suggestedQuestionsForLawyer.map(q => `1. ${q}`),
      '',
      '## Clause Risk Breakdown',
      ...result.clauses.map(c => 
        `### ${c.heading} [${c.riskLevel} RISK - ${c.riskScore}/10]\nCategory: ${c.category}\n\n**Plain Meaning:**\n${c.plainExplanation}\n\n**Risk Context:**\n${c.riskReason}\n\n**Suggested Action:**\n${c.suggestedAction}\n\n---\n`
      ),
      '',
      '> LegalLens is an assistive tool and does not constitute formal legal advice.',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.documentTitle.toLowerCase().replace(/\W+/g, '-')}-legallens-report.md`;
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
    <div className="flex flex-col gap-8 animate-fade-in" style={{ padding: '2rem 0' }}>
      
      {/* Hero Intro */}
      <div className="flex flex-col gap-2">
        <h1 style={{ letterSpacing: '-0.02em' }}>
          Document Risk & Clause Intelligence
        </h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '800px' }}>
          Instantly dissect contracts, discover hidden liability traps, unpack confusing legal wording into 8th-grade English, and generate actionable lawyer question lists.
        </p>
      </div>

      {/* Preset Quick Loader Buttons */}
      {samplePresets.length > 0 && !result && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
            <Zap size={16} color="#3b82f6" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Start Presets (1-Click Test)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {samplePresets.map(p => (
              <button
                key={p.id}
                onClick={() => handleLoadPreset(p)}
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
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.title}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{p.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Document Input Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <label htmlFor="doc-title-input" className="form-label">
              Document Title (Optional)
            </label>
            <input
              id="doc-title-input"
              type="text"
              placeholder="e.g. Master Services Agreement v2"
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.85rem',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                minWidth: '280px',
              }}
            />
          </div>

          {/* File Upload Trigger */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="doc-file-upload"
              className="btn btn-outline"
              style={{ cursor: 'pointer', fontSize: '0.85rem' }}
            >
              <Upload size={16} />
              <span>Upload Text/File</span>
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
                className="btn btn-secondary"
                title="Clear text"
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Textarea for document */}
        <div>
          <label htmlFor="doc-text-area" className="form-label flex items-center justify-between">
            <span>Paste Contract / Legal Text</span>
            <span style={{ fontSize: '0.75rem', color: docText.length > 90000 ? '#ef4444' : 'var(--text-muted)' }}>
              {docText.length.toLocaleString()} / 100,000 characters
            </span>
          </label>
          <textarea
            id="doc-text-area"
            rows={8}
            className="textarea-custom"
            placeholder="Paste your legal agreement, contract, NDA, terms of service, or employment offer here..."
            value={docText}
            onChange={e => setDocText(e.target.value)}
          />
        </div>

        {/* Error Notification */}
        {error && (
          <div
            role="alert"
            style={{
              marginTop: '1rem',
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

        {/* Action Button */}
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            id="analyze-submit-btn"
            onClick={() => handleAnalyze()}
            disabled={loading || !docText.trim()}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}
          >
            {loading ? (
              <>
                <Sparkles className="animate-spin" size={18} />
                <span>Analyzing Clauses with GenAI...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Run Legal Risk Intelligence</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="flex flex-col gap-8 animate-fade-in">
          
          {/* Top Overview Grid */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* Executive Summary Card (Spans 2 columns) */}
            <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                <div className="flex items-center gap-2">
                  <FileText size={20} color="#3b82f6" />
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Executive Brief: {result.documentTitle}</h2>
                </div>
                <span style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                  {result.documentType}
                </span>
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--text-primary)' }}>
                {result.executiveSummary}
              </p>
              <div className="flex items-center gap-4" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Analyzed: {new Date(result.analyzedAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{result.clauses.length} Structured Clauses Extracted</span>
                <span>•</span>
                <span>{result.charCount.toLocaleString()} Characters Processed</span>
              </div>
            </div>

            {/* Overall Risk Score Card */}
            <div className="glass-panel flex flex-col items-center justify-center text-center" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Risk Score
              </span>
              <div style={{ margin: '0.75rem 0', position: 'relative' }}>
                <div style={{
                  fontSize: '3.25rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  lineHeight: 1,
                  color: result.overallRiskScore > 70 ? '#ef4444' : result.overallRiskScore > 40 ? '#f59e0b' : '#10b981'
                }}>
                  {result.overallRiskScore}
                  <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 500 }}>/100</span>
                </div>
              </div>
              <RiskBadge level={result.overallRiskLevel} size="lg" />

              {/* Mini distribution pill */}
              <div className="flex items-center gap-2" style={{ marginTop: '1.25rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#ef4444' }}>{result.riskDistribution.critical} Crit</span>
                <span>•</span>
                <span style={{ color: '#f97316' }}>{result.riskDistribution.high} High</span>
                <span>•</span>
                <span style={{ color: '#f59e0b' }}>{result.riskDistribution.medium} Med</span>
                <span>•</span>
                <span style={{ color: '#10b981' }}>{result.riskDistribution.low} Low</span>
              </div>
            </div>

          </div>

          {/* Action Checklist & Lawyer Inquiries */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Interactive Action Checklist */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <div className="flex items-center gap-2">
                  <CheckSquare size={18} color="#10b981" />
                  <h3 style={{ margin: 0 }}>Actionable Checklist</h3>
                </div>
                <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 600 }}>
                  {completedCount} of {totalTasks} Completed
                </span>
              </div>

              <div className="flex flex-col gap-2">
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
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: done ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        border: done ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-subtle)',
                      }}
                    >
                      <button
                        type="button"
                        aria-label={`Mark task as ${done ? 'incomplete' : 'complete'}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: done ? '#10b981' : 'var(--text-muted)', marginTop: '2px' }}
                      >
                        {done ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontSize: '0.875rem',
                          color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: done ? 'line-through' : 'none'
                        }}>
                          {task.task}
                        </span>
                        <div style={{ marginTop: '4px' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: task.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: task.priority === 'HIGH' ? '#f87171' : '#fbbf24',
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

            {/* Questions for Your Lawyer */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <div className="flex items-center gap-2">
                  <HelpCircle size={18} color="#6366f1" />
                  <h3 style={{ margin: 0 }}>Questions for Your Attorney</h3>
                </div>
                <button
                  onClick={exportReport}
                  className="btn btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  <Download size={13} />
                  <span>Export Report</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {result.suggestedQuestionsForLawyer.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(99, 102, 241, 0.05)',
                      border: '1px solid rgba(99, 102, 241, 0.15)',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ color: '#818cf8', fontWeight: 700 }}>{idx + 1}.</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Clause-by-Clause Deep Dive Explorer */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="flex items-center gap-2">
                <Filter size={18} color="#3b82f6" />
                <h3 style={{ margin: 0 }}>Clause-by-Clause Risk Breakdown ({result.clauses.length})</h3>
              </div>

              {/* Risk Filter Buttons */}
              <div className="flex items-center gap-1" style={{ background: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px' }}>
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setFilterRisk(lvl)}
                    className="btn"
                    style={{
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      background: filterRisk === lvl ? 'var(--accent-indigo)' : 'transparent',
                      color: filterRisk === lvl ? '#ffffff' : 'var(--text-secondary)',
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Clauses */}
            <div className="flex flex-col gap-3">
              {filteredClauses.map(clause => {
                const isExpanded = Boolean(expandedClauses[clause.id]);
                return (
                  <div
                    key={clause.id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(15, 23, 42, 0.5)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleClause(clause.id)}
                      className="flex items-center justify-between card-interactive"
                      style={{ padding: '1rem', borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none' }}
                    >
                      <div className="flex items-center gap-3">
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {clause.heading}
                        </span>
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                          {clause.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <RiskBadge level={clause.riskLevel} score={clause.riskScore} />
                        {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {/* Expanded Detail Body */}
                    {isExpanded && (
                      <div style={{ padding: '1.25rem', background: 'rgba(10, 15, 28, 0.7)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        {/* Plain English Translation */}
                        <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Plain English Meaning
                          </span>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0.25rem 0 0 0' }}>
                            {clause.plainExplanation}
                          </p>
                        </div>

                        {/* Risk Reason & Negotiation Tip */}
                        <div className="grid grid-cols-2 gap-3">
                          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase' }}>
                              Risk Context & Trap Alert
                            </span>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                              {clause.riskReason}
                            </p>
                          </div>

                          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                              Recommended Counter-Action
                            </span>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                              {clause.suggestedAction}
                            </p>
                          </div>
                        </div>

                        {/* Original Raw Text Snippet */}
                        <div>
                          <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Original Contract Clause</span>
                            <button
                              onClick={() => copyToClipboard(clause.originalText, clause.id)}
                              className="btn btn-outline"
                              style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                            >
                              {copiedId === clause.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                              <span>{copiedId === clause.id ? 'Copied' : 'Copy Text'}</span>
                            </button>
                          </div>
                          <div style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid var(--border-subtle)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '140px',
                            overflowY: 'auto'
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
