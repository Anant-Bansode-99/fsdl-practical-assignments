import express from 'express';
import { getAllVehicles, updateVehicleStatus } from '../controllers/adminController.js';
import { getAllTransactions } from '../controllers/orderController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth, adminAuth);

router.get('/all-requests', getAllVehicles);
router.patch('/requests/:id', updateVehicleStatus);
router.get('/transactions', getAllTransactions);

export default router;
