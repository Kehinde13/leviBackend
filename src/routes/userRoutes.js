"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Define user routes
router.get("/customers", authMiddleware_1.protect, userController_1.getCustomers);
router.get("/vendors", authMiddleware_1.protect, userController_1.getVendors);
router.get("/profile/:id", authMiddleware_1.protect, userController_1.getUserProfile);
router.put("/profile/update/:id", authMiddleware_1.protect, userController_1.updateUserProfile);
router.get("/:id", authMiddleware_1.protect, userController_1.getUserById);
router.put("/:id", authMiddleware_1.protect, userController_1.updateUser);
router.delete("/:id", authMiddleware_1.protect, userController_1.deleteUser);
exports.default = router;
