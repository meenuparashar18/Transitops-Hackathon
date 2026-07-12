import React from 'react';

export default function Navbar({ currentTabLabel, user, lightMode, onToggleLightMode }) {
  return (
    <div className="top-bar">
      <div className="page-title">
        <h2>{currentTabLabel || 'Dashboard'}</h2>
      </div>
      <div className="top-bar-actions">
        <button 
          onClick={onToggleLightMode}
          className="btn btn-secondary" 
          style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginRight: '12px' }}
        >
          {lightMode ? '🌙 Dark' : '☀️ Light'}
        </button>
        <span className="badge badge-info" style={{ padding: '6px 12px', fontSize: '12px' }}>
          👤 Role: {user?.role || 'Guest'}
        </span>
      </div>
    </div>
  );
}
