import { Request, Response } from 'express';
import Order from '../models/orderModel';
import { v4 as uuidv4 } from 'uuid';

// Create an order (guest checkout only)
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { products, totalAmount, guest, trackingNumber } = req.body;

        // Validate guest checkout
        if (!guest || !guest.name || !guest.email || !guest.address) {
            res.status(400).json({ message: "Guest must provide name, email, and address." });
            return;
        }

        // Ensure tracking number is always present (generate if missing)
        const newTrackingNumber = trackingNumber || uuidv4();

        const newOrder = new Order({
            guest,
            products,
            totalAmount,
            status: 'Pending',
            trackingNumber: newTrackingNumber
        });

        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully!", order: newOrder });
    } catch (error) {
        res.status(500).json({ message: "Error processing order", error });
    }
};
