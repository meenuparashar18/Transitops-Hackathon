import { Router } from 'express';
import { login, getCurrentUser } from '../controllers/authController.js';
import { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicleController.js';
import { getDrivers, getDriver, createDriver, updateDriver, deleteDriver } from '../controllers/driverController.js';
import { getTrips, getTrip, createTrip, dispatchTrip, completeTrip, cancelTrip, runDemoWorkflow } from '../controllers/tripController.js';
import { getMaintenanceLogs, createMaintenanceLog, closeMaintenanceLog, deleteMaintenanceLog } from '../controllers/maintenanceController.js';
import { getExpenses, createExpense, deleteExpense, getFuelLogs, createFuelLog, getReportsAndKpis } from '../controllers/expenseController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Auth routes (public login, secure me)
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, getCurrentUser);

// Vehicle Registry routes
router.get('/vehicles', authenticateToken, getVehicles);
router.get('/vehicles/:id', authenticateToken, getVehicle);
router.post('/vehicles', authenticateToken, requireRole(['Fleet Manager']), createVehicle);
router.put('/vehicles/:id', authenticateToken, requireRole(['Fleet Manager']), updateVehicle);
router.delete('/vehicles/:id', authenticateToken, requireRole(['Fleet Manager']), deleteVehicle);

// Driver Management routes
router.get('/drivers', authenticateToken, getDrivers);
router.get('/drivers/:id', authenticateToken, getDriver);
router.post('/drivers', authenticateToken, requireRole(['Fleet Manager', 'Safety Officer']), createDriver);
router.put('/drivers/:id', authenticateToken, requireRole(['Fleet Manager', 'Safety Officer']), updateDriver);
router.delete('/drivers/:id', authenticateToken, requireRole(['Fleet Manager']), deleteDriver);

// Trip Management routes
router.get('/trips', authenticateToken, getTrips);
router.get('/trips/:id', authenticateToken, getTrip);
router.post('/trips', authenticateToken, requireRole(['Fleet Manager', 'Driver']), createTrip);
router.post('/trips/:id/dispatch', authenticateToken, requireRole(['Fleet Manager', 'Driver']), dispatchTrip);
router.post('/trips/:id/complete', authenticateToken, requireRole(['Fleet Manager', 'Driver']), completeTrip);
router.post('/trips/:id/cancel', authenticateToken, requireRole(['Fleet Manager', 'Driver']), cancelTrip);

// Maintenance routes
router.get('/maintenance', authenticateToken, getMaintenanceLogs);
router.post('/maintenance', authenticateToken, requireRole(['Fleet Manager']), createMaintenanceLog);
router.put('/maintenance/:id/close', authenticateToken, requireRole(['Fleet Manager']), closeMaintenanceLog);
router.delete('/maintenance/:id', authenticateToken, requireRole(['Fleet Manager']), deleteMaintenanceLog);

// Expenses and Fuel Logs routes
router.get('/expenses', authenticateToken, getExpenses);
router.post('/expenses', authenticateToken, requireRole(['Fleet Manager', 'Financial Analyst']), createExpense);
router.delete('/expenses/:id', authenticateToken, requireRole(['Fleet Manager']), deleteExpense);

router.get('/fuel-logs', authenticateToken, getFuelLogs);
router.post('/fuel-logs', authenticateToken, requireRole(['Fleet Manager', 'Driver', 'Financial Analyst']), createFuelLog);

// Reports & KPIs analytics
router.get('/reports', authenticateToken, getReportsAndKpis);

// Auto demo workflow execution
router.post('/demo/run', authenticateToken, runDemoWorkflow);

export default router;
