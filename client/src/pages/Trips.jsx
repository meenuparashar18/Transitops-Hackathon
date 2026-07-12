import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Trips({ user }) {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    plannedDistance: '',
    revenue: '',
    status: 'Draft'
  });

  const [completeData, setCompleteData] = useState({
    finalOdometer: '',
    fuelConsumed: '',
    fuelCost: ''
  });

  const canCreate = ['Fleet Manager', 'Driver'].includes(user?.role);

  const fetchTripsAndResources = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      const tripsData = await api.getTrips(filters);
      setTrips(tripsData);

      // Fetch vehicles & drivers to display in dropdowns
      const allVehicles = await api.getVehicles();
      const allDrivers = await api.getDrivers();
      setVehicles(allVehicles);
      setDrivers(allDrivers);
    } catch (err) {
      setError(err.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsAndResources();
  }, [statusFilter]);

  const handleOpenCreateModal = () => {
    setFormData({
      source: '',
      destination: '',
      vehicleId: '',
      driverId: '',
      cargoWeight: '',
      plannedDistance: '',
      revenue: '',
      status: 'Draft'
    });
    setCreateModalOpen(true);
  };

  const handleOpenCompleteModal = (trip) => {
    const vehicle = vehicles.find(v => v.registrationNumber === trip.vehicleId);
    const estOdometer = (vehicle ? vehicle.odometer : 0) + trip.plannedDistance;
    
    setSelectedTrip(trip);
    setCompleteData({
      finalOdometer: estOdometer,
      fuelConsumed: '',
      fuelCost: ''
    });
    setCompleteModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side Capacity Validation
    const selectedVehicle = vehicles.find(v => v.registrationNumber === formData.vehicleId);
    if (selectedVehicle && Number(formData.cargoWeight) > selectedVehicle.maxLoadCapacity) {
      setError(`Cargo weight (${formData.cargoWeight} kg) exceeds vehicle maximum capacity (${selectedVehicle.maxLoadCapacity} kg).`);
      return;
    }

    try {
      setError('');
      await api.createTrip(formData);
      setCreateModalOpen(false);
      fetchTripsAndResources();
    } catch (err) {
      setError(err.message || 'Failed to plan trip');
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.completeTrip(selectedTrip.id, {
        finalOdometer: Number(completeData.finalOdometer),
        fuelConsumed: Number(completeData.fuelConsumed),
        fuelCost: completeData.fuelCost ? Number(completeData.fuelCost) : undefined
      });
      setCompleteModalOpen(false);
      fetchTripsAndResources();
    } catch (err) {
      setError(err.message || 'Failed to complete trip');
    }
  };

  const handleDispatch = async (id) => {
    try {
      setError('');
      await api.dispatchTrip(id);
      fetchTripsAndResources();
    } catch (err) {
      setError(err.message || 'Failed to dispatch trip');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this trip?")) return;
    try {
      setError('');
      await api.cancelTrip(id);
      fetchTripsAndResources();
    } catch (err) {
      setError(err.message || 'Failed to cancel trip');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft': return <span className="badge badge-info">Draft</span>;
      case 'Dispatched': return <span className="badge badge-warning">Dispatched</span>;
      case 'Completed': return <span className="badge badge-success">Completed</span>;
      case 'Cancelled': return <span className="badge badge-danger">Cancelled</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  // Eligibility Filters for Dropdowns
  const today = new Date('2026-07-12').toISOString().split('T')[0];
  
  // Available vehicles must not be Retired, In Shop, or On Trip
  const eligibleVehicles = vehicles.filter(v => v.status === 'Available');
  
  // Available drivers must be Available, non-suspended, and license not expired
  const eligibleDrivers = drivers.filter(d => 
    d.status === 'Available' && 
    d.licenseExpiryDate >= today
  );

  const selectedVehicleObj = vehicles.find(v => v.registrationNumber === formData.vehicleId);
  const isWeightValid = !selectedVehicleObj || Number(formData.cargoWeight) <= selectedVehicleObj.maxLoadCapacity;

  return (
    <div>
      {error && <div className="alert-banner alert-banner-danger">{error}</div>}

      <div className="table-container">
        <div className="table-header-bar">
          <h4 style={{ fontWeight: 600 }}>Active Dispatch & Trip Log</h4>
          <div className="table-filters">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="form-control" 
              style={{ width: '150px' }}
            >
              <option value="">All Lifecycles</option>
              <option value="Draft">Draft</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {canCreate && (
              <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                + Plan New Trip
              </button>
            )}
          </div>
        </div>

        {loading && trips.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading trip history...</div>
        ) : trips.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No trips logged.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Route</th>
                  <th>Vehicle</th>
                  <th>Driver ID</th>
                  <th>Cargo Weight</th>
                  <th>Distance</th>
                  <th>Revenue</th>
                  <th>Status</th>
                  <th>Odometer/Fuel</th>
                  {canCreate && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {trips.map(t => {
                  const driverObj = drivers.find(d => d.licenseNumber === t.driverId);
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.id}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{t.source} ➔ {t.destination}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.date}</div>
                      </td>
                      <td>{t.vehicleId}</td>
                      <td>
                        <div>{driverObj ? driverObj.name : 'Unknown'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.driverId}</div>
                      </td>
                      <td>{t.cargoWeight} kg</td>
                      <td>{t.plannedDistance} km</td>
                      <td style={{ fontWeight: 600 }}>${t.revenue.toLocaleString()}</td>
                      <td>{getStatusBadge(t.status)}</td>
                      <td>
                        {t.status === 'Completed' ? (
                          <div style={{ fontSize: '13px' }}>
                            <div>🏁 {t.finalOdometer.toLocaleString()} km</div>
                            <div style={{ color: 'var(--text-muted)' }}>⛽ {t.fuelConsumed} L consumed</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>Active on road</span>
                        )}
                      </td>
                      {canCreate && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            {t.status === 'Draft' && (
                              <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDispatch(t.id)}>
                                Dispatch
                              </button>
                            )}
                            {t.status === 'Dispatched' && (
                              <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleOpenCompleteModal(t)}>
                                Complete
                              </button>
                            )}
                            {['Draft', 'Dispatched'].includes(t.status) && (
                              <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleCancel(t.id)}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plan Trip Modal */}
      {createModalOpen && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleCreateSubmit}>
            <div className="modal-header">
              <h3>Plan Transport Trip</h3>
              <button type="button" className="modal-close" onClick={() => setCreateModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Origin Source</label>
                  <input 
                    type="text" 
                    value={formData.source} 
                    onChange={(e) => setFormData({...formData, source: e.target.value})} 
                    className="form-control" 
                    required 
                    placeholder="e.g. Chicago, IL"
                  />
                </div>
                <div className="form-group">
                  <label>Destination</label>
                  <input 
                    type="text" 
                    value={formData.destination} 
                    onChange={(e) => setFormData({...formData, destination: e.target.value})} 
                    className="form-control" 
                    required 
                    placeholder="e.g. Detroit, MI"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Assign Vehicle (Available Only)</label>
                  <select 
                    value={formData.vehicleId} 
                    onChange={(e) => setFormData({...formData, vehicleId: e.target.value})} 
                    className="form-control" 
                    required
                  >
                    <option value="">Select vehicle...</option>
                    {eligibleVehicles.map(v => (
                      <option key={v.registrationNumber} value={v.registrationNumber}>
                        {v.registrationNumber} - {v.name} (Max: {v.maxLoadCapacity}kg)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign Driver (Available & Valid)</label>
                  <select 
                    value={formData.driverId} 
                    onChange={(e) => setFormData({...formData, driverId: e.target.value})} 
                    className="form-control" 
                    required
                  >
                    <option value="">Select driver...</option>
                    {eligibleDrivers.map(d => (
                      <option key={d.licenseNumber} value={d.licenseNumber}>
                        {d.name} ({d.licenseCategory} - Score: {d.safetyScore})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cargo Weight (kg)</label>
                  <input 
                    type="number" 
                    value={formData.cargoWeight} 
                    onChange={(e) => setFormData({...formData, cargoWeight: e.target.value})} 
                    className={`form-control ${!isWeightValid ? 'is-invalid' : ''}`}
                    required 
                    min="1" 
                    placeholder="e.g. 450"
                  />
                  {selectedVehicleObj && (
                    <div style={{ fontSize: '11px', marginTop: '4px', color: isWeightValid ? 'var(--text-muted)' : 'var(--danger)' }}>
                      Vehicle Maximum Capacity: <strong>{selectedVehicleObj.maxLoadCapacity} kg</strong>.
                      {!isWeightValid && ' ❌ Weight exceeds load capacity!'}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Planned Distance (km)</label>
                  <input 
                    type="number" 
                    value={formData.plannedDistance} 
                    onChange={(e) => setFormData({...formData, plannedDistance: e.target.value})} 
                    className="form-control" 
                    required 
                    min="1" 
                    placeholder="e.g. 450"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Planned Revenue ($)</label>
                  <input 
                    type="number" 
                    value={formData.revenue} 
                    onChange={(e) => setFormData({...formData, revenue: e.target.value})} 
                    className="form-control" 
                    required 
                    min="0" 
                    placeholder="e.g. 1200"
                  />
                </div>
                <div className="form-group">
                  <label>Dispatch State</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})} 
                    className="form-control"
                  >
                    <option value="Draft">Draft (Save only)</option>
                    <option value="Dispatched">Dispatched (Lock & Start Trip)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={!isWeightValid || !formData.vehicleId || !formData.driverId}>
                Schedule Trip
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Complete Trip Modal */}
      {completeModalOpen && selectedTrip && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleCompleteSubmit}>
            <div className="modal-header">
              <h3>Log Trip Completion: {selectedTrip.id}</h3>
              <button type="button" className="modal-close" onClick={() => setCompleteModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Final Odometer Reading (km)</label>
                <input 
                  type="number" 
                  value={completeData.finalOdometer} 
                  onChange={(e) => setCompleteData({...completeData, finalOdometer: e.target.value})} 
                  className="form-control" 
                  required
                />
              </div>
              <div className="form-group">
                <label>Actual Fuel Consumed (Liters)</label>
                <input 
                  type="number" 
                  value={completeData.fuelConsumed} 
                  onChange={(e) => setCompleteData({...completeData, fuelConsumed: e.target.value})} 
                  className="form-control" 
                  required 
                  min="1" 
                  placeholder="e.g. 45"
                />
              </div>
              <div className="form-group">
                <label>Fuel Cost ($, Optional - falls back to standard index rate)</label>
                <input 
                  type="number" 
                  value={completeData.fuelCost} 
                  onChange={(e) => setCompleteData({...completeData, fuelCost: e.target.value})} 
                  className="form-control" 
                  placeholder="e.g. 70"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setCompleteModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Complete and Log Fuel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
