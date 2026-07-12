import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Import Models for Seeding
import { User, Driver } from './models/User.js';
import { Vehicle, MaintenanceLog, FuelLog } from './models/Vehicle.js';
import { Shipment, Expense } from './models/Shipment.js';

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transitops';

// Enable CORS for frontend requests
app.use(cors({
  origin: '*',
  credentials: true
}));

// Body parser
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', vehicleRoutes);
app.use('/api', shipmentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', timestamp: new Date() });
});

// Central Error Middleware
app.use(errorHandler);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatic Seeding Logic
async function seedMongoDB() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log("Database already seeded. Skipping seed routine.");
      return;
    }

    console.log("Empty database detected. Seeding MongoDB from db.json...");
    
    const dbJsonPath = path.resolve(__dirname, './config/db.json');
    if (!fs.existsSync(dbJsonPath)) {
      console.log("No db.json seed file found. Seeding skipped.");
      return;
    }

    const raw = fs.readFileSync(dbJsonPath, 'utf8');
    const seedData = JSON.parse(raw);

    // 1. Seed Users (with hashed passwords)
    if (seedData.users && seedData.users.length) {
      const preparedUsers = seedData.users.map(u => {
        if (u.password && !u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
          u.password = bcrypt.hashSync(u.password, 10);
        }
        return u;
      });
      await User.insertMany(preparedUsers);
      console.log(`Seeded ${preparedUsers.length} Users.`);
    }

    // 2. Seed Vehicles
    if (seedData.vehicles && seedData.vehicles.length) {
      await Vehicle.insertMany(seedData.vehicles);
      console.log(`Seeded ${seedData.vehicles.length} Vehicles.`);
    }

    // 3. Seed Drivers
    if (seedData.drivers && seedData.drivers.length) {
      await Driver.insertMany(seedData.drivers);
      console.log(`Seeded ${seedData.drivers.length} Drivers.`);
    }

    // 4. Seed Shipments (trips)
    if (seedData.trips && seedData.trips.length) {
      await Shipment.insertMany(seedData.trips);
      console.log(`Seeded ${seedData.trips.length} Shipments.`);
    }

    // 5. Seed Maintenance
    if (seedData.maintenanceLogs && seedData.maintenanceLogs.length) {
      await MaintenanceLog.insertMany(seedData.maintenanceLogs);
      console.log(`Seeded ${seedData.maintenanceLogs.length} Maintenance logs.`);
    }

    // 6. Seed Fuel Logs
    if (seedData.fuelLogs && seedData.fuelLogs.length) {
      await FuelLog.insertMany(seedData.fuelLogs);
      console.log(`Seeded ${seedData.fuelLogs.length} Fuel logs.`);
    }

    // 7. Seed Expenses
    if (seedData.expenses && seedData.expenses.length) {
      await Expense.insertMany(seedData.expenses);
      console.log(`Seeded ${seedData.expenses.length} Expenses.`);
    }

    console.log("🎉 MongoDB Seeding Complete!");
  } catch (err) {
    console.error("Error seeding MongoDB database", err);
  }
}

// Connect to MongoDB and start Server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`Connected to MongoDB: ${MONGODB_URI}`);
    seedMongoDB();
  })
  .catch(err => {
    console.error("MongoDB Connection Error! Please make sure local MongoDB is running.", err);
  });

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`TransitOps Backend Running on port ${PORT}`);
  console.log(`API base path: http://localhost:${PORT}/api`);
  console.log(`========================================`);
});
