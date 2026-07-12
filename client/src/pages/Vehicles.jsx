import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Vehicles({ user }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reports, setReports] = useState({});

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    name: '',
    type: 'Van',
    maxLoadCapacity: '',
    odometer: '',
    acquisitionCost: '',
    status: 'Available',
    region: 'North'
  });

  const isManager = user?.role === 'Fleet Manager';

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const filters = {};
      if (search) filters.search = search;
      if (typeFilter) filters.type = typeFilter;
      if (statusFilter) filters.status = statusFilter;

      const data = await api.getVehicles(filters);
      setVehicles(data);

      // Fetch analytics reports to get ROI/Operational costs per vehicle
      const reportRes = await api.getReports();
      const reportMap = {};
      reportRes.vehicleReports.forEach(r => {
        reportMap[r.registrationNumber] = r;
      });
      setReports(reportMap);
    } catch (err) {
      setError(err.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, typeFilter, statusFilter]);

  const handleOpenCreateModal = () => {
    setSelectedVehicle(null);
    setFormData({
      registrationNumber: '',
      name: '',
      type: 'Van',
      maxLoadCapacity: '',
      odometer: '',
      acquisitionCost: '',
      status: 'Available',
      region: 'North'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      maxLoadCapacity: vehicle.maxLoadCapacity,
      odometer: vehicle.odometer,
      acquisitionCost: vehicle.acquisitionCost,
      status: vehicle.status,
      region: vehicle.region || 'North'
    });
    setModalOpen(true);
  };

  const handleOpenDetailsModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (selectedVehicle) {
        // Edit Mode
        await api.updateVehicle(selectedVehicle.registrationNumber, formData);
      } else {
        // Create Mode
        await api.createVehicle(formData);
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setError(err.message || 'Failed to save vehicle details');
    }
  };

  const handleDelete = async (registrationNumber) => {
    if (!window.confirm(`Are you sure you want to delete vehicle ${registrationNumber}?`)) return;
    try {
      setError('');
      await api.deleteVehicle(registrationNumber);
      fetchVehicles();
    } catch (err) {
      setError(err.message || 'Failed to delete vehicle');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available': return <span className="badge badge-success">Available</span>;
      case 'On Trip': return <span className="badge badge-warning">On Trip</span>;
      case 'In Shop': return <span className="badge badge-danger">In Shop</span>;
      case 'Retired': return <span className="badge badge-muted">Retired</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      {error && <div className="alert-banner alert-banner-danger">{error}</div>}

      <div className="table-container">
        {/* Header toolbar */}
        <div className="table-header-bar">
          <div className="table-search-box">
            <input 
              type="text" 
              placeholder="Search vehicles by ID or Model..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="form-control"
            />
          </div>
          <div className="table-filters">
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)} 
              className="form-control" 
              style={{ width: '130px' }}
            >
              <option value="">All Types</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Semi">Semi</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="form-control" 
              style={{ width: '130px' }}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
            {isManager && (
              <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                + Add Vehicle
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        {loading && vehicles.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading vehicle registry...</div>
        ) : vehicles.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No vehicles found matching filters.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Reg. Number</th>
                  <th>Model / Name</th>
                  <th>Type</th>
                  <th>Max Capacity</th>
                  <th>Odometer</th>
                  <th>Status</th>
                  <th>Region</th>
                  <th>ROI (Calc)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => {
                  const report = reports[v.registrationNumber];
                  const roiPercent = report ? `${(report.roi * 100).toFixed(1)}%` : '0%';
                  return (
                    <tr key={v.registrationNumber}>
                      <td style={{ fontWeight: 600 }}>{v.registrationNumber}</td>
                      <td>{v.name}</td>
                      <td>{v.type}</td>
                      <td>{v.maxLoadCapacity} kg</td>
                      <td>{v.odometer.toLocaleString()} km</td>
                      <td>{getStatusBadge(v.status)}</td>
                      <td>{v.region || 'North'}</td>
                      <td style={{ fontWeight: 600, color: report?.roi >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {roiPercent}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleOpenDetailsModal(v)}>
                            Details
                          </button>
                          {isManager && (
                            <>
                              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleOpenEditModal(v)}>
                                Edit
                              </button>
                              <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDelete(v.registrationNumber)}>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h3>{selectedVehicle ? 'Edit Vehicle Details' : 'Register New Vehicle'}</h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Registration Number (Unique)</label>
                <input 
                  type="text" 
                  name="registrationNumber" 
                  value={formData.registrationNumber} 
                  onChange={handleInputChange} 
                  className="form-control" 
                  required
                  placeholder="e.g. VAN-05"
                  disabled={!!selectedVehicle}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div className="form-group">
                <label>Vehicle Name / Model</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="form-control" 
                  required
                  placeholder="e.g. Chevrolet Express 3500"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="form-control">
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Semi">Semi</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Max Load Capacity (kg)</label>
                  <input 
                    type="number" 
                    name="maxLoadCapacity" 
                    value={formData.maxLoadCapacity} 
                    onChange={handleInputChange} 
                    className="form-control" 
                    required
                    min="1"
                    placeholder="e.g. 800"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Initial Odometer (km)</label>
                  <input 
                    type="number" 
                    name="odometer" 
                    value={formData.odometer} 
                    onChange={handleInputChange} 
                    className="form-control" 
                    required
                    min="0"
                    placeholder="e.g. 12000"
                  />
                </div>
                <div className="form-group">
                  <label>Acquisition Cost ($)</label>
                  <input 
                    type="number" 
                    name="acquisitionCost" 
                    value={formData.acquisitionCost} 
                    onChange={handleInputChange} 
                    className="form-control" 
                    required
                    min="0"
                    placeholder="e.g. 35000"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Initial Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="form-control">
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Operational Region</label>
                  <select name="region" value={formData.region} onChange={handleInputChange} className="form-control">
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Vehicle</button>
            </div>
          </form>
        </div>
      )}

      {/* Details Modal */}
      {detailsModalOpen && selectedVehicle && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Vehicle Profile: {selectedVehicle.registrationNumber}</h3>
              <button type="button" className="modal-close" onClick={() => setDetailsModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '8px' }}>
                <div><strong>Model:</strong> {selectedVehicle.name}</div>
                <div><strong>Type:</strong> {selectedVehicle.type}</div>
                <div><strong>Odometer:</strong> {selectedVehicle.odometer.toLocaleString()} km</div>
                <div><strong>Status:</strong> {getStatusBadge(selectedVehicle.status)}</div>
                <div><strong>Acquisition Cost:</strong> ${selectedVehicle.acquisitionCost.toLocaleString()}</div>
                <div><strong>Region:</strong> {selectedVehicle.region || 'North'}</div>
              </div>
              
              <h4 style={{ fontSize: '15px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginTop: '12px' }}>Operational Statistics</h4>
              {reports[selectedVehicle.registrationNumber] ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Operations Expense (Fuel + Maintenance)</span>
                    <span style={{ fontWeight: 600 }}>${reports[selectedVehicle.registrationNumber].totalOperationalCost.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>• Fuel Cost</span>
                    <span>${reports[selectedVehicle.registrationNumber].fuelCost.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>• Maintenance Cost</span>
                    <span>${reports[selectedVehicle.registrationNumber].maintenanceCost.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Completed Distance</span>
                    <span style={{ fontWeight: 600 }}>{reports[selectedVehicle.registrationNumber].totalDistance.toLocaleString()} km</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Fuel Efficiency</span>
                    <span style={{ fontWeight: 600, color: reports[selectedVehicle.registrationNumber].fuelEfficiency > 0 ? 'var(--success)' : 'inherit' }}>
                      {reports[selectedVehicle.registrationNumber].fuelEfficiency > 0 
                        ? `${reports[selectedVehicle.registrationNumber].fuelEfficiency} km/L` 
                        : 'N/A (No fuel logged)'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Revenue Generated</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>${reports[selectedVehicle.registrationNumber].totalRevenue.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Vehicle ROI</strong>
                    <strong style={{ fontSize: '16px', color: reports[selectedVehicle.registrationNumber].roi >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {(reports[selectedVehicle.registrationNumber].roi * 100).toFixed(2)}%
                    </strong>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No operational data available yet.</div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setDetailsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
