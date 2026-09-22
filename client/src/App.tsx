import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AriaLiveRegion } from './components/common/AriaLiveRegion';
import { apiService } from './services/api';
import { SampleDocumentPreset } from './types';

// Optimized code-split feature tabs
const AnalyzeTab = lazy(() => import('./components/features/AnalyzeTab'));
const CompareTab = lazy(() => import('./components/features/CompareTab'));
const SimplifyTab = lazy(() => import('./components/features/SimplifyTab'));
const QATab = lazy(() => import('./components/features/QATab'));

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'compare' | 'simplify' | 'qa'>('analyze');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [modelName, setModelName] = useState<string>('qwen/qwen3.8-27b:free');
  const [samplePresets, setSamplePresets] = useState<SampleDocumentPreset[]>([]);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('Welcome to LegalLens. Workspace ready.');

  // Initialize theme from localStorage or default to Italian Luxury White
  useEffect(() => {
    const saved = localStorage.getItem('legallens_theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('legallens_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleTabChange = (tab: 'analyze' | 'compare' | 'simplify' | 'qa') => {
    setActiveTab(tab);
    const labels: Record<string, string> = {
      analyze: 'Active: Analyze and Risk Intelligence panel.',
      compare: 'Active: Bilateral Contract Comparison panel.',
      simplify: 'Active: Plain English Simplifier panel.',
      qa: 'Active: Grounded Document Q and A panel.',
    };
    setAriaAnnouncement(labels[tab] || 'Tab switched.');
  };

  // Fetch backend status and sample documents
  useEffect(() => {
    apiService
      .getHealth()
      .then(data => {
        if (data.model) {
          setModelName(data.model);
        }
      })
      .catch(err => {
        console.warn('Backend health check skipped, using local defaults:', err);
      });

    apiService
      .getSampleDocuments()
      .then(data => {
        if (data.presets) {
          setSamplePresets(data.presets);
        }
      })
      .catch(err => {
        console.warn('Failed to load sample documents:', err);
      });
  }, []);

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Dynamic screen reader announcements */}
        <AriaLiveRegion message={ariaAnnouncement} politeness="polite" />

        {/* Accessible Header with Roving Tabindex Navigation */}
        <Header
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          theme={theme}
          toggleTheme={toggleTheme}
          modelName={modelName}
        />

        {/* Main Content Landmark with Accessible Tabpanels */}
        <main id="main-content" className="container" style={{ flex: 1 }}>
          <Suspense
            fallback={
              <div
                role="status"
                aria-label="Loading document workspace"
                style={{
                  minHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  padding: '3rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #e5e7eb',
                    borderTopColor: 'var(--accent-gold, #dfb15b)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Sculpting Legal Workspace...
                </span>
              </div>
            }
          >
            <div
              id="tabpanel-analyze"
              role="tabpanel"
              aria-labelledby="nav-tab-analyze"
              tabIndex={0}
              hidden={activeTab !== 'analyze'}
            >
              {activeTab === 'analyze' && <AnalyzeTab samplePresets={samplePresets} />}
            </div>

            <div
              id="tabpanel-compare"
              role="tabpanel"
              aria-labelledby="nav-tab-compare"
              tabIndex={0}
              hidden={activeTab !== 'compare'}
            >
              {activeTab === 'compare' && <CompareTab samplePresets={samplePresets} />}
            </div>

            <div
              id="tabpanel-simplify"
              role="tabpanel"
              aria-labelledby="nav-tab-simplify"
              tabIndex={0}
              hidden={activeTab !== 'simplify'}
            >
              {activeTab === 'simplify' && <SimplifyTab />}
            </div>

            <div
              id="tabpanel-qa"
              role="tabpanel"
              aria-labelledby="nav-tab-qa"
              tabIndex={0}
              hidden={activeTab !== 'qa'}
            >
              {activeTab === 'qa' && <QATab samplePresets={samplePresets} />}
            </div>
          </Suspense>
        </main>

        {/* Accessible Footer with Legal Disclaimer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default App;
