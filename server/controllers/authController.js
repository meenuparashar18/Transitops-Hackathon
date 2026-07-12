import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Driver } from '../models/User.js';

// 🌟 FIX: Kisi doosri file se import karne par crash ho raha tha, isliye direct fallback de diya
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
        { email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: {
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.json({ user: req.user });
};

export const getDrivers = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { licenseNumber: regex }
      ];
    }

    const drivers = await Driver.find(query);
    return res.json(drivers);
  } catch (err) {
    next(err);
  }
};

export const getDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findOne({ licenseNumber: id.toUpperCase() });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    return res.json(driver);
  } catch (err) {
    next(err);
  }
};

export const createDriver = async (req, res, next) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status } = req.body;

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber || safetyScore === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const exists = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase() });
    if (exists) {
      return res.status(400).json({ error: `Driver with License Number '${licenseNumber}' already exists.` });
    }

    const newDriver = new Driver({
      name,
      licenseNumber: licenseNumber.toUpperCase(),
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore: Number(safetyScore),
      status: status || 'Available'
    });

    await newDriver.save();
    return res.status(201).json(newDriver);
  } catch (err) {
    next(err);
  }
};

export const updateDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status } = req.body;

    const driver = await Driver.findOne({ licenseNumber: id.toUpperCase() });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    if (name !== undefined) driver.name = name;
    if (licenseCategory !== undefined) driver.licenseCategory = licenseCategory;
    if (licenseExpiryDate !== undefined) driver.licenseExpiryDate = licenseExpiryDate;
    if (contactNumber !== undefined) driver.contactNumber = contactNumber;
    if (safetyScore !== undefined) driver.safetyScore = Number(safetyScore);
    if (status !== undefined) driver.status = status;

    await driver.save();
    return res.json(driver);
  } catch (err) {
    next(err);
  }
};

export const deleteDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Driver.deleteOne({ licenseNumber: id.toUpperCase() });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    return res.json({ message: 'Driver deleted successfully' });
  } catch (err) {
    next(err);
  }
};