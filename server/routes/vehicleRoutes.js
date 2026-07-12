import { Router } from 'express';
import { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vechileController.js';
import { getMaintenanceLogs, createMaintenanceLog, closeMaintenanceLog, deleteMaintenanceLog } from '../controllers/maintenanceController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Vehicles endpoints
router.get('/vehicles', authenticateToken, getVehicles);
router.get('/vehicles/:id', authenticateToken, getVehicle);
router.post('/vehicles', authenticateToken, requireRole(['Fleet Manager']), createVehicle);
router.put('/vehicles/:id', authenticateToken, requireRole(['Fleet Manager']), updateVehicle);
router.delete('/vehicles/:id', authenticateToken, requireRole(['Fleet Manager']), deleteVehicle);

// Maintenance endpoints
router.get('/maintenance', authenticateToken, getMaintenanceLogs);
router.post('/maintenance', authenticateToken, requireRole(['Fleet Manager']), createMaintenanceLog);
router.put('/maintenance/:id/close', authenticateToken, requireRole(['Fleet Manager']), closeMaintenanceLog);
router.delete('/maintenance/:id', authenticateToken, requireRole(['Fleet Manager']), deleteMaintenanceLog);

export default router;
