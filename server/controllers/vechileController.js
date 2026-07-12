import { Vehicle, MaintenanceLog } from '../models/Vehicle.js';
import { Expense } from '../models/Shipment.js';

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

export const getMaintenanceLogs = async (req, res, next) => {
  try {
    const logs = await MaintenanceLog.find({});
    return res.json(logs);
  } catch (err) {
    next(err);
  }
};

export const createMaintenanceLog = async (req, res, next) => {
  try {
    const { vehicleId, type, cost, startDate } = req.body;

    if (!vehicleId || !type || cost === undefined) {
      return res.status(400).json({ error: 'Vehicle ID, type, and estimated cost are required.' });
    }

    const vehicle = await Vehicle.findOne({ registrationNumber: vehicleId.toUpperCase() });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    if (vehicle.status === 'On Trip') {
      return res.status(400).json({ error: 'Cannot put a vehicle in maintenance while it is on an active trip.' });
    }

    vehicle.status = 'In Shop';
    await vehicle.save();

    const logId = `MNT-${Date.now().toString().slice(-4)}`;
    const newLog = new MaintenanceLog({
      id: logId,
      vehicleId: vehicleId.toUpperCase(),
      type,
      cost: Number(cost),
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: null,
      status: 'Active'
    });

    const newExpense = new Expense({
      id: `EXP-${Date.now().toString().slice(-4)}`,
      vehicleId: vehicleId.toUpperCase(),
      type: 'Maintenance',
      amount: Number(cost),
      date: startDate || new Date().toISOString().split('T')[0],
      notes: `${type} (MNT-${logId})`
    });

    await newLog.save();
    await newExpense.save();

    return res.status(201).json(newLog);
  } catch (err) {
    next(err);
  }
};

export const closeMaintenanceLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cost, endDate } = req.body;

    const log = await MaintenanceLog.findOne({ id });
    if (!log) return res.status(404).json({ error: 'Maintenance record not found.' });
    if (log.status === 'Completed') return res.status(400).json({ error: 'Maintenance is already completed.' });

    const vehicle = await Vehicle.findOne({ registrationNumber: log.vehicleId });

    log.status = 'Completed';
    log.endDate = endDate || new Date().toISOString().split('T')[0];
    if (cost !== undefined) log.cost = Number(cost);

    if (vehicle && vehicle.status === 'In Shop') {
      vehicle.status = 'Available';
      await vehicle.save();
    }

    const expenseRegex = new RegExp(id);
    const linkedExpense = await Expense.findOne({ notes: expenseRegex });
    if (linkedExpense) {
      if (cost !== undefined) linkedExpense.amount = Number(cost);
      linkedExpense.date = log.endDate;
      await linkedExpense.save();
    } else {
      const newExpense = new Expense({
        id: `EXP-${Date.now().toString().slice(-4)}`,
        vehicleId: log.vehicleId,
        type: 'Maintenance',
        amount: Number(log.cost),
        date: log.endDate,
        notes: `${log.type} (MNT-${log.id})`
      });
      await newExpense.save();
    }

    await log.save();
    return res.json(log);
  } catch (err) {
    next(err);
  }
};

export const deleteMaintenanceLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await MaintenanceLog.findOne({ id });

    if (!log) return res.status(404).json({ error: 'Maintenance record not found.' });

    const vehicle = await Vehicle.findOne({ registrationNumber: log.vehicleId });
    if (log.status === 'Active' && vehicle && vehicle.status === 'In Shop') {
      vehicle.status = 'Available';
      await vehicle.save();
    }

    await MaintenanceLog.deleteOne({ id });

    const expenseRegex = new RegExp(id);
    await Expense.deleteOne({ notes: expenseRegex });

    return res.json({ message: 'Maintenance record and associated expense deleted successfully' });
  } catch (err) {
    next(err);
  }
};