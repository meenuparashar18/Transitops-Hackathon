import express from "express";
import {
  login,
  getCurrentUser,
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver
} from "../controllers/authController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication
router.post("/login", login);
router.get("/me", authenticateToken, getCurrentUser);

// Driver Routes
router.get("/drivers", authenticateToken, getDrivers);
router.get("/drivers/:id", authenticateToken, getDriver);
router.post("/drivers", authenticateToken, createDriver);
router.put("/drivers/:id", authenticateToken, updateDriver);
router.delete("/drivers/:id", authenticateToken, deleteDriver);

export default router;