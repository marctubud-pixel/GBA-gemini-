import React, { Component, ErrorInfo, ReactNode, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
const App = lazy(() => import('./app/App').then(module => ({ default: module.App })));
const AdminPage = lazy(() => import('./admin/AdminPage'));

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled runtime error in React tree:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0d131a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'monospace'
        }}>
          <div style={{
            maxWidth: '680px',
            width: '100%',
            backgroundColor: '#1e293b',
            border: '2px solid #ef4444',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            <h2 style={{ color: '#f87171', margin: '0 0 12px 0', fontSize: '18px' }}>
              [!] Application Runtime Notice
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
              页面加载遇到运行时异常，详情如下：
            </p>
            <pre style={{
              backgroundColor: '#0f172a',
              padding: '12px',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '12px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.stack || this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '16px',
                padding: '8px 20px',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              重新加载 (Reload)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <ErrorBoundary>
      <Suspense fallback={<div style={{ padding: 40, color: '#d7e6e9' }}>正在打开页面…</div>}>
        {window.location.pathname.replace(/\/$/, '') === '/admin' ? <AdminPage /> : <App />}
      </Suspense>
    </ErrorBoundary>
  );
}
