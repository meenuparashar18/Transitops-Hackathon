import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function MainLayout({ 
  tabs, 
  activeTabId, 
  setCurrentTab, 
  user, 
  onLogout, 
  currentTabLabel, 
  lightMode, 
  onToggleLightMode, 
  children 
}) {
  return (
    <div className="app-shell">
      <Sidebar 
        tabs={tabs} 
        activeTabId={activeTabId} 
        setCurrentTab={setCurrentTab} 
        user={user} 
        onLogout={onLogout} 
      />
      <div className="main-content">
        <Navbar 
          currentTabLabel={currentTabLabel} 
          user={user} 
          lightMode={lightMode} 
          onToggleLightMode={onToggleLightMode} 
        />
        <div className="content-pane">
          {children}
        </div>
      </div>
    </div>
  );
}