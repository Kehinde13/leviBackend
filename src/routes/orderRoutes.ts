import express from 'express';
import { confirmOrder, createOrder, getUserOrders, getVendorOrders } from '../controllers/orderController';
import { authorizeRoles, protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create', createOrder); // Handle guest & user checkout
router.get("/user-orders", protect, getUserOrders);
router.put("/confirm/:id", protect, authorizeRoles("vendor"), confirmOrder);
router.get("/vendor-orders/:vendorId", protect, getVendorOrders);

export default router;
