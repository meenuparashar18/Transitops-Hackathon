import React from 'react';

export default function NotFound({ onGoHome }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <span style={{ fontSize: '72px' }}>🚧</span>
      <h2 style={{ fontSize: '32px', fontWeight: 700, marginTop: '20px' }}>404 - Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>The transit module you are looking for does not exist or has been rerouted.</p>
      <button className="btn btn-primary" onClick={onGoHome}>
        Back to Dashboard
      </button>
    </div>
  );
}
