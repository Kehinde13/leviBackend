// src/routes/productRoutes.ts
import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Define product routes
router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);
router.post('/add', protect, createProduct);
router.put('/:id/update', protect, updateProduct);
router.delete('/:id/delete', protect, deleteProduct);

export default router;
