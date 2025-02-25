import express from "express";
import { authorizeRoles, protect } from "../middleware/authMiddleware";
import { getAllUsers, getAllOrders, getAllProducts, approveVendor, getAdminProfile } from '../controllers/adminController'

const router = express.Router();

router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.get("/orders", protect, authorizeRoles("admin"), getAllOrders);
router.get("/products", protect, authorizeRoles("admin"), getAllProducts);
router.put("/approve-vendor/:vendorId", protect, authorizeRoles("admin"), approveVendor);
router.get("/me", protect, authorizeRoles("admin"), getAdminProfile);

export default router;
