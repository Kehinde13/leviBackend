// server.ts
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './src/routes/userRoutes';
import productRoutes from './src/routes/productsRoutes';
import orderRoutes from './src/routes/orderRoutes';
import authRoutes from './src/routes/authRoutes';
import { protect, authorizeRoles } from './src/middleware/authMiddleware';
import adminRoutes from './src/routes/adminRoutes';



dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(cors())

const PORT = process.env.PORT || 3000; // Use environment-specified PORT or default to 3000.
const CONNECTION = process.env.CONNECTION as string; // Connection string for MongoDB.



// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// ✅ Authentication Routes
app.use("/api/auth", authRoutes);

// ✅ Admin Routes (Protected)
app.use("/api/admin", protect, authorizeRoles("admin"), adminRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Server is running successfully! 🚀');
});

// Function to start the server and connect to the database.
const start = async () => {
    try {
      await mongoose.connect(CONNECTION); // Connect to the MongoDB database.
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`); // Log that the server is running.
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message); // Log connection errors.
      } else {
        console.log("Unexpected error", error); // Log unexpected errors.
      }
    }
  };
  
  // Start the server.
  start();
