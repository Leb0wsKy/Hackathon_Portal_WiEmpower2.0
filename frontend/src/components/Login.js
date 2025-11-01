import React, { useState } from 'react';
import femme from '../Assets/femme.png';
import { useNavigate } from 'react-router-dom';
import { login, setToken } from '../api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    async function handle(e) {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        try {
            const res = await login(username, password);
            if (res.token) {
                setToken(res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                if (res.user.role === 'jury') nav('/jury');
                else nav('/hacker');
            } else {
                setErr(res.error || 'Login failed');
            }
        } catch (err) {
            setErr('Network or server error');
        } finally {
            setLoading(false);
        }
    }

    const containerStyle = {
        background: 'linear-gradient(135deg, #fff5f7 0%, #ffe8f0 100%)',
        borderRadius: '20px',
        padding: '48px',
        boxShadow: '0 12px 48px rgba(255, 105, 180, 0.15)',
        border: '1px solid rgba(255, 182, 193, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '48px',
        maxWidth: '900px',
        margin: '0 auto'
    };

    const formSectionStyle = {
        flex: 1,
        minWidth: 0
    };

    const titleStyle = {
        color: '#c2185b',
        fontSize: '36px',
        fontWeight: '700',
        marginBottom: '12px',
        letterSpacing: '-0.5px'
    };

    const subtitleStyle = {
        color: '#ad1457',
        fontSize: '15px',
        marginBottom: '32px',
        lineHeight: '1.6'
    };

    const errorStyle = {
        background: '#ffebee',
        color: '#c62828',
        padding: '14px 18px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #ef9a9a',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '24px',
        color: '#880e4f',
        fontSize: '14px',
        fontWeight: '600'
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 18px',
        marginTop: '8px',
        border: '2px solid rgba(255, 182, 193, 0.4)',
        borderRadius: '12px',
        fontSize: '15px',
        transition: 'all 0.3s ease',
        background: '#ffffff',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit'
    };

    const buttonStyle = {
        width: '100%',
        padding: '16px 24px',
        background: loading ? '#f8bbd0' : 'linear-gradient(135deg, #ec407a 0%, #d81b60 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '17px',
        fontWeight: '700',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: loading ? 'none' : '0 6px 20px rgba(236, 64, 122, 0.35)',
        marginTop: '12px',
        letterSpacing: '0.5px'
    };

    const imageSectionStyle = {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    const imageContainerStyle = {
        position: 'relative',
        width: '100%',
        maxWidth: '320px'
    };

    const imageStyle = {
        width: '100%',
        height: 'auto',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(255, 105, 180, 0.2)',
        border: '3px solid rgba(236, 64, 122, 0.15)'
    };

    const decorCircleStyle = {
        position: 'absolute',
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, rgba(236, 64, 122, 0.15) 0%, rgba(216, 27, 96, 0.15) 100%)',
        borderRadius: '50%',
        zIndex: -1
    };

    return (
        <div style={containerStyle}>
            <div style={formSectionStyle}>
                <h2 style={titleStyle}>Welcome</h2>
                <p style={subtitleStyle}>Sign in to access your dashboard</p>

                {err && (
                    <div style={errorStyle}>
                        <span>❌</span>
                        {err}
                    </div>
                )}

                <form onSubmit={handle}>
                    <label style={labelStyle}>
                        Username
                        <input
                            style={inputStyle}
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            onFocus={e => e.target.style.borderColor = '#ec407a'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255, 182, 193, 0.4)'}
                        />
                    </label>
                    <label style={labelStyle}>
                        Password
                        <input
                            style={inputStyle}
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            onFocus={e => e.target.style.borderColor = '#ec407a'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255, 182, 193, 0.4)'}
                        />
                    </label>
                    <button
                        type="submit"
                        style={buttonStyle}
                        disabled={loading}
                        onMouseEnter={e => !loading && (e.target.style.transform = 'translateY(-2px)')}
                        onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>

            <div style={imageSectionStyle}>
                <div style={imageContainerStyle}>
                    <div style={{ ...decorCircleStyle, top: '-20px', right: '-20px' }} />
                    <div style={{ ...decorCircleStyle, bottom: '-20px', left: '-20px', width: '60px', height: '60px' }} />
                    <img
                        src={femme}
                        alt="Login Illustration"
                        style={imageStyle}
                    />
                </div>
            </div>
        </div>
    );
}