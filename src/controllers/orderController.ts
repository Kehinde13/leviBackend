import { Request, Response } from 'express';
import { AuthRequest } from "../middleware/authMiddleware";
import Order from '../models/orderModel';
import { v4 as uuidv4 } from 'uuid';
import Product from '../models/productModel'; // Needed to match vendor's products

// Create Order
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { products, totalAmount, guest, trackingNumber, user } = req.body;

    if (!user && (!guest || !guest.name || !guest.email || !guest.address)) {
      res.status(400).json({ message: "Guest must provide name, email, and address." });
      return;
    }

    const newTrackingNumber = trackingNumber || uuidv4();

    const orderData: any = {
      products,
      totalAmount,
      status: 'Pending',
      trackingNumber: newTrackingNumber,
    };

    if (user) orderData.user = user;
    else orderData.guest = guest;

    const newOrder = new Order(orderData);
    await newOrder.save();

    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ message: "Error processing order", error });
  }
};

// Confirm Order
export const confirmOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    order.status = "Confirmed";
    await order.save();

    res.status(200).json({ message: "Order confirmed", order });
  } catch (error) {
    res.status(500).json({ message: "Error confirming order", error });
  }
};

// Get orders for a specific customer
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Use authenticated user info
    if (!req.user || req.user.role !== "customer") {
      res.status(403).json({ message: "Access denied! Only customers can view orders." });
      return;
    }

    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};


// ✅ Get orders that contain products owned by a specific vendor
export const getVendorOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vendorId = req.params.vendorId;

    // Fetch all product IDs created by the vendor
    const vendorProducts = await Product.find({ vendor: vendorId }, '_id');
    const vendorProductIds = vendorProducts.map((product) => product._id);

    // Fetch orders that include at least one of those product IDs
    const orders = await Order.find({
      'products.productId': { $in: vendorProductIds }
    }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving vendor orders", error });
  }
};
