import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskBadge } from '../components/common/RiskBadge';

describe('RiskBadge Component', () => {
  it('renders LOW risk badge with correct text and role', () => {
    render(<RiskBadge level="LOW" score={2} />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent(/LOW RISK/i);
    expect(badge).toHaveTextContent(/\(2\/10\)/);
  });

  it('renders CRITICAL risk badge with correct attributes', () => {
    render(<RiskBadge level="CRITICAL" score={9} />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent(/CRITICAL RISK/i);
    expect(badge).toHaveTextContent(/\(9\/10\)/);
  });

  it('renders HIGH risk badge without crashing when score is omitted', () => {
    render(<RiskBadge level="HIGH" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent(/HIGH RISK/i);
  });
});
