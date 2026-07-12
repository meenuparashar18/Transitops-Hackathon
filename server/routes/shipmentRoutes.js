import express from "express";
import {
  getShipments,
  getShipment,
  createShipment,
  dispatchShipment,
  completeShipment,
  cancelShipment,
  runDemoWorkflow,
  getExpenses,
  createExpense,
  deleteExpense,
  getFuelLogs,
  createFuelLog,
  getReportsAndKpis
} from "../controllers/shipmentController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getShipments);

router.post("/", authenticateToken, createShipment);

router.post("/demo/run", authenticateToken, runDemoWorkflow);

router.get("/expenses", authenticateToken, getExpenses);

router.post("/expenses", authenticateToken, createExpense);

router.delete("/expenses/:id", authenticateToken, deleteExpense);

router.get("/fuel", authenticateToken, getFuelLogs);

router.post("/fuel", authenticateToken, createFuelLog);

router.get("/reports", authenticateToken, getReportsAndKpis);

router.get("/:id", authenticateToken, getShipment);


router.put("/:id/dispatch", authenticateToken, dispatchShipment);

router.put("/:id/complete", authenticateToken, completeShipment);

router.put("/:id/cancel", authenticateToken, cancelShipment);

export default router;