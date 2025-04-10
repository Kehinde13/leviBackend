"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/create', orderController_1.createOrder); // Handle guest & user checkout
router.get("/user-orders", authMiddleware_1.protect, orderController_1.getUserOrders);
router.put("/confirm/:id", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("vendor"), orderController_1.confirmOrder);
router.get("/vendor-orders/:vendorId", authMiddleware_1.protect, orderController_1.getVendorOrders);
exports.default = router;
