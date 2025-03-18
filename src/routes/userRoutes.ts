import express from "express";
import {
  getCustomers,
  getUserById,
  updateUser,
  deleteUser,
  getVendors,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Define user routes
router.get("/customers", protect, getCustomers);
router.get("/vendors", protect, getVendors);
router.get("/profile/:id", protect, getUserProfile);
router.put("/profile/update/:id", protect, updateUserProfile);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

export default router;
