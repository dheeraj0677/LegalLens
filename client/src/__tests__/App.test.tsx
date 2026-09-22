import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock global fetch for health check and sample docs
beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.includes('/health')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok', model: 'qwen/qwen3.8-27b:free' }),
      });
    }
    if (url.includes('/sample-docs')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            count: 1,
            presets: [
              {
                id: 'preset-1',
                title: 'Sample NDA',
                category: 'NDA',
                description: 'Test NDA',
                documentA: { title: 'NDA Draft', text: 'Confidentiality terms...' },
                suggestedQuestions: ['What is the term?'],
              },
            ],
          }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }) as any;
});

describe('LegalLens App Shell', () => {
  it('renders the brand title and navigation tabs without warnings', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText(/Legal/i)[0]).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Lens/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Analyze & Risks/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Compare Contracts/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Plain English/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Ask & Verify/i })).toBeInTheDocument();
  });

  it('switches tabs when clicking on navigation items', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Compare Contracts/i })).toBeInTheDocument();
    });

    const compareTabBtn = screen.getByRole('tab', { name: /Compare Contracts/i });
    fireEvent.click(compareTabBtn);
    expect(await screen.findByText(/Bilateral Contract Differ/i)).toBeInTheDocument();

    const simplifyTabBtn = screen.getByRole('tab', { name: /Plain English/i });
    fireEvent.click(simplifyTabBtn);
    expect(await screen.findByText(/Plain English/i, { selector: 'h1' })).toBeInTheDocument();

    const qaTabBtn = screen.getByRole('tab', { name: /Ask & Verify/i });
    fireEvent.click(qaTabBtn);
    expect(await screen.findByText(/Document Interrogation/i)).toBeInTheDocument();
  });

  it('contains accessible legal disclaimer in the footer', async () => {
    render(<App />);

    await waitFor(() => {
      const disclaimer = screen.getByRole('note', { name: /Legal Disclaimer/i });
      expect(disclaimer).toBeInTheDocument();
      expect(disclaimer).toHaveTextContent(/does not provide.*legal advice/i);
    });
  });
});
