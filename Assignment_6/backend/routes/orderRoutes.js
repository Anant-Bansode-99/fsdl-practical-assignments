import express from 'express';
import { placeOrder, confirmOrder, cancelOrder, getBuyerOrders, getSellerOrders } from '../controllers/orderController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

// Buyer places a purchase request for a vehicle
router.post('/place/:id', placeOrder);

// Buyer views their purchase history
router.get('/my-purchases', getBuyerOrders);

// Seller views incoming purchase requests
router.get('/incoming', getSellerOrders);

// Seller confirms deal done
router.patch('/confirm/:orderId', confirmOrder);

// Seller or buyer cancels
router.patch('/cancel/:orderId', cancelOrder);

export default router;
