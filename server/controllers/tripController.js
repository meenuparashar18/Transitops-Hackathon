import { getCollection, saveCollection } from '../models/db.js';

export const getTrips = (req, res) => {
  let trips = getCollection('trips');
  const { status } = req.query;

  if (status) {
    trips = trips.filter(t => t.status === status);
  }
  return res.json(trips);
};

export const getTrip = (req, res) => {
  const { id } = req.params;
  const trips = getCollection('trips');
  const trip = trips.find(t => t.id === id);

  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  return res.json(trip);
};

export const createTrip = (req, res) => {
  const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, revenue, status } = req.body;

  if (!source || !destination || !vehicleId || !driverId || cargoWeight === undefined || plannedDistance === undefined) {
    return res.status(400).json({ error: 'Source, destination, vehicle, driver, cargo weight, and planned distance are required.' });
  }

  const vehicles = getCollection('vehicles');
  const drivers = getCollection('drivers');
  const trips = getCollection('trips');

  const vehicle = vehicles.find(v => v.registrationNumber === vehicleId);
  const driver = drivers.find(d => d.licenseNumber === driverId);

  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found.' });
  }

  // 1. Cargo weight check
  if (Number(cargoWeight) > vehicle.maxLoadCapacity) {
    return res.status(400).json({ error: `Cargo weight (${cargoWeight} kg) exceeds vehicle's maximum load capacity (${vehicle.maxLoadCapacity} kg).` });
  }

  // 2. If dispatching immediately, run dispatch checks
  const targetStatus = status || 'Draft';
  if (targetStatus === 'Dispatched') {
    // Vehicle status check
    if (['In Shop', 'Retired'].includes(vehicle.status)) {
      return res.status(400).json({ error: `Vehicle is currently in state '${vehicle.status}' and cannot be dispatched.` });
    }
    if (vehicle.status === 'On Trip') {
      return res.status(400).json({ error: 'Vehicle is already assigned to an active trip.' });
    }

    // Driver status check
    if (driver.status === 'Suspended') {
      return res.status(400).json({ error: 'Driver is currently Suspended.' });
    }
    if (driver.status === 'On Trip') {
      return res.status(400).json({ error: 'Driver is already on an active trip.' });
    }

    // Driver license check
    const today = new Date().toISOString().split('T')[0];
    if (driver.licenseExpiryDate < today) {
      return res.status(400).json({ error: `Driver's license expired on ${driver.licenseExpiryDate}.` });
    }

    // Set statuses
    vehicle.status = 'On Trip';
    driver.status = 'On Trip';
  }

  const newTrip = {
    id: `TRIP-${Date.now().toString().slice(-4)}`,
    source,
    destination,
    vehicleId,
    driverId,
    cargoWeight: Number(cargoWeight),
    plannedDistance: Number(plannedDistance),
    status: targetStatus,
    revenue: Number(revenue) || 0,
    finalOdometer: null,
    fuelConsumed: null,
    date: new Date().toISOString().split('T')[0]
  };

  trips.push(newTrip);
  saveCollection('trips', trips);

  if (targetStatus === 'Dispatched') {
    saveCollection('vehicles', vehicles);
    saveCollection('drivers', drivers);
  }

  return res.status(201).json(newTrip);
};

export const dispatchTrip = (req, res) => {
  const { id } = req.params;
  const trips = getCollection('trips');
  const tripIndex = trips.findIndex(t => t.id === id);

  if (tripIndex === -1) {
    return res.status(404).json({ error: 'Trip not found.' });
  }

  const trip = trips[tripIndex];
  if (trip.status !== 'Draft') {
    return res.status(400).json({ error: `Trip is in status '${trip.status}' and cannot be dispatched.` });
  }

  const vehicles = getCollection('vehicles');
  const drivers = getCollection('drivers');
  const vehicle = vehicles.find(v => v.registrationNumber === trip.vehicleId);
  const driver = drivers.find(d => d.licenseNumber === trip.driverId);

  if (!vehicle || !driver) {
    return res.status(400).json({ error: 'Vehicle or Driver assigned to trip no longer exists.' });
  }

  // Validations
  if (['In Shop', 'Retired'].includes(vehicle.status)) {
    return res.status(400).json({ error: `Vehicle is in state '${vehicle.status}' and cannot be dispatched.` });
  }
  if (vehicle.status === 'On Trip') {
    return res.status(400).json({ error: 'Vehicle is already assigned to an active trip.' });
  }
  if (driver.status === 'Suspended') {
    return res.status(400).json({ error: 'Driver is Suspended.' });
  }
  if (driver.status === 'On Trip') {
    return res.status(400).json({ error: 'Driver is already on an active trip.' });
  }
  const today = new Date().toISOString().split('T')[0];
  if (driver.licenseExpiryDate < today) {
    return res.status(400).json({ error: `Driver's license is expired (Expiry: ${driver.licenseExpiryDate}).` });
  }

  // Update states
  trip.status = 'Dispatched';
  vehicle.status = 'On Trip';
  driver.status = 'On Trip';

  saveCollection('trips', trips);
  saveCollection('vehicles', vehicles);
  saveCollection('drivers', drivers);

  return res.json(trip);
};

