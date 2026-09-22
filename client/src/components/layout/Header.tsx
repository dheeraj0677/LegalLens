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
  const TABS: Array<{ id: 'analyze' | 'compare' | 'simplify' | 'qa'; label: string; icon: React.ReactNode }> = [
    { id: 'analyze', label: 'Analyze & Risks', icon: <FileSearch size={16} strokeWidth={2.2} /> },
    { id: 'compare', label: 'Compare Contracts', icon: <GitCompare size={16} strokeWidth={2.2} /> },
    { id: 'simplify', label: 'Plain English', icon: <BookOpen size={16} strokeWidth={2.2} /> },
    { id: 'qa', label: 'Ask & Verify', icon: <MessageSquareText size={16} strokeWidth={2.2} /> },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = TABS.findIndex(t => t.id === activeTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = TABS[(currentIndex + 1) % TABS.length].id;
      setActiveTab(nextTab);
      document.getElementById(`nav-tab-${nextTab}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevTab = TABS[(currentIndex - 1 + TABS.length) % TABS.length].id;
      setActiveTab(prevTab);
      document.getElementById(`nav-tab-${prevTab}`)?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab(TABS[0].id);
      document.getElementById(`nav-tab-${TABS[0].id}`)?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveTab(TABS[TABS.length - 1].id);
      document.getElementById(`nav-tab-${TABS[TABS.length - 1].id}`)?.focus();
    }
  };

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
          role="tablist"
          aria-label="Main Navigation"
          onKeyDown={handleKeyDown}
          className="flex items-center gap-1"
          style={{
            background: 'var(--bg-tertiary)',
            padding: '5px',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-inset)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {TABS.map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                aria-selected={isSelected}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                role="tab"
                className="btn"
                style={{
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  background: isSelected ? '#ffffff' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: isSelected ? '0 3px 0 #ded8cd, 0 6px 14px rgba(0, 0, 0, 0.06)' : 'none',
                  border: isSelected ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  fontWeight: isSelected ? 800 : 600,
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
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
