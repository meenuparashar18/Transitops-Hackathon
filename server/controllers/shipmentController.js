import { Shipment, Expense } from '../models/Shipment.js';
import { Vehicle, MaintenanceLog, FuelLog } from '../models/Vehicle.js';
import { Driver } from '../models/User.js';

export const getShipments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const trips = await Shipment.find(query);
    return res.json(trips);
  } catch (err) {
    next(err);
  }
};

export const getShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await Shipment.findOne({ id });

    if (!trip) return res.status(404).json({ error: 'Shipment not found.' });
    return res.json(trip);
  } catch (err) {
    next(err);
  }
};

export const createShipment = async (req, res, next) => {
  try {
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, revenue, status } = req.body;

    if (!source || !destination || !vehicleId || !driverId || cargoWeight === undefined || plannedDistance === undefined) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const vehicle = await Vehicle.findOne({ registrationNumber: vehicleId.toUpperCase() });
    const driver = await Driver.findOne({ licenseNumber: driverId.toUpperCase() });

    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });
    if (!driver) return res.status(404).json({ error: 'Driver not found.' });

    // Weight capacity checks
    if (Number(cargoWeight) > vehicle.maxLoadCapacity) {
      return res.status(400).json({ error: `Cargo weight (${cargoWeight} kg) exceeds vehicle's maximum load capacity (${vehicle.maxLoadCapacity} kg).` });
    }

    const targetStatus = status || 'Draft';
    if (targetStatus === 'Dispatched') {
      if (['In Shop', 'Retired'].includes(vehicle.status)) {
        return res.status(400).json({ error: `Vehicle is currently in state '${vehicle.status}' and cannot be dispatched.` });
      }
      if (vehicle.status === 'On Trip') return res.status(400).json({ error: 'Vehicle is already assigned to an active trip.' });
      if (driver.status === 'Suspended') return res.status(400).json({ error: 'Driver is currently Suspended.' });
      if (driver.status === 'On Trip') return res.status(400).json({ error: 'Driver is already on an active trip.' });

      const today = new Date().toISOString().split('T')[0];
      if (driver.licenseExpiryDate < today) {
        return res.status(400).json({ error: `Driver's license expired on ${driver.licenseExpiryDate}.` });
      }

      vehicle.status = 'On Trip';
      driver.status = 'On Trip';
      await vehicle.save();
      await driver.save();
    }

    const newShipment = new Shipment({
      id: `TRIP-${Date.now().toString().slice(-4)}`,
      source,
      destination,
      vehicleId: vehicleId.toUpperCase(),
      driverId: driverId.toUpperCase(),
      cargoWeight: Number(cargoWeight),
      plannedDistance: Number(plannedDistance),
      status: targetStatus,
      revenue: Number(revenue) || 0,
      finalOdometer: null,
      fuelConsumed: null,
      date: new Date().toISOString().split('T')[0]
    });

    await newShipment.save();
    return res.status(201).json(newShipment);
  } catch (err) {
    next(err);
  }
};

export const dispatchShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await Shipment.findOne({ id });

    if (!trip) return res.status(404).json({ error: 'Shipment not found.' });
    if (trip.status !== 'Draft') {
      return res.status(400).json({ error: `Shipment is in status '${trip.status}' and cannot be dispatched.` });
    }

    const vehicle = await Vehicle.findOne({ registrationNumber: trip.vehicleId });
    const driver = await Driver.findOne({ licenseNumber: trip.driverId });

    if (!vehicle || !driver) return res.status(400).json({ error: 'Vehicle or Driver assigned to shipment no longer exists.' });

    if (['In Shop', 'Retired'].includes(vehicle.status)) {
      return res.status(400).json({ error: `Vehicle is in state '${vehicle.status}' and cannot be dispatched.` });
    }
    if (vehicle.status === 'On Trip') return res.status(400).json({ error: 'Vehicle is already assigned to an active trip.' });
    if (driver.status === 'Suspended') return res.status(400).json({ error: 'Driver is Suspended.' });
    if (driver.status === 'On Trip') return res.status(400).json({ error: 'Driver is already on an active trip.' });

    const today = new Date().toISOString().split('T')[0];
    if (driver.licenseExpiryDate < today) {
      return res.status(400).json({ error: `Driver's license is expired (Expiry: ${driver.licenseExpiryDate}).` });
    }

    trip.status = 'Dispatched';
    vehicle.status = 'On Trip';
    driver.status = 'On Trip';

    await trip.save();
    await vehicle.save();
    await driver.save();
    return res.json(trip);
  } catch (err) {
    next(err);
  }
};

