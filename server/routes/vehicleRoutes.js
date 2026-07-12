import express from "express";
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getMaintenanceLogs,
  createMaintenanceLog,
  closeMaintenanceLog,
  deleteMaintenanceLog
} from "../controllers/vechicleController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Vehicle Routes
router.get("/", authenticateToken, getVehicles);
router.post("/", authenticateToken, createVehicle);

// Maintenance Routes
router.get("/maintenance", authenticateToken, getMaintenanceLogs);
router.post("/maintenance", authenticateToken, createMaintenanceLog);
router.put("/maintenance/:id/close", authenticateToken, closeMaintenanceLog);
router.delete("/maintenance/:id", authenticateToken, deleteMaintenanceLog);

// Vehicle by ID Routes
router.get("/:id", authenticateToken, getVehicle);
router.put("/:id", authenticateToken, updateVehicle);
router.delete("/:id", authenticateToken, deleteVehicle);

export default router;