// src/routes/productRoutes.ts
import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authorizeRoles, protect } from '../middleware/authMiddleware';

const router = express.Router();

// Define product routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/add', protect, authorizeRoles("vendor"), createProduct);
router.put('/:id/update', protect, authorizeRoles("vendor"), updateProduct);
router.delete('/:id/delete', protect, authorizeRoles("vendor"), deleteProduct);

export default router;
