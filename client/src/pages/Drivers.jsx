import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Drivers({ user }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseCategory: 'Class A',
    licenseExpiryDate: '',
    contactNumber: '',
    safetyScore: 100,
    status: 'Available'
  });

  const canEdit = ['Fleet Manager', 'Safety Officer'].includes(user?.role);
  const canDelete = user?.role === 'Fleet Manager';

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError('');
      const filters = {};
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter;

      const data = await api.getDrivers(filters);
      setDrivers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [search, statusFilter]);

  const handleOpenCreateModal = () => {
    setSelectedDriver(null);
    setFormData({
      name: '',
      licenseNumber: '',
      licenseCategory: 'Class A',
      licenseExpiryDate: '',
      contactNumber: '',
      safetyScore: 100,
      status: 'Available'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseCategory: driver.licenseCategory,
      licenseExpiryDate: driver.licenseExpiryDate,
      contactNumber: driver.contactNumber,
      safetyScore: driver.safetyScore,
      status: driver.status
    });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (selectedDriver) {
        // Edit Mode
        await api.updateDriver(selectedDriver.licenseNumber, formData);
      } else {
        // Create Mode
        await api.createDriver(formData);
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) {
      setError(err.message || 'Failed to save driver profile');
    }
  };

  const handleDelete = async (licenseNumber) => {
    if (!window.confirm(`Are you sure you want to delete driver license ${licenseNumber}?`)) return;
    try {
      setError('');
      await api.deleteDriver(licenseNumber);
      fetchDrivers();
    } catch (err) {
      setError(err.message || 'Failed to delete driver');
    }
  };

  const getLicenseStatus = (expiryDate) => {
    const today = new Date('2026-07-12'); // Fixed hackathon local time from metadata
    const exp = new Date(expiryDate);
    const timeDiff = exp.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return { label: 'EXPIRED', class: 'badge-danger', text: 'Expired license!' };
    } else if (daysDiff <= 60) {
      return { label: `EXPIRING SOON (${daysDiff}d)`, class: 'badge-warning', text: 'Licence expiring soon!' };
    }
    return { label: 'VALID', class: 'badge-success', text: '' };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available': return <span className="badge badge-success">Available</span>;
      case 'On Trip': return <span className="badge badge-warning">On Trip</span>;
      case 'Off Duty': return <span className="badge badge-muted">Off Duty</span>;
      case 'Suspended': return <span className="badge badge-danger">Suspended</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      {error && <div className="alert-banner alert-banner-danger">{error}</div>}

      {/* Flag expired/expiring drivers for safety officer */}
      {drivers.some(d => getLicenseStatus(d.licenseExpiryDate).label !== 'VALID') && (
        <div className="alert-banner alert-banner-warning" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <strong>⚠️ Safety Compliance Alert:</strong>
          <ul style={{ paddingLeft: '20px', fontSize: '12px' }}>
            {drivers.filter(d => getLicenseStatus(d.licenseExpiryDate).label === 'EXPIRED').map(d => (
              <li key={d.licenseNumber}>Driver <strong>{d.name}</strong> ({d.licenseNumber}) has an <strong>EXPIRED</strong> license. Assigning to trips is locked.</li>
            ))}
            {drivers.filter(d => getLicenseStatus(d.licenseExpiryDate).label.startsWith('EXPIRING SOON')).map(d => (
              <li key={d.licenseNumber}>Driver <strong>{d.name}</strong> ({d.licenseNumber}) license expires soon ({d.licenseExpiryDate}).</li>
            ))}
          </ul>
        </div>
      )}

      <div className="table-container">
        {/* Header Toolbar */}
        <div className="table-header-bar">
          <div className="table-search-box">
            <input 
              type="text" 
              placeholder="Search drivers by name or license..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="form-control"
            />
          </div>
          <div className="table-filters">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="form-control" 
              style={{ width: '150px' }}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
            {canEdit && (
              <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                + Add Driver
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        {loading && drivers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading driver roster...</div>
        ) : drivers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No drivers found matching filters.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>License Number</th>
                  <th>Category</th>
                  <th>License Expiry</th>
                  <th>License Status</th>
                  <th>Contact</th>
                  <th>Safety Score</th>
                  <th>Status</th>
                  {canEdit && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {drivers.map(d => {
                  const licStatus = getLicenseStatus(d.licenseExpiryDate);
                  return (
                    <tr key={d.licenseNumber}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td>{d.licenseNumber}</td>
                      <td>{d.licenseCategory}</td>
                      <td>{d.licenseExpiryDate}</td>
                      <td>
                        <span className={`badge ${licStatus.class}`}>{licStatus.label}</span>
                      </td>
                      <td>{d.contactNumber}</td>
                      <td style={{ fontWeight: 600, color: d.safetyScore >= 85 ? 'var(--success)' : d.safetyScore >= 70 ? 'var(--warning)' : 'var(--danger)' }}>
                        {d.safetyScore}/100
                      </td>
                      <td>{getStatusBadge(d.status)}</td>
                      {canEdit && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleOpenEditModal(d)}>
                              Edit
                            </button>
                            {canDelete && (
                              <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDelete(d.licenseNumber)}>
                                Delete
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

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h3>{selectedDriver ? 'Edit Driver Profile' : 'Register New Driver'}</h3>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Driver Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="form-control" 
                  required
                  placeholder="e.g. Alex Mercer"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>License Number</label>
                  <input 
                    type="text" 
                    name="licenseNumber" 
                    value={formData.licenseNumber} 
                    onChange={handleInputChange} 
                    className="form-control" 
                    required
                    placeholder="e.g. DL-998877"
                    disabled={!!selectedDriver}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="form-group">
                  <label>License Category</label>
                  <select name="licenseCategory" value={formData.licenseCategory} onChange={handleInputChange} className="form-control">
                    <option value="Class A">Class A (CDL - Heavy Semi)</option>
                    <option value="Class B">Class B (CDL - Large Trucks)</option>
                    <option value="Class C">Class C (Standard Commercial)</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>License Expiry Date</label>
                  <input 
                    type="date" 
                    name="licenseExpiryDate" 
                    value={formData.licenseExpiryDate} 
                    onChange={handleInputChange} 
                    className="form-control" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input 
                    type="text" 
                    name="contactNumber" 
                    value={formData.contactNumber} 
                    onChange={handleInputChange} 
                    className="form-control" 
                    required
                    placeholder="e.g. 555-0101"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Safety Performance Score (0-100)</label>
                  <input 
                    type="number" 
                    name="safetyScore" 
                    value={formData.safetyScore} 
                    onChange={handleInputChange} 
                    className="form-control" 
                    required
                    min="0"
                    max="100"
                    placeholder="100"
                  />
                </div>
                <div className="form-group">
                  <label>Driver Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="form-control">
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Driver</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
