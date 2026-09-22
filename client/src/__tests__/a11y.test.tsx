import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../components/layout/Header';
import { AriaLiveRegion } from '../components/common/AriaLiveRegion';
import { RiskBadge } from '../components/common/RiskBadge';

describe('LegalLens WCAG 2.2 AA Accessibility Suite', () => {
  it('renders skip-to-main-content link pointing to #main-content', () => {
    render(
      <Header
        activeTab="analyze"
        setActiveTab={vi.fn()}
        theme="light"
        toggleTheme={vi.fn()}
        modelName="qwen/qwen3.8-27b:free"
      />
    );

    const skipLink = screen.getByRole('link', { name: /Skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('supports roving tabindex keyboard navigation across tabs via Arrow keys', () => {
    const setActiveTabMock = vi.fn();
    render(
      <Header
        activeTab="analyze"
        setActiveTab={setActiveTabMock}
        theme="light"
        toggleTheme={vi.fn()}
        modelName="qwen/qwen3.8-27b:free"
      />
    );

    const tabList = screen.getByRole('tablist', { name: /Main Navigation/i });
    expect(tabList).toBeInTheDocument();

    // ArrowRight switches to 'compare'
    fireEvent.keyDown(tabList, { key: 'ArrowRight' });
    expect(setActiveTabMock).toHaveBeenCalledWith('compare');

    // ArrowLeft switches to previous tab 'qa' (wrap-around)
    fireEvent.keyDown(tabList, { key: 'ArrowLeft' });
    expect(setActiveTabMock).toHaveBeenCalledWith('qa');

    // End switches to last tab 'qa'
    fireEvent.keyDown(tabList, { key: 'End' });
    expect(setActiveTabMock).toHaveBeenCalledWith('qa');

    // Home switches to first tab 'analyze'
    fireEvent.keyDown(tabList, { key: 'Home' });
    expect(setActiveTabMock).toHaveBeenCalledWith('analyze');
  });

  it('renders AriaLiveRegion with aria-live="polite" and aria-atomic="true"', () => {
    render(<AriaLiveRegion message="Analysis complete. Risk score 78/100." politeness="polite" />);
    const region = screen.getByText(/Analysis complete/i);
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
  });

  it('provides colorblind-safe dual indicators (icons + text + aria-label) on RiskBadge', () => {
    render(<RiskBadge level="CRITICAL" score={92} />);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-label', expect.stringContaining('CRITICAL'));
    expect(badge).toHaveTextContent(/CRITICAL/i);
  });
});
