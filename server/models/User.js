import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'] }
}, { timestamps: true });

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  licenseCategory: { type: String, required: true },
  licenseExpiryDate: { type: String, required: true },
  contactNumber: { type: String, required: true },
  safetyScore: { type: Number, required: true, default: 100 },
  status: { type: String, required: true, enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'], default: 'Available' }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
export const Driver = mongoose.model('Driver', DriverSchema);
