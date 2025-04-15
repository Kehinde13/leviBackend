import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./src/routes/userRoutes";
import productRoutes from "./src/routes/productsRoutes";
import orderRoutes from "./src/routes/orderRoutes";
import authRoutes from "./src/routes/authRoutes";
import { protect, authorizeRoles } from "./src/middleware/authMiddleware";
import adminRoutes from "./src/routes/adminRoutes";
import path from "path";

dotenv.config();

const allowedOrigins = ["https://levi-0-0-1.vercel.app"]; 

const app: Application = express();
app.use(express.json());

// ✅ Fix: Explicitly set CORS headers to allow requests from the frontend
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ Allow cookies and authorization headers
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Specify allowed headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ Specify allowed methods
  })
);

// ✅ Fix: Handle preflight requests manually
app.use((req: Request, res: Response, next): void => {
  res.header("Access-Control-Allow-Origin", "https://levi-0-0-1.vercel.app"); // ✅ Ensure frontend origin is explicitly allowed
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true"); // ✅ Ensure credentials are allowed

  if (req.method === "OPTIONS") {
    res.status(200).end(); // ✅ Ensure void return type
    return;
  }

  next();
});

const CONNECTION = process.env.CONNECTION as string; // ✅ MongoDB Connection String

// ✅ Connect to MongoDB only once (outside of handler)
mongoose
  .connect(CONNECTION)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", protect, authorizeRoles("admin"), adminRoutes);

// ✅ Fix: Ensure API responses have CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://levi-0-0-1.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// ✅ Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running successfully! 🚀");
});

// ✅ Export the Express app for Vercel
export default app;
