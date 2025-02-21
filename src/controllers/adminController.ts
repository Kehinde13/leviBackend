import { Request, Response } from "express";
import User from "../models/userModel";
import Order from "../models/orderModel";
import Product from "../models/productModel";
import { AuthRequest } from "../middleware/authMiddleware";

// ✅ Get the logged-in admin's data
export const getAdminProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
     // ✅ Check if user is attached to request (from `protect` middleware)
     if (!req.user) {
     res.status(401).json({ message: "Unauthorized" });
     return
    }

    // ✅ Use `req.user.id`, not `userId`
    const admin = await User.findById(req.user.id).select("-password"); // Exclude password

    if (!admin) {
     res.status(404).json({ message: "Admin not found" });
     return
    }

    if (!admin || admin.role !== "admin") {
      res.status(403).json({ message: "Access Denied! Admins only." });
      return;
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin data", error });
  }
}

// Get all users (vendors & customers)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().populate("products.productId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// Approve or suspend a vendor
export const approveVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId, status } = req.body; // Status should be true or false

    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== "vendor") {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    vendor.isApproved = status;
    await vendor.save();

    res.json({ message: `Vendor ${status ? "approved" : "rejected"} successfully.` });
  } catch (error) {
    res.status(500).json({ message: "Error updating vendor status", error });
  }
};

