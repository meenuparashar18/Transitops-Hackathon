import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import * as vehicleController from './controllers/vechileController.js';
import * as driverController from './controllers/driverController.js';
import * as tripController from './controllers/shipmentController.js';
import * as maintenanceController from './controllers/maintenanceController.js';

import { Vehicle, MaintenanceLog, FuelLog } from './models/Vehicle.js';
import { Driver, User } from './models/User.js';
import { Shipment, Expense } from './models/Shipment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbJsonPath = path.resolve(__dirname, './config/db.json');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transitops_test';

// Mock request and response helpers
const mockRes = () => {
  const res = {
    statusCode: 200,
    data: {},
    status: (code) => {
      res.statusCode = code;
      return res;
    },
    json: (payload) => {
      res.data = payload;
      return res;
    }
  };
  return res;
};

// Next mock function
const mockNext = (err) => {
  if (err) throw err;
};

async function runTests() {
  console.log("🚀 Starting Programmatic Backend Verifications on MongoDB...");
  
  try {
    // Connect to test db
    await mongoose.connect(MONGODB_URI);
    
    // Clear test db
    await Promise.all([
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      Shipment.deleteMany({}),
      MaintenanceLog.deleteMany({}),
      FuelLog.deleteMany({}),
      Expense.deleteMany({}),
      User.deleteMany({})
    ]);

    // Seed test db with VAN-05 and Driver Alex Mercer
    const testVehicle = new Vehicle({
      registrationNumber: 'VAN-05',
      name: 'RAM ProMaster 2500',
      type: 'Van',
      maxLoadCapacity: 500,
      odometer: 5000,
      acquisitionCost: 28000,
      status: 'Available',
      region: 'North'
    });
    await testVehicle.save();

    const testDriver = new Driver({
      name: 'Alex Mercer',
      licenseNumber: 'DL-998877',
      licenseCategory: 'Class A',
      licenseExpiryDate: '2028-12-31',
      contactNumber: '555-0199',
      safetyScore: 92,
      status: 'Available'
    });
    await testDriver.save();

    // Test 1: Cargo capacity violation check
    console.log("\n🧪 Test 1: Cargo capacity validation check...");
    const req1 = {
      body: {
        source: 'Chicago',
        destination: 'Detroit',
        vehicleId: 'VAN-05',
        driverId: 'DL-998877',
        cargoWeight: 600, // exceeds 500kg limit!
        plannedDistance: 450,
        revenue: 1000,
        status: 'Draft'
      }
    };
    const res1 = mockRes();
    await tripController.createShipment(req1, res1, mockNext);
    
    if (res1.statusCode === 400 && res1.data.error.includes("exceeds vehicle's maximum load capacity")) {
      console.log("✅ Passed: Blocked trip creation because weight (600kg) > capacity (500kg).");
    } else {
      throw new Error(`Failed Test 1: Status code: ${res1.statusCode}, response: ${JSON.stringify(res1.data)}`);
    }

    // Test 2: Trip dispatch and status transition check
    console.log("\n🧪 Test 2: Trip dispatch and status transition check...");
    const req2 = {
      body: {
        source: 'Chicago',
        destination: 'Detroit',
        vehicleId: 'VAN-05',
        driverId: 'DL-998877',
        cargoWeight: 450, // fits within 500kg
        plannedDistance: 450,
        revenue: 1500,
        status: 'Dispatched'
      }
    };
    const res2 = mockRes();
    await tripController.createShipment(req2, res2, mockNext);

    const v5Updated = await Vehicle.findOne({ registrationNumber: 'VAN-05' });
    const d1Updated = await Driver.findOne({ licenseNumber: 'DL-998877' });

    if (
      res2.statusCode === 201 &&
      res2.data.status === 'Dispatched' &&
      v5Updated.status === 'On Trip' &&
      d1Updated.status === 'On Trip'
    ) {
      console.log("✅ Passed: Trip successfully dispatched. Vehicle and Driver status set to 'On Trip'.");
    } else {
      throw new Error(`Failed Test 2: Status code: ${res2.statusCode}, Shipment Status: ${res2.data?.status}, Vehicle Status: ${v5Updated?.status}, Driver Status: ${d1Updated?.status}`);
    }

    const createdTripId = res2.data.id;

    // Test 3: Trip completion and calculations check
    console.log("\n🧪 Test 3: Trip completion and calculations check...");
    const req3 = {
      params: { id: createdTripId },
      body: {
        finalOdometer: 5450,
        fuelConsumed: 40,
        fuelCost: 65
      }
    };
    const res3 = mockRes();
    await tripController.completeShipment(req3, res3, mockNext);

    const v5Final = await Vehicle.findOne({ registrationNumber: 'VAN-05' });
    const d1Final = await Driver.findOne({ licenseNumber: 'DL-998877' });
    const addedFuelLog = await FuelLog.findOne({ vehicleId: 'VAN-05', id: { $ne: 'FUEL-DEMO' } });
    const addedExpense = await Expense.findOne({ vehicleId: 'VAN-05', type: 'Fuel', id: { $ne: 'EXP-DEMO-FUEL' } });

    if (
      res3.statusCode === 200 &&
      v5Final.status === 'Available' &&
      v5Final.odometer === 5450 &&
      d1Final.status === 'Available' &&
      addedFuelLog &&
      addedFuelLog.liters === 40 &&
      addedExpense &&
      addedExpense.amount === 65
    ) {
      console.log("✅ Passed: Trip completed. Odometer updated to 5450. Vehicle and Driver reset to 'Available'. Fuel log and Expense generated.");
    } else {
      throw new Error(`Failed Test 3: Status code: ${res3.statusCode}, Odometer: ${v5Final?.odometer}, Vehicle status: ${v5Final?.status}, FuelLog: ${JSON.stringify(addedFuelLog)}`);
    }

    // Test 4: Maintenance creation and dispatch restriction check
    console.log("\n🧪 Test 4: Maintenance creation and dispatch restriction check...");
    const req4 = {
      body: {
        vehicleId: 'VAN-05',
        type: 'Tire Replacement',
        cost: 250,
        startDate: '2026-07-12'
      }
    };
    const res4 = mockRes();
    await maintenanceController.createMaintenanceLog(req4, res4, mockNext);

    const v5Maint = await Vehicle.findOne({ registrationNumber: 'VAN-05' });
    const maintLogId = res4.data.id;

    if (res4.statusCode === 201 && v5Maint.status === 'In Shop') {
      console.log("✅ Passed: Maintenance ticket created. Vehicle status set to 'In Shop'.");
    } else {
      throw new Error(`Failed Test 4a: Status code: ${res4.statusCode}, Vehicle status: ${v5Maint?.status}`);
    }

    // Attempt to dispatch a new trip with this vehicle (should block!)
    const req4b = {
      body: {
        source: 'Detroit',
        destination: 'Chicago',
        vehicleId: 'VAN-05',
        driverId: 'DL-998877',
        cargoWeight: 100,
        plannedDistance: 450,
        revenue: 1000,
        status: 'Dispatched'
      }
    };
    const res4b = mockRes();
    await tripController.createShipment(req4b, res4b, mockNext);

    if (res4b.statusCode === 400 && res4b.data.error.includes("Vehicle is currently in state 'In Shop'")) {
      console.log("✅ Passed: Blocked dispatch because vehicle is 'In Shop'.");
    } else {
      throw new Error(`Failed Test 4b: Status code: ${res4b.statusCode}, response: ${JSON.stringify(res4b.data)}`);
    }

    // Test 5: Maintenance closing and state restore check
    console.log("\n🧪 Test 5: Maintenance closing and state restore check...");
    const req5 = {
      params: { id: maintLogId },
      body: {
        cost: 280,
        endDate: '2026-07-12'
      }
    };
    const res5 = mockRes();
    await maintenanceController.closeMaintenanceLog(req5, res5, mockNext);

    const v5Closed = await Vehicle.findOne({ registrationNumber: 'VAN-05' });
    const logClosed = await MaintenanceLog.findOne({ id: maintLogId });

    if (res5.statusCode === 200 && v5Closed.status === 'Available' && logClosed.status === 'Completed' && logClosed.cost === 280) {
      console.log("✅ Passed: Maintenance completed. Cost finalized. Vehicle returned to 'Available'.");
    } else {
      throw new Error(`Failed Test 5: Status code: ${res5.statusCode}, Vehicle status: ${v5Closed?.status}, Log status: ${logClosed?.status}`);
    }

    console.log("\n🎉 ALL BACKEND BUSINESS RULE TESTS PASSED SUCCESSFULLY! 🎉\n");
  } catch (err) {
    console.error("\n❌ TEST SUITE FAILED:", err.message);
    process.exit(1);
  } finally {
    // Drop the test database to clean up
    try {
      await mongoose.connection.db.dropDatabase();
      console.log("🧹 Test database dropped successfully.");
    } catch (e) {
      console.error("Failed to drop test database", e);
    }
    await mongoose.connection.close();
    console.log("🔌 MongoDB Connection closed.");
  }
}

runTests();
