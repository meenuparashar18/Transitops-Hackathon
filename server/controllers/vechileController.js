import { Vehicle } from '../models/Vehicle.js';

export const getVehicles = async (req, res, next) => {
  try {
    const { status, type, region, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (region) query.region = region;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { registrationNumber: regex },
        { name: regex }
      ];
    }

    const vehicles = await Vehicle.find(query);
    return res.json(vehicles);
  } catch (err) {
    next(err);
  }
};

export const getVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOne({ registrationNumber: id.toUpperCase() });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const { registrationNumber, name, type, maxLoadCapacity, odometer, acquisitionCost, status, region } = req.body;

    if (!registrationNumber || !name || !type || maxLoadCapacity === undefined || odometer === undefined || acquisitionCost === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const exists = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (exists) {
      return res.status(400).json({ error: `Registration Number '${registrationNumber}' is already registered.` });
    }

    const newVehicle = new Vehicle({
      registrationNumber: registrationNumber.toUpperCase(),
      name,
      type,
      maxLoadCapacity: Number(maxLoadCapacity),
      odometer: Number(odometer),
      acquisitionCost: Number(acquisitionCost),
      status: status || 'Available',
      region: region || 'Unknown'
    });

    await newVehicle.save();
    return res.status(201).json(newVehicle);
  } catch (err) {
    next(err);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, maxLoadCapacity, odometer, acquisitionCost, status, region } = req.body;

    const vehicle = await Vehicle.findOne({ registrationNumber: id.toUpperCase() });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (name !== undefined) vehicle.name = name;
    if (type !== undefined) vehicle.type = type;
    if (maxLoadCapacity !== undefined) vehicle.maxLoadCapacity = Number(maxLoadCapacity);
    if (odometer !== undefined) vehicle.odometer = Number(odometer);
    if (acquisitionCost !== undefined) vehicle.acquisitionCost = Number(acquisitionCost);
    if (status !== undefined) vehicle.status = status;
    if (region !== undefined) vehicle.region = region;

    await vehicle.save();
    return res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Vehicle.deleteOne({ registrationNumber: id.toUpperCase() });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    next(err);
  }
};
