import { getCollection, saveCollection } from '../models/db.js';

export const getVehicles = (req, res) => {
  let vehicles = getCollection('vehicles');
  
  // Apply query filters
  const { status, type, region, search } = req.query;

  if (status) {
    vehicles = vehicles.filter(v => v.status === status);
  }
  if (type) {
    vehicles = vehicles.filter(v => v.type === type);
  }
  if (region) {
    vehicles = vehicles.filter(v => v.region === region);
  }
  if (search) {
    const q = search.toLowerCase();
    vehicles = vehicles.filter(v => 
      v.registrationNumber.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q)
    );
  }

  return res.json(vehicles);
};

export const getVehicle = (req, res) => {
  const { id } = req.params;
  const vehicles = getCollection('vehicles');
  const vehicle = vehicles.find(v => v.registrationNumber === id);

  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  return res.json(vehicle);
};

export const createVehicle = (req, res) => {
  const { registrationNumber, name, type, maxLoadCapacity, odometer, acquisitionCost, status, region } = req.body;

  if (!registrationNumber || !name || !type || maxLoadCapacity === undefined || odometer === undefined || acquisitionCost === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const vehicles = getCollection('vehicles');
  
  // Enforce unique registration number rule
  const exists = vehicles.some(v => v.registrationNumber.toUpperCase() === registrationNumber.toUpperCase());
  if (exists) {
    return res.status(400).json({ error: `Registration Number '${registrationNumber}' is already registered.` });
  }

  const newVehicle = {
    registrationNumber: registrationNumber.toUpperCase(),
    name,
    type,
    maxLoadCapacity: Number(maxLoadCapacity),
    odometer: Number(odometer),
    acquisitionCost: Number(acquisitionCost),
    status: status || 'Available',
    region: region || 'Unknown'
  };

  vehicles.push(newVehicle);
  saveCollection('vehicles', vehicles);

  return res.status(201).json(newVehicle);
};

export const updateVehicle = (req, res) => {
  const { id } = req.params; // current registration number
  const { name, type, maxLoadCapacity, odometer, acquisitionCost, status, region } = req.body;

  const vehicles = getCollection('vehicles');
  const index = vehicles.findIndex(v => v.registrationNumber === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  // Update vehicle
  const updatedVehicle = {
    ...vehicles[index],
    name: name !== undefined ? name : vehicles[index].name,
    type: type !== undefined ? type : vehicles[index].type,
    maxLoadCapacity: maxLoadCapacity !== undefined ? Number(maxLoadCapacity) : vehicles[index].maxLoadCapacity,
    odometer: odometer !== undefined ? Number(odometer) : vehicles[index].odometer,
    acquisitionCost: acquisitionCost !== undefined ? Number(acquisitionCost) : vehicles[index].acquisitionCost,
    status: status !== undefined ? status : vehicles[index].status,
    region: region !== undefined ? region : vehicles[index].region
  };

  vehicles[index] = updatedVehicle;
  saveCollection('vehicles', vehicles);

  return res.json(updatedVehicle);
};

export const deleteVehicle = (req, res) => {
  const { id } = req.params;
  let vehicles = getCollection('vehicles');
  const exists = vehicles.some(v => v.registrationNumber === id);

  if (!exists) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  vehicles = vehicles.filter(v => v.registrationNumber !== id);
  saveCollection('vehicles', vehicles);

  return res.json({ message: 'Vehicle deleted successfully' });
};
