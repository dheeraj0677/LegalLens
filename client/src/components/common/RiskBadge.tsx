import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, Flame } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'md' }) => {
  const getIcon = () => {
    switch (level) {
      case 'LOW':
        return <ShieldCheck size={size === 'sm' ? 12 : 14} />;
      case 'MEDIUM':
        return <AlertTriangle size={size === 'sm' ? 12 : 14} />;
      case 'HIGH':
        return <AlertOctagon size={size === 'sm' ? 12 : 14} />;
      case 'CRITICAL':
        return <Flame size={size === 'sm' ? 12 : 14} />;
      default:
        return null;
    }
  };

  const getStyleClass = () => {
    switch (level) {
      case 'LOW':
        return 'badge-risk-low';
      case 'MEDIUM':
        return 'badge-risk-medium';
      case 'HIGH':
        return 'badge-risk-high';
      case 'CRITICAL':
        return 'badge-risk-critical';
      default:
        return 'badge-risk-low';
    }
  };

  return (
    <span
      className={`badge-risk ${getStyleClass()}`}
      role="status"
      aria-label={`Risk Level: ${level}${score ? `, Risk Score: ${score} out of 10` : ''}`}
      style={{
        fontSize: size === 'sm' ? '0.7rem' : size === 'lg' ? '0.85rem' : '0.75rem',
        padding: size === 'sm' ? '2px 6px' : size === 'lg' ? '6px 12px' : '4px 8px',
      }}
    >
      {getIcon()}
      <span>{level} RISK</span>
      {score !== undefined && (
        <span style={{ opacity: 0.8, fontWeight: 500 }}>({score}/10)</span>
      )}
    </span>
  );
};
