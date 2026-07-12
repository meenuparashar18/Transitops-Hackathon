const API_BASE = 'http://localhost:5001/api';

const getHeaders = () => {
  const token = localStorage.getItem('transitops_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errMsg = 'An error occurred';
    try {
      const data = await response.json();
      errMsg = data.error || errMsg;
    } catch (e) {
      // response might not be json
    }
    throw new Error(errMsg);
  }
  return response.json();
};

export const api = {
  // Auth
  login: async ({ email, password }) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('transitops_token', data.token);
      localStorage.setItem('transitops_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Vehicles
  getVehicles: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE}/vehicles?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  createVehicle: async (vehicleData) => {
    const response = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(vehicleData)
    });
    return handleResponse(response);
  },

  updateVehicle: async (id, vehicleData) => {
    const response = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(vehicleData)
    });
    return handleResponse(response);
  },

  deleteVehicle: async (id) => {
    const response = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Drivers
  getDrivers: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE}/drivers?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  createDriver: async (driverData) => {
    const response = await fetch(`${API_BASE}/drivers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(driverData)
    });
    return handleResponse(response);
  },

  updateDriver: async (id, driverData) => {
    const response = await fetch(`${API_BASE}/drivers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(driverData)
    });
    return handleResponse(response);
  },

  deleteDriver: async (id) => {
    const response = await fetch(`${API_BASE}/drivers/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Trips
  getTrips: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE}/trips?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  createTrip: async (tripData) => {
    const response = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(tripData)
    });
    return handleResponse(response);
  },

  dispatchTrip: async (id) => {
    const response = await fetch(`${API_BASE}/trips/${id}/dispatch`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  completeTrip: async (id, completeData) => {
    const response = await fetch(`${API_BASE}/trips/${id}/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(completeData)
    });
    return handleResponse(response);
  },

  cancelTrip: async (id) => {
    const response = await fetch(`${API_BASE}/trips/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Maintenance
  getMaintenanceLogs: async () => {
    const response = await fetch(`${API_BASE}/maintenance`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  createMaintenanceLog: async (logData) => {
    const response = await fetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(logData)
    });
    return handleResponse(response);
  },

  closeMaintenanceLog: async (id, closeData) => {
    const response = await fetch(`${API_BASE}/maintenance/${id}/close`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(closeData)
    });
    return handleResponse(response);
  },

  deleteMaintenanceLog: async (id) => {
    const response = await fetch(`${API_BASE}/maintenance/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Expenses & Fuel logs
  getExpenses: async () => {
    const response = await fetch(`${API_BASE}/expenses`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  createExpense: async (expenseData) => {
    const response = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(expenseData)
    });
    return handleResponse(response);
  },

  deleteExpense: async (id) => {
    const response = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getFuelLogs: async () => {
    const response = await fetch(`${API_BASE}/fuel-logs`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  createFuelLog: async (fuelLogData) => {
    const response = await fetch(`${API_BASE}/fuel-logs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(fuelLogData)
    });
    return handleResponse(response);
  },

  // Reports
  getReports: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE}/reports?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Run Demo Workflow
  runDemoWorkflow: async () => {
    const response = await fetch(`${API_BASE}/demo/run`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};