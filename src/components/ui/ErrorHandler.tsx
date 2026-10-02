import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorHandler extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in LMS component:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '40px 24px',
            maxWidth: '560px',
            margin: '40px auto',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={32} />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0B2545', margin: 0 }}>
            Đã xảy ra sự cố không mong muốn
          </h2>

          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
            Hệ thống LMS Tin Học Gen Z đã tự động cô lập lỗi an toàn để bảo vệ phiên học tập của bạn.
            Vui lòng thử tải lại trang hoặc quay về trang chủ.
          </p>

          {this.state.error && (
            <div
              style={{
                width: '100%',
                padding: '12px',
                background: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
                color: '#475569',
                fontFamily: 'monospace',
                textAlign: 'left',
                overflowX: 'auto',
                maxHeight: '120px'
              }}
            >
              {this.state.error.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Button
              variant="primary"
              onClick={this.handleReload}
              leftIcon={<RefreshCw size={16} />}
            >
              Thử lại
            </Button>
            <Button
              variant="outline"
              onClick={this.handleGoHome}
              leftIcon={<Home size={16} />}
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
