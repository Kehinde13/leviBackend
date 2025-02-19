import { Request, Response } from "express";
import User from "../models/userModel";
import Order from "../models/orderModel";
import Product from "../models/productModel";

// ✅ Get the logged-in admin's data
export const getAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const {userId} = req.body

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const admin = await User.findById(userId).select("-password"); // Exclude password
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
export const manageVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId } = req.params;
    const { status } = req.body;

    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== "vendor") {
      res.status(404).json({ message: "Vendor not found" });
      return 
    }

    vendor.status = status; // "approved" or "suspended"
    await vendor.save();
    res.json({ message: `Vendor ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error managing vendor", error });
  }
};
