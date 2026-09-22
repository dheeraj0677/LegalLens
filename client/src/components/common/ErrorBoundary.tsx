import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[LegalLens ErrorBoundary Caught]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem',
            margin: '2rem auto',
            maxWidth: '680px',
            background: 'linear-gradient(145deg, #ffffff, #f5f5f7)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              color: '#dc2626',
            }}
          >
            <AlertTriangle size={32} />
          </div>

          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '0.75rem',
            }}
          >
            Document Rendering Interruption
          </h2>

          <p
            style={{
              color: '#4b5563',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              maxWidth: '520px',
              marginBottom: '1.75rem',
            }}
          >
            An unexpected error occurred while rendering the document interface. Your original contract text is safe. Please refresh to restore the session.
          </p>

          {this.state.error && (
            <div
              style={{
                background: '#f9fafb',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                color: '#6b7280',
                marginBottom: '1.75rem',
                maxWidth: '100%',
                overflowX: 'auto',
              }}
            >
              {this.state.error.message}
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="btn-3d"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.75rem',
              background: '#111827',
              color: '#ffffff',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            }}
          >
            <RefreshCw size={16} />
            Reload Workspace
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
