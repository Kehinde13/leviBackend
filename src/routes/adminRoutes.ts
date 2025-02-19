import express from "express";
import { authorizeRoles } from "../middleware/authMiddleware";
import { getAllUsers, getAllOrders, getAllProducts, manageVendor, getAdminProfile } from '../controllers/adminController'

const router = express.Router();

router.get("/users", authorizeRoles("admin"), getAllUsers);
router.get("/orders", authorizeRoles("admin"), getAllOrders);
router.get("/products", authorizeRoles("admin"), getAllProducts);
router.put("/vendors/:vendorId", authorizeRoles("admin"), manageVendor); // Approve/Suspend Vendor
router.get("/me", authorizeRoles("admin"), getAdminProfile);

export default router;
