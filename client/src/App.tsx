import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AnalyzeTab } from './components/features/AnalyzeTab';
import { CompareTab } from './components/features/CompareTab';
import { SimplifyTab } from './components/features/SimplifyTab';
import { QATab } from './components/features/QATab';
import { apiService } from './services/api';
import { SampleDocumentPreset } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'compare' | 'simplify' | 'qa'>('analyze');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [modelName, setModelName] = useState<string>('google/gemini-2.5-flash');
  const [samplePresets, setSamplePresets] = useState<SampleDocumentPreset[]>([]);

  // Initialize theme from localStorage or preferred system
  useEffect(() => {
    const saved = localStorage.getItem('legallens_theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('legallens_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Accessible Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        modelName={modelName}
      />

      {/* Main Content Landmark */}
      <main id="main-content" className="container" style={{ flex: 1 }}>
        {activeTab === 'analyze' && <AnalyzeTab samplePresets={samplePresets} />}
        {activeTab === 'compare' && <CompareTab samplePresets={samplePresets} />}
        {activeTab === 'simplify' && <SimplifyTab />}
        {activeTab === 'qa' && <QATab samplePresets={samplePresets} />}
      </main>

      {/* Accessible Footer with Legal Disclaimer */}
      <Footer />
    </div>
  );
};

export default App;
