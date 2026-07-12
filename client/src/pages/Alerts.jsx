import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Alerts() {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [allDrivers, allVehicles, reportData] = await Promise.all([
          api.getDrivers(),
          api.getVehicles(),
          api.getReports()
        ]);
        setDrivers(allDrivers);
        setVehicles(allVehicles);
        setReports(reportData);
      } catch (err) {
        setError('Failed to load safety alerts data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading system alerts...</div>;
  if (error) return <div className="alert-banner alert-banner-danger">{error}</div>;

  // Process Alerts
  const today = new Date();
  
  const licenseAlerts = drivers.map(d => {
    const expiry = new Date(d.licenseExpiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { type: 'danger', category: 'License Expired', title: d.name, message: `Driver's license is EXPIRED (Expiry: ${d.licenseExpiryDate}). Dispatch blocked.` };
    } else if (diffDays <= 60) {
      return { type: 'warning', category: 'License Expiring Soon', title: d.name, message: `License expires in ${diffDays} days on ${d.licenseExpiryDate}.` };
    }
    return null;
  }).filter(Boolean);

  const safetyAlerts = drivers.filter(d => d.safetyScore < 85).map(d => ({
    type: 'warning',
    category: 'Low Safety Score',
    title: d.name,
    message: `Safety score is ${d.safetyScore}/100 (Below target threshold of 85).`
  }));

  const maintenanceAlerts = vehicles.filter(v => v.status === 'In Shop').map(v => ({
    type: 'info',
    category: 'Asset In Shop',
    title: v.registrationNumber,
    message: `${v.name} is currently booked under active maintenance (blocked from dispatch).`
  }));

  const efficiencyAlerts = (reports?.vehicleReports || []).filter(r => r.fuelEfficiency > 0 && r.fuelEfficiency < 8).map(r => ({
    type: 'warning',
    category: 'Low Fuel Efficiency',
    title: r.registrationNumber,
    message: `Average fuel efficiency is low: ${r.fuelEfficiency} km/L (Target is >= 8 km/L).`
  }));

  const allAlerts = [...licenseAlerts, ...safetyAlerts, ...maintenanceAlerts, ...efficiencyAlerts];

  return (
    <div style={{ animation: 'tabFade 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 700 }}>⚠️ Safety & Compliance Alerts</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>Operational alerts for licenses, vehicle maintenance, safety, and fuel efficiencies.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        {allAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span style={{ fontSize: '48px' }}>✅</span>
            <h4 style={{ fontSize: '18px', fontWeight: 600, marginTop: '16px' }}>No Compliance Issues Found</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>All driver licenses are valid, safety scores are optimal, and fleet efficiency meets performance targets.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {allAlerts.map((alert, idx) => (
              <div 
                key={idx} 
                className={`alert-banner alert-banner-${alert.type}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `5px solid var(--${alert.type === 'info' ? 'primary' : alert.type})`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: `rgba(var(--primary-rgb), 0.1)`,
                    color: `var(--text-primary)`
                  }}>
                    {alert.category}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{alert.title}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '4px' }}>{alert.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
