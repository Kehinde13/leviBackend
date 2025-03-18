import express from 'express';
import { createOrder, getUserOrders } from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', createOrder); // Handle guest & user checkout
router.get("/user-orders", protect, getUserOrders);

export default router;
