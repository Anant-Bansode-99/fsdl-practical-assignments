import express from 'express';
import multer from 'multer';
import path from 'path';
import { submitVehicle, getApprovedVehicles, getUserVehicles, getVehicleById, buyVehicle } from '../controllers/vehicleController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  }
});

const upload = multer({ storage: storage });

router.get('/public', getApprovedVehicles);
router.get('/public/:id', getVehicleById);

// Protected routes
router.use(auth);
router.post('/submit', upload.single('image'), submitVehicle);
router.post('/buy/:id', buyVehicle);
router.get('/my-requests', getUserVehicles);

export default router;
