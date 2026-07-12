import React, { useState } from 'react';
import { api } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await api.login({ email, password });
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrefill = (prefEmail, prefPass) => {
    setEmail(prefEmail);
    setPassword(prefPass);
    setError('');
  };

  return (
    <div className="login-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'var(--bg-primary)',
      zIndex: 9999
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '40px', textAlign: 'center' }}>
        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '42px' }}>🚛</span>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginTop: '12px', color: 'var(--text-primary)' }}>TransitOps</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Smart Transport Operations Platform</p>
        </div>

        {error && <div className="alert-banner alert-banner-danger" style={{ marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Corporate Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="e.g. manager@transitops.com"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>Demo Quick-Login Profiles</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '10px' }} onClick={() => handlePrefill('manager@transitops.com', 'manager123')}>
              💼 Fleet Manager
            </button>
            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '10px' }} onClick={() => handlePrefill('driver@transitops.com', 'driver123')}>
              🚛 Driver
            </button>
            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '10px' }} onClick={() => handlePrefill('safety@transitops.com', 'safety123')}>
              🛡️ Safety Officer
            </button>
            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '10px' }} onClick={() => handlePrefill('finance@transitops.com', 'finance123')}>
              📊 Financial Analyst
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