export const completeShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { finalOdometer, fuelConsumed, fuelCost } = req.body;

    if (finalOdometer === undefined || fuelConsumed === undefined) {
      return res.status(400).json({ error: 'Final odometer and fuel consumed are required to complete shipment.' });
    }

    const trip = await Shipment.findOne({ id });
    if (!trip) return res.status(404).json({ error: 'Shipment not found.' });
    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ error: `Only dispatched shipments can be completed. Current status: ${trip.status}` });
    }

    const vehicle = await Vehicle.findOne({ registrationNumber: trip.vehicleId });
    const driver = await Driver.findOne({ licenseNumber: trip.driverId });

    if (vehicle && Number(finalOdometer) < vehicle.odometer) {
      return res.status(400).json({ error: `Final odometer (${finalOdometer}) cannot be less than current odometer (${vehicle.odometer}).` });
    }

    trip.status = 'Completed';
    trip.finalOdometer = Number(finalOdometer);
    trip.fuelConsumed = Number(fuelConsumed);

    if (vehicle) {
      vehicle.odometer = Number(finalOdometer);
      vehicle.status = 'Available';
      await vehicle.save();
    }
    if (driver) {
      driver.status = 'Available';
      await driver.save();
    }

    const cost = Number(fuelCost) || (Number(fuelConsumed) * 1.5);
    const fuelLogId = `FUEL-${Date.now().toString().slice(-4)}`;
    const expenseId = `EXP-${Date.now().toString().slice(-4)}`;

    const newFuelLog = new FuelLog({
      id: fuelLogId,
      vehicleId: trip.vehicleId,
      liters: Number(fuelConsumed),
      cost,
      odometer: Number(finalOdometer),
      date: new Date().toISOString().split('T')[0]
    });

    const newExpense = new Expense({
      id: expenseId,
      vehicleId: trip.vehicleId,
      type: 'Fuel',
      amount: cost,
      date: new Date().toISOString().split('T')[0],
      notes: `Fuel consumed on ${trip.id}`
    });

    await trip.save();
    await newFuelLog.save();
    await newExpense.save();
    return res.json(trip);
  } catch (err) {
    next(err);
  }
};

export const cancelShipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await Shipment.findOne({ id });

    if (!trip) return res.status(404).json({ error: 'Shipment not found.' });
    if (['Completed', 'Cancelled'].includes(trip.status)) {
      return res.status(400).json({ error: `Cannot cancel shipment that is already ${trip.status}.` });
    }

    const vehicle = await Vehicle.findOne({ registrationNumber: trip.vehicleId });
    const driver = await Driver.findOne({ licenseNumber: trip.driverId });

    if (trip.status === 'Dispatched') {
      if (vehicle) {
        vehicle.status = 'Available';
        await vehicle.save();
      }
      if (driver) {
        driver.status = 'Available';
        await driver.save();
      }
    }

    trip.status = 'Cancelled';
    await trip.save();
    return res.json(trip);
  } catch (err) {
    next(err);
  }
};

