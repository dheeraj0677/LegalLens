import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

const FaultyComponent: React.FC = () => {
  throw new Error('Simulated contract parsing breakdown');
};

describe('LegalLens ErrorBoundary Component', () => {
  it('catches render errors and displays accessible recovery fallback', () => {
    // Suppress console.error in test output for intentional error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <FaultyComponent />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Document Rendering Interruption/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulated contract parsing breakdown/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload Workspace/i })).toBeInTheDocument();

    spy.mockRestore();
  });

  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="safe-content">All clauses valid</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('safe-content')).toHaveTextContent('All clauses valid');
  });
});
