import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class LazyErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    if (typeof console !== 'undefined') {
      console.warn('[LazyErrorBoundary]', error);
    }
  }

  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('ftra:chunk-reload-attempted');
      } catch {
        // ignore — private mode etc.
      }
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="auth-loading" style={{ flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', maxWidth: 320 }}>
          Couldn’t load this page. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          style={{
            padding: '10px 24px',
            background: 'var(--primary)',
            color: '#000',
            border: 'none',
            borderRadius: 4,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      </div>
    );
  }
}
