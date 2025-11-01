import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, info: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('Error caught by boundary:', error, info);
        this.setState({ error, info });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(180deg, #fce4ec 0%, #f8bbd0 100%)',
                    padding: '20px',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <h1 style={{ color: '#c2185b', marginBottom: '20px' }}>⚠️ Application Error</h1>
                    <div style={{
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '20px',
                        borderRadius: '10px',
                        border: '1px solid #ef9a9a',
                        maxWidth: '600px',
                        wordBreak: 'break-word'
                    }}>
                        <p><strong>Error:</strong> {this.state.error?.toString()}</p>
                        <details style={{ marginTop: '10px', cursor: 'pointer' }}>
                            <summary>Stack trace</summary>
                            <pre style={{
                                background: '#f5f5f5',
                                padding: '10px',
                                borderRadius: '5px',
                                overflow: 'auto',
                                fontSize: '12px'
                            }}>
                                {this.state.info?.componentStack}
                            </pre>
                        </details>
                    </div>
                    <p style={{ marginTop: '20px', color: '#666' }}>
                        Please check the browser console (F12) for more details.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