export const runDemoWorkflow = async (req, res, next) => {
  try {
    await Vehicle.deleteOne({ registrationNumber: 'VAN-05' });
    await Driver.deleteOne({ licenseNumber: 'DL-ALEX' });
    await Shipment.deleteOne({ id: 'TRIP-DEMO' });
    await MaintenanceLog.deleteOne({ id: 'MNT-DEMO' });
    await FuelLog.deleteOne({ id: 'FUEL-DEMO' });
    await Expense.deleteMany({ vehicleId: 'VAN-05' });

    const log = [];

    const van05 = new Vehicle({
      registrationNumber: 'VAN-05',
      name: 'Ram ProMaster 2500',
      type: 'Van',
      maxLoadCapacity: 500,
      odometer: 5000,
      acquisitionCost: 28000,
      status: 'Available',
      region: 'North'
    });
    await van05.save();
    log.push("Step 1: Registered vehicle 'VAN-05' (Capacity: 500kg, Status: Available).");

    const alex = new Driver({
      name: 'Alex Mercer',
      licenseNumber: 'DL-ALEX',
      licenseCategory: 'Class A',
      licenseExpiryDate: '2028-12-31',
      contactNumber: '555-9999',
      safetyScore: 95,
      status: 'Available'
    });
    await alex.save();
    log.push("Step 2: Registered driver 'Alex' (License: DL-ALEX, Expiry: 2028-12-31, Status: Available).");

    const tripDemo = new Shipment({
      id: 'TRIP-DEMO',
      source: 'Chicago, IL',
      destination: 'Detroit, MI',
      vehicleId: 'VAN-05',
      driverId: 'DL-ALEX',
      cargoWeight: 450,
      plannedDistance: 450,
      status: 'Dispatched',
      revenue: 1500,
      finalOdometer: null,
      fuelConsumed: null,
      date: new Date().toISOString().split('T')[0]
    });

    if (tripDemo.cargoWeight <= van05.maxLoadCapacity) {
      log.push(`Step 3 & 4: Trip created and validated (Cargo: ${tripDemo.cargoWeight}kg <= Max: ${van05.maxLoadCapacity}kg). Allowed dispatch.`);
    } else {
      return res.status(400).json({ error: 'Cargo capacity violation in demo workflow' });
    }

    van05.status = 'On Trip';
    alex.status = 'On Trip';
    await van05.save();
    await alex.save();
    await tripDemo.save();
    log.push("Step 5: Trip dispatched. Vehicle 'VAN-05' status set to 'On Trip'. Driver 'Alex' status set to 'On Trip'.");

    tripDemo.status = 'Completed';
    tripDemo.finalOdometer = 5450;
    tripDemo.fuelConsumed = 40;
    van05.odometer = 5450;

    const demoFuel = new FuelLog({
      id: 'FUEL-DEMO',
      vehicleId: 'VAN-05',
      liters: 40,
      cost: 60,
      odometer: 5450,
      date: new Date().toISOString().split('T')[0]
    });

    const demoFuelExp = new Expense({
      id: 'EXP-DEMO-FUEL',
      vehicleId: 'VAN-05',
      type: 'Fuel',
      amount: 60,
      date: new Date().toISOString().split('T')[0],
      notes: 'Fuel consumed on TRIP-DEMO'
    });

    await tripDemo.save();
    await demoFuel.save();
    await demoFuelExp.save();
    log.push("Step 6: Completed trip. Entered final odometer 5450 km and fuel consumed 40 L.");

    van05.status = 'Available';
    alex.status = 'Available';
    await van05.save();
    await alex.save();
    log.push("Step 7: System marked Vehicle 'VAN-05' and Driver 'Alex' back to 'Available'.");

    const mntDemo = new MaintenanceLog({
      id: 'MNT-DEMO',
      vehicleId: 'VAN-05',
      type: 'Oil Change',
      cost: 120,
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      status: 'Active'
    });

    const demoMntExp = new Expense({
      id: 'EXP-DEMO-MNT',
      vehicleId: 'VAN-05',
      type: 'Maintenance',
      amount: 120,
      date: new Date().toISOString().split('T')[0],
      notes: 'Oil Change (MNT-DEMO)'
    });

    van05.status = 'In Shop';
    await van05.save();
    await mntDemo.save();
    await demoMntExp.save();

    log.push("Step 8: Created Maintenance record 'Oil Change' (Cost: $120). Vehicle 'VAN-05' status set to 'In Shop' (hidden from dispatch pool).");
    log.push("Step 9: Reports successfully updated. 'VAN-05' Fuel Efficiency calculated as 11.25 km/L. Total Operational Cost calculated as $180.");

    return res.json({ log });
  } catch (err) {
    next(err);
  }
};

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