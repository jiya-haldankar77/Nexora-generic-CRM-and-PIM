import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          background: '#fef2f2',
          color: '#991b1b',
          fontFamily: 'monospace',
          margin: '20px',
          borderRadius: '8px',
          border: '2px solid #fecaca'
        }}>
          <h2 style={{ marginTop: 0 }}>React Error Caught</h2>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            {this.state.error && this.state.error.toString()}
          </p>
          <details style={{ marginBottom: '20px' }}>
            <summary style={{ cursor: 'pointer', padding: '10px', background: '#fee2e2', borderRadius: '4px' }}>
              Stack Trace
            </summary>
            <pre style={{
              marginTop: '10px',
              padding: '10px',
              background: '#ffffff',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
