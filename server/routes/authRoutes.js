import { Router } from 'express';
import { login, getCurrentUser } from '../controllers/authController.js';
import { getDrivers, getDriver, createDriver, updateDriver, deleteDriver } from '../controllers/driverController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Auth endpoints
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, getCurrentUser);

// Driver Management endpoints
router.get('/drivers', authenticateToken, getDrivers);
router.get('/drivers/:id', authenticateToken, getDriver);
router.post('/drivers', authenticateToken, requireRole(['Fleet Manager', 'Safety Officer']), createDriver);
router.put('/drivers/:id', authenticateToken, requireRole(['Fleet Manager', 'Safety Officer']), updateDriver);
router.delete('/drivers/:id', authenticateToken, requireRole(['Fleet Manager']), deleteDriver);

export default router;
