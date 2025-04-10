"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/productRoutes.ts
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadRoute_1 = __importDefault(require("./uploadRoute"));
const router = express_1.default.Router();
// Define product routes
router.get('/', productController_1.getProducts);
router.get('/:id', productController_1.getProductById);
router.get('/vendor/products', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("vendor"), productController_1.getVendorProducts);
router.post('/add', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("vendor"), productController_1.createProduct);
router.put("/:id/update", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("vendor"), productController_1.updateProduct);
router.delete('/:id/delete', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("vendor"), productController_1.deleteProduct);
router.post('/upload', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("vendor"), uploadRoute_1.default); // Upload route for vendor
exports.default = router;
