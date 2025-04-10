"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
router.get("/users", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"), adminController_1.getAllUsers);
router.get("/orders", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"), adminController_1.getAllOrders);
router.get("/products", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"), adminController_1.getAllProducts);
router.put("/approve-vendor/:vendorId", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"), adminController_1.approveVendor);
router.get("/me", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"), adminController_1.getAdminProfile);
exports.default = router;
