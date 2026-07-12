import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Van', 'Truck', 'Semi'] },
  maxLoadCapacity: { type: Number, required: true },
  odometer: { type: Number, required: true, default: 0 },
  acquisitionCost: { type: Number, required: true },
  status: { type: String, required: true, enum: ['Available', 'On Trip', 'In Shop', 'Retired'], default: 'Available' },
  region: { type: String, default: 'North' }
}, { timestamps: true });

const MaintenanceLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  type: { type: String, required: true },
  cost: { type: Number, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, default: null },
  status: { type: String, required: true, enum: ['Active', 'Completed'], default: 'Active' }
}, { timestamps: true });

const FuelLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  liters: { type: Number, required: true },
  cost: { type: Number, required: true },
  odometer: { type: Number, required: true },
  date: { type: String, required: true }
}, { timestamps: true });

export const Vehicle = mongoose.model('Vehicle', VehicleSchema);
export const MaintenanceLog = mongoose.model('MaintenanceLog', MaintenanceLogSchema);
export const FuelLog = mongoose.model('FuelLog', FuelLogSchema);
