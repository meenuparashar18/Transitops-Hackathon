import { Router } from 'express';
import { getShipments, getShipment, createShipment, dispatchShipment, completeShipment, cancelShipment, runDemoWorkflow } from '../controllers/shipmentController.js';
import { getExpenses, createExpense, deleteExpense, getFuelLogs, createFuelLog, getReportsAndKpis } from '../controllers/expenseController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Shipments (Trips) endpoints
router.get('/trips', authenticateToken, getShipments);
router.get('/trips/:id', authenticateToken, getShipment);
router.post('/trips', authenticateToken, requireRole(['Fleet Manager', 'Driver']), createShipment);
router.post('/trips/:id/dispatch', authenticateToken, requireRole(['Fleet Manager', 'Driver']), dispatchShipment);
router.post('/trips/:id/complete', authenticateToken, requireRole(['Fleet Manager', 'Driver']), completeShipment);
router.post('/trips/:id/cancel', authenticateToken, requireRole(['Fleet Manager', 'Driver']), cancelShipment);

// Expenses and Fuel Logs endpoints
router.get('/expenses', authenticateToken, getExpenses);
router.post('/expenses', authenticateToken, requireRole(['Fleet Manager', 'Financial Analyst']), createExpense);
router.delete('/expenses/:id', authenticateToken, requireRole(['Fleet Manager']), deleteExpense);

router.get('/fuel-logs', authenticateToken, getFuelLogs);
router.post('/fuel-logs', authenticateToken, requireRole(['Fleet Manager', 'Driver', 'Financial Analyst']), createFuelLog);

// Analytics and Reports endpoints
router.get('/reports', authenticateToken, getReportsAndKpis);

// Auto Demo workflow trigger
router.post('/demo/run', authenticateToken, runDemoWorkflow);

export default router;
