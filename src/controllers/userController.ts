import { Request, Response } from "express";
import User from "../models/userModel";
import Order from "../models/orderModel";
import { AuthRequest } from "../middleware/authMiddleware";

// ✅ Get all vendors
export const getVendors = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendors = await User.find({ role: "vendor" });
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving vendors", error });
  }
};

// ✅ Get all customers
export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await User.find({ role: "customer" });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving customers", error });
  }
};

// ✅ Get a single user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user", error });
  }
};

// ✅ Update a user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

// ✅ Delete a user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// ✅ Get logged-in user profile
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};

// ✅ Update logged-in user profile
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password; // Password hashing should be handled in the model

    await user.save();
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};
