// src/routes/userRoutes.ts
import express from 'express';
import { getCustomers, getUserById,  updateUser, deleteUser, getVendors } from '../controllers/userController';

const router = express.Router();

// Define user routes
router.get('/customers', getCustomers);
router.get('/vendors', getVendors); 
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
