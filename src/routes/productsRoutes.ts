// src/routes/productRoutes.ts
import express from 'express';
import 
{ getProducts, getProductById, createProduct, updateProduct, deleteProduct, getVendorProducts }
from '../controllers/productController'; 
import { authorizeRoles, protect } from '../middleware/authMiddleware';
import uploadRoute from './uploadRoute';

const router = express.Router();

// Define product routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/vendor/products', protect, authorizeRoles("vendor"), getVendorProducts);
router.post('/add', protect, authorizeRoles("vendor"),  createProduct);
router.put("/:id/update", protect, authorizeRoles("vendor"),  updateProduct);
router.delete('/:id/delete', protect, authorizeRoles("vendor"), deleteProduct);
router.post('/upload', protect, authorizeRoles("vendor"), uploadRoute); // Upload route for vendor

export default router;
