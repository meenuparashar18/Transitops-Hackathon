import { Expense, Shipment } from '../models/Shipment.js';
import { Vehicle, FuelLog, MaintenanceLog } from '../models/Vehicle.js';
import { Driver } from '../models/User.js';

export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({});
    return res.json(expenses);
  } catch (err) {
    next(err);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const { vehicleId, type, amount, date, notes } = req.body;

    if (!vehicleId || !type || amount === undefined) {
      return res.status(400).json({ error: 'Vehicle ID, type, and amount are required.' });
    }

    const newExpense = new Expense({
      id: `EXP-${Date.now().toString().slice(-4)}`,
      vehicleId: vehicleId.toUpperCase(),
      type,
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      notes: notes || ''
    });

    await newExpense.save();
    return res.status(201).json(newExpense);
  } catch (err) {
    next(err);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Expense.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    return res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getFuelLogs = async (req, res, next) => {
  try {
    const fuelLogs = await FuelLog.find({});
    return res.json(fuelLogs);
  } catch (err) {
    next(err);
  }
};

export const createFuelLog = async (req, res, next) => {
  try {
    const { vehicleId, liters, cost, odometer, date } = req.body;

    if (!vehicleId || liters === undefined || cost === undefined || odometer === undefined) {
      return res.status(400).json({ error: 'Vehicle ID, liters, cost, and odometer are required.' });
    }

    const fuelLogId = `FUEL-${Date.now().toString().slice(-4)}`;
    const newLog = new FuelLog({
      id: fuelLogId,
      vehicleId: vehicleId.toUpperCase(),
      liters: Number(liters),
      cost: Number(cost),
      odometer: Number(odometer),
      date: date || new Date().toISOString().split('T')[0]
    });

    const newExpense = new Expense({
      id: `EXP-${Date.now().toString().slice(-4)}`,
      vehicleId: vehicleId.toUpperCase(),
      type: 'Fuel',
      amount: Number(cost),
      date: date || new Date().toISOString().split('T')[0],
      notes: `Manual fuel log entry (${fuelLogId})`
    });

    await newLog.save();
    await newExpense.save();

    return res.status(201).json(newLog);
  } catch (err) {
    next(err);
  }
};

export const getReportsAndKpis = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({});
    const drivers = await Driver.find({});
    const trips = await Shipment.find({});
    const expenses = await Expense.find({});

    const { region, vehicleType, status } = req.query;

    let filteredVehicles = [...vehicles];
    if (region) filteredVehicles = filteredVehicles.filter(v => v.region === region);
    if (vehicleType) filteredVehicles = filteredVehicles.filter(v => v.type === vehicleType);
    if (status) filteredVehicles = filteredVehicles.filter(v => v.status === status);

    const filteredVehicleIds = new Set(filteredVehicles.map(v => v.registrationNumber));
    const filteredTrips = trips.filter(t => filteredVehicleIds.has(t.vehicleId));

    const totalVehiclesCount = filteredVehicles.length;
    const activeVehiclesCount = filteredVehicles.filter(v => v.status === 'On Trip').length;
    const availableVehiclesCount = filteredVehicles.filter(v => v.status === 'Available').length;
    const maintenanceVehiclesCount = filteredVehicles.filter(v => v.status === 'In Shop').length;
    const retiredVehiclesCount = filteredVehicles.filter(v => v.status === 'Retired').length;

    const activeTripsCount = filteredTrips.filter(t => t.status === 'Dispatched').length;
    const pendingTripsCount = filteredTrips.filter(t => t.status === 'Draft').length;
    const driversOnDutyCount = drivers.filter(d => ['Available', 'On Trip'].includes(d.status)).length;

    const activeFleetSize = totalVehiclesCount - retiredVehiclesCount;
    const fleetUtilization = activeFleetSize > 0 ? Math.round((activeVehiclesCount / activeFleetSize) * 100) : 0;

    const vehicleReports = filteredVehicles.map(vehicle => {
      const vId = vehicle.registrationNumber;
      const vExpenses = expenses.filter(e => e.vehicleId === vId);
      const fuelCost = vExpenses.filter(e => e.type === 'Fuel').reduce((sum, e) => sum + e.amount, 0);
      const maintenanceCost = vExpenses.filter(e => e.type === 'Maintenance').reduce((sum, e) => sum + e.amount, 0);
      const totalOperationalCost = fuelCost + maintenanceCost;

      const vTrips = trips.filter(t => t.vehicleId === vId && t.status === 'Completed');
      const totalDistance = vTrips.reduce((sum, t) => sum + t.plannedDistance, 0);
      const totalFuelConsumed = vTrips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);
      const totalRevenue = vTrips.reduce((sum, t) => sum + t.revenue, 0);

      const fuelEfficiency = totalFuelConsumed > 0 ? Number((totalDistance / totalFuelConsumed).toFixed(2)) : 0;
      const roiVal = vehicle.acquisitionCost > 0 ? Number(((totalRevenue - totalOperationalCost) / vehicle.acquisitionCost).toFixed(4)) : 0;

      return {
        registrationNumber: vId,
        name: vehicle.name,
        type: vehicle.type,
        status: vehicle.status,
        acquisitionCost: vehicle.acquisitionCost,
        fuelCost,
        maintenanceCost,
        totalOperationalCost,
        totalDistance,
        totalFuelConsumed,
        fuelEfficiency,
        totalRevenue,
        roi: roiVal
      };
    });

    const totalRevenueSum = vehicleReports.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalFuelCostSum = vehicleReports.reduce((sum, r) => sum + r.fuelCost, 0);
    const totalMaintenanceCostSum = vehicleReports.reduce((sum, r) => sum + r.maintenanceCost, 0);
    const totalOperationalCostSum = totalFuelCostSum + totalMaintenanceCostSum;
    const netProfit = totalRevenueSum - totalOperationalCostSum;

    return res.json({
      kpis: {
        totalVehicles: totalVehiclesCount,
        activeVehicles: activeVehiclesCount,
        availableVehicles: availableVehiclesCount,
        vehiclesInMaintenance: maintenanceVehiclesCount,
        retiredVehicles: retiredVehiclesCount,
        activeTrips: activeTripsCount,
        pendingTrips: pendingTripsCount,
        driversOnDuty: driversOnDutyCount,
        fleetUtilization
      },
      financials: {
        totalRevenue: totalRevenueSum,
        totalFuelCost: totalFuelCostSum,
        totalMaintenanceCost: totalMaintenanceCostSum,
        totalOperationalCost: totalOperationalCostSum,
        netProfit
      },
      vehicleReports
    });
  } catch (err) {
    next(err);
  }
};
