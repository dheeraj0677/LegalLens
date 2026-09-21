import { Sparkles, Scale, Sun, Moon, FileSearch, GitCompare, BookOpen, MessageSquareText } from 'lucide-react';

interface HeaderProps {
  activeTab: 'analyze' | 'compare' | 'simplify' | 'qa';
  setActiveTab: (tab: 'analyze' | 'compare' | 'simplify' | 'qa') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  modelName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  modelName,
}) => {
  return (
    <header className="glass-panel" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="container flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('analyze')}>
          <div style={{
            background: 'var(--gradient-brand)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Scale size={24} color="#ffffff" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Legal<span style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lens</span>
              </span>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 600 }}>
                GenAI 2.0
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Accessible Legal Document Intelligence</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav aria-label="Main Navigation" className="flex items-center gap-2" style={{ background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <button
            id="nav-tab-analyze"
            onClick={() => setActiveTab('analyze')}
            aria-selected={activeTab === 'analyze'}
            role="tab"
            className="btn"
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.85rem',
              borderRadius: '8px',
              background: activeTab === 'analyze' ? 'var(--accent-indigo)' : 'transparent',
              color: activeTab === 'analyze' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <FileSearch size={16} />
            <span>Analyze & Risks</span>
          </button>

          <button
            id="nav-tab-compare"
            onClick={() => setActiveTab('compare')}
            aria-selected={activeTab === 'compare'}
            role="tab"
            className="btn"
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.85rem',
              borderRadius: '8px',
              background: activeTab === 'compare' ? 'var(--accent-indigo)' : 'transparent',
              color: activeTab === 'compare' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <GitCompare size={16} />
            <span>Compare Contracts</span>
          </button>

          <button
            id="nav-tab-simplify"
            onClick={() => setActiveTab('simplify')}
            aria-selected={activeTab === 'simplify'}
            role="tab"
            className="btn"
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.85rem',
              borderRadius: '8px',
              background: activeTab === 'simplify' ? 'var(--accent-indigo)' : 'transparent',
              color: activeTab === 'simplify' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <BookOpen size={16} />
            <span>Plain English</span>
          </button>

          <button
            id="nav-tab-qa"
            onClick={() => setActiveTab('qa')}
            aria-selected={activeTab === 'qa'}
            role="tab"
            className="btn"
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.85rem',
              borderRadius: '8px',
              background: activeTab === 'qa' ? 'var(--accent-indigo)' : 'transparent',
              color: activeTab === 'qa' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <MessageSquareText size={16} />
            <span>Ask & Verify</span>
          </button>
        </nav>

        {/* Right Controls: Model Badge & Theme Toggle */}
        <div className="flex items-center gap-3">
          <div
            title={`Connected to OpenRouter: ${modelName}`}
            className="flex items-center gap-2"
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '0.75rem',
              color: '#34d399',
            }}
          >
            <Sparkles size={13} />
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {modelName.split('/').pop() || 'Gemini 2.5 Flash'}
            </span>
          </div>

          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="btn btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '10px' }}
          >
            {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
          </button>
        </div>

      </div>
    </header>
  );
};