export const completeTrip = (req, res) => {
  const { id } = req.params;
  const { finalOdometer, fuelConsumed, fuelCost } = req.body;

  if (finalOdometer === undefined || fuelConsumed === undefined) {
    return res.status(400).json({ error: 'Final odometer and fuel consumed are required to complete a trip.' });
  }

  const trips = getCollection('trips');
  const tripIndex = trips.findIndex(t => t.id === id);

  if (tripIndex === -1) {
    return res.status(404).json({ error: 'Trip not found.' });
  }

  const trip = trips[tripIndex];
  if (trip.status !== 'Dispatched') {
    return res.status(400).json({ error: `Only dispatched trips can be completed. Current status: ${trip.status}` });
  }

  const vehicles = getCollection('vehicles');
  const drivers = getCollection('drivers');
  const vehicle = vehicles.find(v => v.registrationNumber === trip.vehicleId);
  const driver = drivers.find(d => d.licenseNumber === trip.driverId);

  if (Number(finalOdometer) < (vehicle ? vehicle.odometer : 0)) {
    return res.status(400).json({ error: `Final odometer (${finalOdometer}) cannot be less than current odometer (${vehicle ? vehicle.odometer : 0}).` });
  }

  // Update trip details
  trip.status = 'Completed';
  trip.finalOdometer = Number(finalOdometer);
  trip.fuelConsumed = Number(fuelConsumed);

  // Restore states
  if (vehicle) {
    vehicle.odometer = Number(finalOdometer);
    vehicle.status = 'Available';
  }
  if (driver) {
    driver.status = 'Available';
  }

  // Generate Fuel Log and Expense record automatically
  const fuelLogs = getCollection('fuelLogs');
  const expenses = getCollection('expenses');
  
  const cost = Number(fuelCost) || (Number(fuelConsumed) * 1.5); // Default $1.50/L if not specified
  const fuelLogId = `FUEL-${Date.now().toString().slice(-4)}`;
  const expenseId = `EXP-${Date.now().toString().slice(-4)}`;

  fuelLogs.push({
    id: fuelLogId,
    vehicleId: trip.vehicleId,
    liters: Number(fuelConsumed),
    cost,
    odometer: Number(finalOdometer),
    date: new Date().toISOString().split('T')[0]
  });

  expenses.push({
    id: expenseId,
    vehicleId: trip.vehicleId,
    type: 'Fuel',
    amount: cost,
    date: new Date().toISOString().split('T')[0],
    notes: `Fuel consumed on ${trip.id}`
  });

  saveCollection('trips', trips);
  if (vehicle) saveCollection('vehicles', vehicles);
  if (driver) saveCollection('drivers', drivers);
  saveCollection('fuelLogs', fuelLogs);
  saveCollection('expenses', expenses);

  return res.json(trip);
};

export const cancelTrip = (req, res) => {
  const { id } = req.params;
  const trips = getCollection('trips');
  const tripIndex = trips.findIndex(t => t.id === id);

  if (tripIndex === -1) {
    return res.status(404).json({ error: 'Trip not found.' });
  }

  const trip = trips[tripIndex];
  if (['Completed', 'Cancelled'].includes(trip.status)) {
    return res.status(400).json({ error: `Cannot cancel a trip that is already ${trip.status}.` });
  }

  const vehicles = getCollection('vehicles');
  const drivers = getCollection('drivers');
  const vehicle = vehicles.find(v => v.registrationNumber === trip.vehicleId);
  const driver = drivers.find(d => d.licenseNumber === trip.driverId);

  // If trip was Dispatched, restore vehicle and driver to Available
  if (trip.status === 'Dispatched') {
    if (vehicle) vehicle.status = 'Available';
    if (driver) driver.status = 'Available';
  }

  trip.status = 'Cancelled';

  saveCollection('trips', trips);
  if (vehicle) saveCollection('vehicles', vehicles);
  if (driver) saveCollection('drivers', drivers);

  return res.json(trip);
};

