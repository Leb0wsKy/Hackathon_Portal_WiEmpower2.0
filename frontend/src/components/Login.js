import React, { useState } from 'react';
import femme from '../Assets/femme.png';
import { useNavigate } from 'react-router-dom';
import { login, setToken } from '../api';


export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState(null);
    const nav = useNavigate();

    async function handle(e) {
        e.preventDefault();
        setErr(null);
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
        }
    }

        return (
            <div className="card" style={{display:'flex',alignItems:'center',gap:32}}>
                <div style={{flex:1}}>
                    <h2>Login</h2>
                    {err && <div className="error">{err}</div>}
                    <form onSubmit={handle}>
                        <label>
                            Username
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </label>
                        <label>
                            Password
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </label>
                        <button type="submit">Login</button>
                    </form>
                </div>
                <div style={{flex:1,display:'flex',justifyContent:'center'}}>
                    <img src={femme} alt="Login Illustration" style={{maxWidth:'90%',maxHeight:220,borderRadius:12,boxShadow:'0 2px 12px #0001'}} />
                </div>
            </div>
        );
    }