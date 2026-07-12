import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Expenses({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeSubTab, setActiveSubTab] = useState(user?.role === 'Driver' ? 'fuel' : 'expenses'); // 'expenses' or 'fuel'

  // Modal States
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);

  // Form States
  const [expenseForm, setExpenseForm] = useState({
    vehicleId: '',
    type: 'Tolls',
    amount: '',
    date: '',
    notes: ''
  });

  const [fuelForm, setFuelForm] = useState({
    vehicleId: '',
    liters: '',
    cost: '',
    odometer: '',
    date: ''
  });

  // Access Roles
  const isFinanceOrManager = ['Fleet Manager', 'Financial Analyst'].includes(user?.role);
  const canLogFuel = ['Fleet Manager', 'Driver', 'Financial Analyst'].includes(user?.role);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (user?.role !== 'Driver') {
        const allExpenses = await api.getExpenses();
        setExpenses(allExpenses);
      }

      const allFuel = await api.getFuelLogs();
      setFuelLogs(allFuel);

      const allVehicles = await api.getVehicles();
      setVehicles(allVehicles);
    } catch (err) {
      setError(err.message || 'Failed to fetch expense records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const handleOpenExpenseModal = () => {
    setExpenseForm({
      vehicleId: '',
      type: 'Tolls',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setExpenseModalOpen(true);
  };

  const handleOpenFuelModal = () => {
    setFuelForm({
      vehicleId: '',
      liters: '',
      cost: '',
      odometer: '',
      date: new Date().toISOString().split('T')[0]
    });
    setFuelModalOpen(true);
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.createExpense(expenseForm);
      setExpenseModalOpen(false);
      fetchFinancialData();
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    }
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.createFuelLog(fuelForm);
      setFuelModalOpen(false);
      fetchFinancialData();
    } catch (err) {
      setError(err.message || 'Failed to save fuel log');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    try {
      setError('');
      await api.deleteExpense(id);
      fetchFinancialData();
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  // CSV Export logic
  const handleExportCSV = () => {
    if (activeSubTab === 'expenses') {
      const headers = ['Expense ID', 'Vehicle ID', 'Type', 'Amount ($)', 'Date', 'Notes'];
      const rows = expenses.map(e => [
        e.id,
        e.vehicleId,
        e.type,
        e.amount,
        e.date,
        e.notes
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.map(val => `"${val || ''}"`).join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `transitops_expense_ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Fuel Log ID', 'Vehicle ID', 'Volume (Liters)', 'Cost ($)', 'Odometer (km)', 'Date'];
      const rows = fuelLogs.map(f => [
        f.id,
        f.vehicleId,
        f.liters,
        f.cost,
        f.odometer,
        f.date
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.map(val => `"${val || ''}"`).join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `transitops_fuel_consumption_ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      {error && <div className="alert-banner alert-banner-danger">{error}</div>}

      {/* Subtab selection headers */}
      {user?.role !== 'Driver' && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '24px' }}>
          <button 
            onClick={() => setActiveSubTab('expenses')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeSubTab === 'expenses' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeSubTab === 'expenses' ? '2px solid var(--primary)' : '2px solid transparent',
              paddingBottom: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            General Operational Expenses
          </button>
          <button 
            onClick={() => setActiveSubTab('fuel')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeSubTab === 'fuel' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeSubTab === 'fuel' ? '2px solid var(--primary)' : '2px solid transparent',
              paddingBottom: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            Fuel Refuel Logs
          </button>
        </div>
      )}

      <div className="table-container">
        {/* Header Toolbar */}
        <div className="table-header-bar">
          <h4 style={{ fontWeight: 600 }}>
            {activeSubTab === 'expenses' ? 'Asset Expenses Ledger' : 'Fuel Log History'}
          </h4>
          <div className="table-filters">
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              📥 Export CSV
            </button>
            
            {activeSubTab === 'expenses' && isFinanceOrManager && (
              <button className="btn btn-primary" onClick={handleOpenExpenseModal}>
                + Log Expense
              </button>
            )}
            
            {activeSubTab === 'fuel' && canLogFuel && (
              <button className="btn btn-primary" onClick={handleOpenFuelModal}>
                + Log Fuel Refill
              </button>
            )}
          </div>
        </div>

        {/* Content tables */}
        {activeSubTab === 'expenses' ? (
          /* Expenses Table */
          loading && expenses.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No expenses logged.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Expense ID</th>
                    <th>Vehicle ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Notes</th>
                    {user?.role === 'Fleet Manager' && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.id}</td>
                      <td style={{ fontWeight: 600 }}>{e.vehicleId}</td>
                      <td>
                        <span className={`badge ${
                          e.type === 'Fuel' ? 'badge-success' : 
                          e.type === 'Maintenance' ? 'badge-danger' : 
                          e.type === 'Tolls' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {e.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>${e.amount.toLocaleString()}</td>
                      <td>{e.date}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{e.notes || '-'}</td>
                      {user?.role === 'Fleet Manager' && (
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDeleteExpense(e.id)}>
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Fuel Logs Table */
          loading && fuelLogs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading fuel logs...</div>
          ) : fuelLogs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No fuel entries logged.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Vehicle ID</th>
                    <th>Volume (Liters)</th>
                    <th>Total Cost</th>
                    <th>Odometer Reading</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>{f.id}</td>
                      <td style={{ fontWeight: 600 }}>{f.vehicleId}</td>
                      <td>{f.liters} L</td>
                      <td style={{ fontWeight: 600 }}>${f.cost.toLocaleString()}</td>
                      <td>{f.odometer.toLocaleString()} km</td>
                      <td>{f.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Expense Modal */}
      {expenseModalOpen && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleExpenseSubmit}>
            <div className="modal-header">
              <h3>Record Fleet Expense</h3>
              <button type="button" className="modal-close" onClick={() => setExpenseModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Fleet Asset (Vehicle)</label>
                <select 
                  value={expenseForm.vehicleId} 
                  onChange={(e) => setExpenseForm({...expenseForm, vehicleId: e.target.value})} 
                  className="form-control" 
                  required
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber}>
                      {v.registrationNumber} - {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expense Category</label>
                  <select 
                    value={expenseForm.type} 
                    onChange={(e) => setExpenseForm({...expenseForm, type: e.target.value})} 
                    className="form-control"
                  >
                    <option value="Tolls">Tolls</option>
                    <option value="Fuel">Fuel (Direct logging)</option>
                    <option value="Maintenance">Maintenance / Repairs</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cost Amount ($)</label>
                  <input 
                    type="number" 
                    value={expenseForm.amount} 
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} 
                    className="form-control" 
                    required 
                    min="0" 
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Date of Expense</label>
                <input 
                  type="date" 
                  value={expenseForm.date} 
                  onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})} 
                  className="form-control" 
                  required
                />
              </div>

              <div className="form-group">
                <label>Description / Notes</label>
                <textarea 
                  value={expenseForm.notes} 
                  onChange={(e) => setExpenseForm({...expenseForm, notes: e.target.value})} 
                  className="form-control" 
                  placeholder="e.g. Route toll tax, or detail notes"
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setExpenseModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Expense</button>
            </div>
          </form>
        </div>
      )}

      {/* Fuel Modal */}
      {fuelModalOpen && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleFuelSubmit}>
            <div className="modal-header">
              <h3>Log Fuel Refill</h3>
              <button type="button" className="modal-close" onClick={() => setFuelModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Vehicle</label>
                <select 
                  value={fuelForm.vehicleId} 
                  onChange={(e) => setFuelForm({...fuelForm, vehicleId: e.target.value})} 
                  className="form-control" 
                  required
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber}>
                      {v.registrationNumber} - {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fuel Volume (Liters)</label>
                  <input 
                    type="number" 
                    value={fuelForm.liters} 
                    onChange={(e) => setFuelForm({...fuelForm, liters: e.target.value})} 
                    className="form-control" 
                    required 
                    min="1" 
                    placeholder="e.g. 60"
                  />
                </div>
                <div className="form-group">
                  <label>Total Price ($)</label>
                  <input 
                    type="number" 
                    value={fuelForm.cost} 
                    onChange={(e) => setFuelForm({...fuelForm, cost: e.target.value})} 
                    className="form-control" 
                    required 
                    min="0" 
                    placeholder="e.g. 90"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Current Odometer (km)</label>
                  <input 
                    type="number" 
                    value={fuelForm.odometer} 
                    onChange={(e) => setFuelForm({...fuelForm, odometer: e.target.value})} 
                    className="form-control" 
                    required 
                    min="0"
                    placeholder="e.g. 12500"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Refuel</label>
                  <input 
                    type="date" 
                    value={fuelForm.date} 
                    onChange={(e) => setFuelForm({...fuelForm, date: e.target.value})} 
                    className="form-control" 
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setFuelModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Log Fuel Refill</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
