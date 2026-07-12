import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Demo Workflow States
  const [demoLogs, setDemoLogs] = useState(null);
  const [runningDemo, setRunningDemo] = useState(false);

  // Filters
  const [region, setRegion] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [status, setStatus] = useState('');

  // Fetch report data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const filters = {};
      if (region) filters.region = region;
      if (vehicleType) filters.vehicleType = vehicleType;
      if (status) filters.status = status;
      
      const res = await api.getReports(filters);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard reports');
    } finally {
      setLoading(false);
    }
  };

  const handleRunDemo = async () => {
    try {
      setRunningDemo(true);
      setError('');
      const res = await api.runDemoWorkflow();
      setDemoLogs(res.log);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to execute demo workflow');
    } finally {
      setRunningDemo(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [region, vehicleType, status]);

  if (loading && !data) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Dashboard KPIs...</div>;
  }

  const kpis = data?.kpis || {
    totalVehicles: 0,
    activeVehicles: 0,
    availableVehicles: 0,
    vehiclesInMaintenance: 0,
    retiredVehicles: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    fleetUtilization: 0
  };

  const financials = data?.financials || {
    totalRevenue: 0,
    totalFuelCost: 0,
    totalMaintenanceCost: 0,
    totalOperationalCost: 0,
    netProfit: 0
  };

  const reports = data?.vehicleReports || [];

  // Generate SVG Bar Chart calculations for ROI
  const maxRevenue = Math.max(...reports.map(r => r.totalRevenue), 1000);
  const chartHeight = 160;
  const chartWidth = 500;
  const barPadding = 12;
  const barWidth = reports.length > 0 ? (chartWidth / reports.length) - barPadding : 0;

  return (
    <div>
      {error && <div className="alert-banner alert-banner-danger">{error}</div>}

      {/* Interactive Filters Bar */}
      <div className="table-header-bar" style={{ marginBottom: '24px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <h4 style={{ fontWeight: 600 }}>Filter Operations Dashboard</h4>
        <div className="table-filters" style={{ flexGrow: 1, justifyContent: 'flex-end' }}>
          {user?.role === 'Fleet Manager' && (
            <button 
              className="btn" 
              onClick={handleRunDemo} 
              disabled={runningDemo}
              style={{ padding: '8px 16px', fontSize: '13px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#07090e', boxShadow: 'none', marginRight: '8px' }}
            >
              {runningDemo ? '⚡ Running Demo...' : '⚡ Run Demo Workflow (Steps 1-9)'}
            </button>
          )}

          <button 
            className="btn btn-secondary" 
            onClick={() => window.print()}
            style={{ padding: '8px 16px', fontSize: '13px', marginRight: '8px' }}
          >
            🖨️ Export PDF
          </button>

          <select value={region} onChange={(e) => setRegion(e.target.value)} className="form-control" style={{ maxWidth: '160px', padding: '8px 12px' }}>
            <option value="">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
          
          <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="form-control" style={{ maxWidth: '160px', padding: '8px 12px' }}>
            <option value="">All Types</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Semi">Semi</option>
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-control" style={{ maxWidth: '160px', padding: '8px 12px' }}>
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>

          {(region || vehicleType || status) && (
            <button className="btn btn-secondary" onClick={() => { setRegion(''); setVehicleType(''); setStatus(''); }} style={{ padding: '8px 16px', fontSize: '13px' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ '--accent': 'var(--primary)' }}>
          <div className="kpi-title">Fleet Utilization</div>
          <div className="kpi-value">{kpis.fleetUtilization}%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Active fleet utilization rate</div>
        </div>
        <div className="kpi-card" style={{ '--accent': 'var(--success)' }}>
          <div className="kpi-title">Available Vehicles</div>
          <div className="kpi-value">{kpis.availableVehicles}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Ready for assignment</div>
        </div>
        <div className="kpi-card" style={{ '--accent': 'var(--warning)' }}>
          <div className="kpi-title">Active Trips</div>
          <div className="kpi-value">{kpis.activeTrips}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Currently on the road</div>
        </div>
        <div className="kpi-card" style={{ '--accent': 'var(--danger)' }}>
          <div className="kpi-title">In Shop</div>
          <div className="kpi-value">{kpis.vehiclesInMaintenance}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Inactive maintenance logs</div>
        </div>
        <div className="kpi-card" style={{ '--accent': 'var(--info)' }}>
          <div className="kpi-title">Drivers On Duty</div>
          <div className="kpi-value">{kpis.driversOnDuty}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Available & On Trip</div>
        </div>
      </div>

      {/* Financial Overview & Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* SVG Performance Chart */}
        <div className="card">
          <h3 className="section-title">Fleet Revenue Breakdown ($)</h3>
          <div className="chart-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '260px' }}>
            {reports.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '60px' }}>No revenue data in filtered selection.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '80%' }}>
                  {reports.map((r, i) => {
                    const barHeight = (r.totalRevenue / maxRevenue) * (chartHeight - 30);
                    const x = i * (barWidth + barPadding) + barPadding;
                    const y = chartHeight - barHeight - 20;
                    return (
                      <g key={r.registrationNumber}>
                        {/* Shadow grid line */}
                        <line x1="0" y1={chartHeight - 20} x2={chartWidth} y2={chartHeight - 20} stroke="var(--border-color)" strokeWidth="1" />
                        {/* Revenue Bar */}
                        <rect 
                          x={x} 
                          y={y} 
                          width={barWidth} 
                          height={barHeight} 
                          fill="var(--primary)" 
                          rx="4" 
                          opacity="0.85"
                          style={{ transition: 'all 0.5s ease' }}
                        />
                        {/* Cost Bar overlay (cumulative Fuel + Maintenance) */}
                        {r.totalOperationalCost > 0 && (
                          <rect 
                            x={x} 
                            y={chartHeight - ((r.totalOperationalCost / maxRevenue) * (chartHeight - 30)) - 20} 
                            width={barWidth} 
                            height={(r.totalOperationalCost / maxRevenue) * (chartHeight - 30)} 
                            fill="var(--danger)" 
                            rx="2"
                            opacity="0.7"
                          />
                        )}
                        {/* Labels */}
                        <text x={x + barWidth/2} y={chartHeight - 4} fontSize="9" fill="var(--text-secondary)" textAnchor="middle">
                          {r.registrationNumber}
                        </text>
                        <text x={x + barWidth/2} y={y - 4} fontSize="9" fill="var(--text-primary)" textAnchor="middle" fontWeight="600">
                          ${r.totalRevenue}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '11px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '2px' }}></span>
                    <span>Total Revenue</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '2px' }}></span>
                    <span>Operational Cost (Fuel + Mnt)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial KPI Summary Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="section-title">Fleet Financial Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Revenue</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${financials.totalRevenue.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Fuel Expenses</span>
                <span style={{ fontWeight: 600, color: 'var(--danger)' }}>-${financials.totalFuelCost.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Maintenance Cost</span>
                <span style={{ fontWeight: 600, color: 'var(--danger)' }}>-${financials.totalMaintenanceCost.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Expenses</span>
                <span style={{ fontWeight: 600, color: 'var(--danger)' }}>-${financials.totalOperationalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Net Profit</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: financials.netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                ${financials.netProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Workflow Success Modal */}
      {demoLogs && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header" style={{ background: 'var(--success-glow)', borderBottom: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h3 style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 800 }}>
                🎉 Demo Workflow Executed Successfully!
              </h3>
              <button type="button" className="modal-close" onClick={() => setDemoLogs(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                The system successfully executed the standard 9-step logistics lifecycle for vehicle <strong>VAN-05</strong> and driver <strong>Alex</strong>:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {demoLogs.map((logItem, index) => (
                  <div key={index} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid var(--success)', fontSize: '13px', lineHeight: '1.5' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span>
                    <span style={{ color: 'var(--text-primary)' }}>{logItem}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-success" onClick={() => setDemoLogs(null)}>
                Got it, View Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
