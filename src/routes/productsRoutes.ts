// src/routes/productRoutes.ts
import express from 'express';
import 
{ getProducts, getProductById, createProduct, updateProduct, deleteProduct, getVendorProducts, upload }
from '../controllers/productController';
import { authorizeRoles, protect } from '../middleware/authMiddleware';

const router = express.Router();

// Define product routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/vendor/products', protect, authorizeRoles("vendor"), getVendorProducts);
router.post('/add', protect, authorizeRoles("vendor"), upload.single("image"), createProduct);
router.put("/:id/update", protect, authorizeRoles("vendor"), upload.single("image"), updateProduct);
router.delete('/:id/delete', protect, authorizeRoles("vendor"), deleteProduct);

export default router;
