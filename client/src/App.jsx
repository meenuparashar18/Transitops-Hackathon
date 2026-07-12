import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import MainLayout from './layouts/MainLayout';
import Loader from './components/Loader';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Shipments from './pages/Shipments';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Alerts from './pages/Alerts';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('transitops_token'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('transitops_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [lightMode, setLightMode] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  const toggleLightMode = () => {
    setLightMode(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('light-mode');
      } else {
        document.body.classList.remove('light-mode');
      }
      return next;
    });
  };

  // Sync session check on mount
  useEffect(() => {
    if (token) {
      api.getCurrentUser()
        .then(res => {
          setUser(res.user);
          localStorage.setItem('transitops_user', JSON.stringify(res.user));
        })
        .catch(() => {
          handleLogout();
        })
        .finally(() => {
          setAppLoading(false);
        });
    } else {
      setAppLoading(false);
    }
  }, [token]);

  const handleLoginSuccess = (newToken, loggedUser) => {
    localStorage.setItem('transitops_token', newToken);
    localStorage.setItem('transitops_user', JSON.stringify(loggedUser));
    setToken(newToken);
    setUser(loggedUser);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    setToken(null);
    setUser(null);
  };

  const getTabsByRole = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'Fleet Manager':
        return [
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'vehicles', label: '🚚 Vehicle Registry' },
          { id: 'drivers', label: '🪪 Drivers Roster' },
          { id: 'trips', label: '🗺️ Shipment Planner' },
          { id: 'maintenance', label: '🛠️ Shop Maintenance' },
          { id: 'expenses', label: '💸 Expense Ledger' },
          { id: 'alerts', label: '⚠️ Safety Alerts' }
        ];
      case 'Driver':
        return [
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'vehicles', label: '🚚 Vehicle Registry' },
          { id: 'drivers', label: '🪪 Drivers Roster' },
          { id: 'trips', label: '🗺️ Shipments Log' },
          { id: 'expenses', label: '⛽ Log Fuel Refills' }
        ];
      case 'Safety Officer':
        return [
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'drivers', label: '🪪 Driver Compliance' },
          { id: 'alerts', label: '⚠️ Safety Alerts' }
        ];
      case 'Financial Analyst':
        return [
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'vehicles', label: '🚚 Fleet ROI' },
          { id: 'expenses', label: '💸 Expense Ledger' }
        ];
      default:
        return [{ id: 'dashboard', label: 'Dashboard' }];
    }
  };

  if (appLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
        <Loader />
      </div>
    );
  }

  // Auth View
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const tabs = getTabsByRole();
  const isTabAvailable = tabs.some(t => t.id === currentTab);
  const activeTabId = isTabAvailable ? currentTab : 'dashboard';
  const currentTabLabel = tabs.find(t => t.id === activeTabId)?.label.split(' ').slice(1).join(' ') || 'Dashboard';

  return (
    <MainLayout
      tabs={tabs}
      activeTabId={activeTabId}
      setCurrentTab={setCurrentTab}
      user={user}
      onLogout={handleLogout}
      currentTabLabel={currentTabLabel}
      lightMode={lightMode}
      onToggleLightMode={toggleLightMode}
    >
      {activeTabId === 'dashboard' && <Dashboard user={user} />}
      {activeTabId === 'vehicles' && <Vehicles user={user} />}
      {activeTabId === 'drivers' && <Drivers user={user} />}
      {activeTabId === 'trips' && <Shipments user={user} />}
      {activeTabId === 'maintenance' && <Maintenance user={user} />}
      {activeTabId === 'expenses' && <Expenses user={user} />}
      {activeTabId === 'alerts' && <Alerts />}
    </MainLayout>
  );
}
