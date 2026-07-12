import mongoose from 'mongoose';

const ShipmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  vehicleId: { type: String, required: true },
  driverId: { type: String, required: true },
  cargoWeight: { type: Number, required: true },
  plannedDistance: { type: Number, required: true },
  status: { type: String, required: true, enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'], default: 'Draft' },
  revenue: { type: Number, required: true, default: 0 },
  finalOdometer: { type: Number, default: null },
  fuelConsumed: { type: Number, default: null },
  date: { type: String, required: true }
}, { timestamps: true });

const ExpenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  type: { type: String, required: true, enum: ['Fuel', 'Maintenance', 'Tolls', 'Insurance', 'Other'] },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

export const Shipment = mongoose.model('Shipment', ShipmentSchema);
export const Expense = mongoose.model('Expense', ExpenseSchema);