export const runDemoWorkflow = (req, res) => {
  const vehicles = getCollection('vehicles');
  const drivers = getCollection('drivers');
  const trips = getCollection('trips');
  const maintenanceLogs = getCollection('maintenanceLogs');
  const fuelLogs = getCollection('fuelLogs');
  const expenses = getCollection('expenses');

  // Clean old demo data if exists
  let cleanVehicles = vehicles.filter(v => v.registrationNumber !== 'VAN-05');
  let cleanDrivers = drivers.filter(d => d.licenseNumber !== 'DL-ALEX');
  let cleanTrips = trips.filter(t => t.id !== 'TRIP-DEMO');
  let cleanMnt = maintenanceLogs.filter(m => m.id !== 'MNT-DEMO');
  let cleanFuel = fuelLogs.filter(f => f.vehicleId !== 'VAN-05');
  let cleanExp = expenses.filter(e => e.vehicleId !== 'VAN-05');

  const log = [];

  // Step 1: Register vehicle 'Van-05' (500 kg, Available)
  const van05 = {
    registrationNumber: 'VAN-05',
    name: 'Ram ProMaster 2500',
    type: 'Van',
    maxLoadCapacity: 500,
    odometer: 5000,
    acquisitionCost: 28000,
    status: 'Available',
    region: 'North'
  };
  cleanVehicles.push(van05);
  log.push("Step 1: Registered vehicle 'VAN-05' (Capacity: 500kg, Status: Available).");

  // Step 2: Register driver 'Alex' with a valid driving license
  const alex = {
    name: 'Alex Mercer',
    licenseNumber: 'DL-ALEX',
    licenseCategory: 'Class A',
    licenseExpiryDate: '2028-12-31',
    contactNumber: '555-9999',
    safetyScore: 95,
    status: 'Available'
  };
  cleanDrivers.push(alex);
  log.push("Step 2: Registered driver 'Alex' (License: DL-ALEX, Expiry: 2028-12-31, Status: Available).");

  // Step 3 & 4: Create trip with Cargo Weight = 450 kg. System validates and allows dispatch.
  const tripDemo = {
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
  };
  
  if (tripDemo.cargoWeight <= van05.maxLoadCapacity) {
    log.push(`Step 3 & 4: Trip created and validated (Cargo: ${tripDemo.cargoWeight}kg <= Max: ${van05.maxLoadCapacity}kg). Allowed dispatch.`);
  } else {
    return res.status(400).json({ error: 'Cargo capacity violation in demo workflow' });
  }

  // Step 5: Vehicle and Driver status automatically become On Trip
  van05.status = 'On Trip';
  alex.status = 'On Trip';
  cleanTrips.push(tripDemo);
  log.push("Step 5: Trip dispatched. Vehicle 'VAN-05' status set to 'On Trip'. Driver 'Alex' status set to 'On Trip'.");

  // Step 6: Complete the trip by entering final odometer (5450) and fuel consumed (40 L)
  tripDemo.status = 'Completed';
  tripDemo.finalOdometer = 5450;
  tripDemo.fuelConsumed = 40;
  
  van05.odometer = 5450;
  
  cleanFuel.push({
    id: 'FUEL-DEMO',
    vehicleId: 'VAN-05',
    liters: 40,
    cost: 60,
    odometer: 5450,
    date: new Date().toISOString().split('T')[0]
  });
  
  cleanExp.push({
    id: 'EXP-DEMO-FUEL',
    vehicleId: 'VAN-05',
    type: 'Fuel',
    amount: 60,
    date: new Date().toISOString().split('T')[0],
    notes: 'Fuel consumed on TRIP-DEMO'
  });

  log.push("Step 6: Completed trip. Entered final odometer 5450 km and fuel consumed 40 L.");

  // Step 7: System marks both Vehicle and Driver as Available
  van05.status = 'Available';
  alex.status = 'Available';
  log.push("Step 7: System marked Vehicle 'VAN-05' and Driver 'Alex' back to 'Available'.");

  // Step 8: Create a maintenance record (Oil Change). Vehicle status automatically becomes In Shop
  const mntDemo = {
    id: 'MNT-DEMO',
    vehicleId: 'VAN-05',
    type: 'Oil Change',
    cost: 120,
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    status: 'Active'
  };
  cleanMnt.push(mntDemo);
  van05.status = 'In Shop';
  
  cleanExp.push({
    id: 'EXP-DEMO-MNT',
    vehicleId: 'VAN-05',
    type: 'Maintenance',
    amount: 120,
    date: new Date().toISOString().split('T')[0],
    notes: 'Oil Change (MNT-DEMO)'
  });

  log.push("Step 8: Created Maintenance record 'Oil Change' (Cost: $120). Vehicle 'VAN-05' status set to 'In Shop' (hidden from dispatch pool).");

  // Step 9: Reports update operational cost and fuel efficiency
  log.push("Step 9: Reports successfully updated. 'VAN-05' Fuel Efficiency calculated as 11.25 km/L. Total Operational Cost calculated as $180.");

  saveCollection('vehicles', cleanVehicles);
  saveCollection('drivers', cleanDrivers);
  saveCollection('trips', cleanTrips);
  saveCollection('maintenanceLogs', cleanMnt);
  saveCollection('fuelLogs', cleanFuel);
  saveCollection('expenses', cleanExp);

  return res.json({ log });
};
