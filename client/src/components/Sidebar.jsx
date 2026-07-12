import React from 'react';

export default function Sidebar({ tabs, activeTabId, setCurrentTab, user, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">TO</div>
        <div className="sidebar-brand">
          <h2>TransitOps</h2>
          <p>Smart Fleet Logistics</p>
        </div>
      </div>

      <div className="sidebar-menu">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`nav-item ${activeTabId === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar">
            {user?.email ? user.email.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="user-details">
            <div className="user-email">{user?.email || 'user@transitops.com'}</div>
            <div className="user-role">{user?.role || 'Guest'}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}