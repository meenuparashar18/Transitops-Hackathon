import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Maintenance({ user }) {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'Oil Change',
    cost: '',
    startDate: ''
  });

  const [closeData, setCloseData] = useState({
    cost: '',
    endDate: ''
  });

  const isManager = user?.role === 'Fleet Manager';

  const fetchLogsAndVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      
      const logsData = await api.getMaintenanceLogs();
      setLogs(logsData);

      const vehiclesData = await api.getVehicles();
      setVehicles(vehiclesData);
    } catch (err) {
      setError(err.message || 'Failed to fetch maintenance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsAndVehicles();
  }, []);

  const handleOpenCreateModal = () => {
    setFormData({
      vehicleId: '',
      type: 'Oil Change',
      cost: '',
      startDate: new Date().toISOString().split('T')[0]
    });
    setCreateModalOpen(true);
  };

  const handleOpenCloseModal = (log) => {
    setSelectedLog(log);
    setCloseData({
      cost: log.cost,
      endDate: new Date().toISOString().split('T')[0]
    });
    setCloseModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.createMaintenanceLog(formData);
      setCreateModalOpen(false);
      fetchLogsAndVehicles();
    } catch (err) {
      setError(err.message || 'Failed to open maintenance ticket');
    }
  };

  const handleCloseSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.closeMaintenanceLog(selectedLog.id, {
        cost: Number(closeData.cost),
        endDate: closeData.endDate
      });
      setCloseModalOpen(false);
      fetchLogsAndVehicles();
    } catch (err) {
      setError(err.message || 'Failed to resolve maintenance ticket');
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this maintenance record?")) return;
    try {
      setError('');
      await api.deleteMaintenanceLog(id);
      fetchLogsAndVehicles();
    } catch (err) {
      setError(err.message || 'Failed to delete maintenance log');
    }
  };

  // Only display vehicles that are not already Retired or On Trip for new maintenance
  const eligibleVehicles = vehicles.filter(v => v.status === 'Available' || v.status === 'In Shop');

  return (
    <div>
      {error && <div className="alert-banner alert-banner-danger">{error}</div>}

      <div className="table-container">
        <div className="table-header-bar">
          <h4 style={{ fontWeight: 600 }}>Active Shop Tickets & Maintenance Logs</h4>
          <div className="table-filters">
            {isManager && (
              <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                + Log Maintenance
              </button>
            )}
          </div>
        </div>

        {loading && logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading shop logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No maintenance records logged.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Vehicle ID</th>
                  <th>Maintenance Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Cost ($)</th>
                  <th>Status</th>
                  {isManager && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>{log.id}</td>
                    <td style={{ fontWeight: 600 }}>{log.vehicleId}</td>
                    <td>{log.type}</td>
                    <td>{log.startDate}</td>
                    <td>{log.endDate || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Ongoing</span>}</td>
                    <td style={{ fontWeight: 600 }}>${log.cost.toLocaleString()}</td>
                    <td>
                      {log.status === 'Active' ? (
                        <span className="badge badge-danger">In Shop</span>
                      ) : (
                        <span className="badge badge-success">Completed</span>
                      )}
                    </td>
                    {isManager && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          {log.status === 'Active' && (
                            <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleOpenCloseModal(log)}>
                              Complete / Close
                            </button>
                          )}
                          <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDeleteLog(log.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Maintenance Modal */}
      {createModalOpen && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleCreateSubmit}>
            <div className="modal-header">
              <h3>Create Maintenance Log</h3>
              <button type="button" className="modal-close" onClick={() => setCreateModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Vehicle</label>
                <select 
                  value={formData.vehicleId} 
                  onChange={(e) => setFormData({...formData, vehicleId: e.target.value})} 
                  className="form-control" 
                  required
                >
                  <option value="">Choose vehicle...</option>
                  {eligibleVehicles.map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber}>
                      {v.registrationNumber} - {v.name} (Status: {v.status})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Setting a vehicle to an active maintenance ticket will switch its registry status to <strong>In Shop</strong>.
                </div>
              </div>

              <div className="form-group">
                <label>Maintenance Action / Type</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})} 
                  className="form-control"
                >
                  <option value="Oil Change">Oil Change</option>
                  <option value="Brake Replacement">Brake Replacement</option>
                  <option value="Engine Tuning">Engine Tuning</option>
                  <option value="Tire Rotation/Replacement">Tire Rotation/Replacement</option>
                  <option value="Transmission Repair">Transmission Repair</option>
                  <option value="General Inspection">General Inspection</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Estimated Cost ($)</label>
                  <input 
                    type="number" 
                    value={formData.cost} 
                    onChange={(e) => setFormData({...formData, cost: e.target.value})} 
                    className="form-control" 
                    required 
                    min="0" 
                    placeholder="e.g. 150"
                  />
                </div>
                <div className="form-group">
                  <label>Service Start Date</label>
                  <input 
                    type="date" 
                    value={formData.startDate} 
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                    className="form-control" 
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Check In Vehicle</button>
            </div>
          </form>
        </div>
      )}

      {/* Close Maintenance Modal */}
      {closeModalOpen && selectedLog && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleCloseSubmit}>
            <div className="modal-header">
              <h3>Resolve Maintenance Ticket: {selectedLog.id}</h3>
              <button type="button" className="modal-close" onClick={() => setCloseModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Final Maintenance Cost ($)</label>
                <input 
                  type="number" 
                  value={closeData.cost} 
                  onChange={(e) => setCloseData({...closeData, cost: e.target.value})} 
                  className="form-control" 
                  required 
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Service Completion Date</label>
                <input 
                  type="date" 
                  value={closeData.endDate} 
                  onChange={(e) => setCloseData({...closeData, endDate: e.target.value})} 
                  className="form-control" 
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setCloseModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Complete & Restore Vehicle</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
