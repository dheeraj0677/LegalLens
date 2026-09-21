import React from 'react';
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
    <header
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '1.1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px -2px rgba(25, 20, 15, 0.05)',
      }}
    >
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      <div className="container flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1.25rem' }}>
        
        {/* Italian Luxury Brand Emblem */}
        <div
          className="flex items-center gap-3"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('analyze')}
        >
          <div
            style={{
              background: 'linear-gradient(145deg, #18181b 0%, #27272a 100%)',
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 14px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              border: '1px solid #18181b',
            }}
          >
            <Scale size={24} color="#dfb15b" strokeWidth={2.2} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.55rem',
                  letterSpacing: '-0.04em',
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                LEGALLENS
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--accent-gold)',
                  fontWeight: 800,
                  border: '1px solid rgba(184, 134, 11, 0.25)',
                }}
              >
                MILANO
              </span>
            </div>
            <p
              style={{
                fontSize: '0.725rem',
                color: 'var(--text-muted)',
                margin: '2px 0 0 0',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Architectural Legal Intelligence
            </p>
          </div>
        </div>

        {/* 3D Tactile Segmented Navigation (Italian Marble Dock) */}
        <nav
          aria-label="Main Navigation"
          className="flex items-center gap-1"
          style={{
            background: 'var(--bg-tertiary)',
            padding: '5px',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-inset)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            id="nav-tab-analyze"
            onClick={() => setActiveTab('analyze')}
            aria-selected={activeTab === 'analyze'}
            role="tab"
            className="btn"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              borderRadius: '10px',
              background: activeTab === 'analyze' ? '#ffffff' : 'transparent',
              color: activeTab === 'analyze' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'analyze' ? '0 3px 0 #ded8cd, 0 6px 14px rgba(0, 0, 0, 0.06)' : 'none',
              border: activeTab === 'analyze' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              fontWeight: activeTab === 'analyze' ? 800 : 600,
            }}
          >
            <FileSearch size={16} strokeWidth={2.2} />
            <span>Analyze & Risks</span>
          </button>

          <button
            id="nav-tab-compare"
            onClick={() => setActiveTab('compare')}
            aria-selected={activeTab === 'compare'}
            role="tab"
            className="btn"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              borderRadius: '10px',
              background: activeTab === 'compare' ? '#ffffff' : 'transparent',
              color: activeTab === 'compare' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'compare' ? '0 3px 0 #ded8cd, 0 6px 14px rgba(0, 0, 0, 0.06)' : 'none',
              border: activeTab === 'compare' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              fontWeight: activeTab === 'compare' ? 800 : 600,
            }}
          >
            <GitCompare size={16} strokeWidth={2.2} />
            <span>Compare Contracts</span>
          </button>

          <button
            id="nav-tab-simplify"
            onClick={() => setActiveTab('simplify')}
            aria-selected={activeTab === 'simplify'}
            role="tab"
            className="btn"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              borderRadius: '10px',
              background: activeTab === 'simplify' ? '#ffffff' : 'transparent',
              color: activeTab === 'simplify' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'simplify' ? '0 3px 0 #ded8cd, 0 6px 14px rgba(0, 0, 0, 0.06)' : 'none',
              border: activeTab === 'simplify' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              fontWeight: activeTab === 'simplify' ? 800 : 600,
            }}
          >
            <BookOpen size={16} strokeWidth={2.2} />
            <span>Plain English</span>
          </button>

          <button
            id="nav-tab-qa"
            onClick={() => setActiveTab('qa')}
            aria-selected={activeTab === 'qa'}
            role="tab"
            className="btn"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              borderRadius: '10px',
              background: activeTab === 'qa' ? '#ffffff' : 'transparent',
              color: activeTab === 'qa' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'qa' ? '0 3px 0 #ded8cd, 0 6px 14px rgba(0, 0, 0, 0.06)' : 'none',
              border: activeTab === 'qa' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              fontWeight: activeTab === 'qa' ? 800 : 600,
            }}
          >
            <MessageSquareText size={16} strokeWidth={2.2} />
            <span>Ask & Verify</span>
          </button>
        </nav>

        {/* Right Hardware Badge & Theme Switch */}
        <div className="flex items-center gap-3">
          <div
            title={`Connected to OpenRouter: ${modelName}`}
            className="flex items-center gap-2"
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '9999px',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-primary)',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Sparkles size={14} color="#b8860b" />
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {modelName.split('/').pop() || 'Gemini 2.5 Flash'}
            </span>
          </div>

          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="btn btn-secondary"
            style={{
              padding: '0.55rem',
              borderRadius: '12px',
              width: '42px',
              height: '42px',
            }}
          >
            {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#18181b" />}
          </button>
        </div>

      </div>
    </header>
  );
};
