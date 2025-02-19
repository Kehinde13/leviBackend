// src/utils/createOrder.ts
import mongoose from 'mongoose';
import Order from '../models/orderModel';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected for Order Creation'))
  .catch(err => console.log(err));

const sendWhatsAppNotification = async (guest: any, products: any[], trackingNumber: string) => {
    const vendorNumber = process.env.VENDOR_WHATSAPP_NUMBER || "+1234567890"; // Replace with actual vendor number
    let productDetails = products.map(p => `Product ID: ${p.productId}, Quantity: ${p.quantity}`).join('\n');
    const message = `New Order Received!\nGuest: ${guest.name}\nTracking Number: ${trackingNumber}\nProducts:\n${productDetails}`;

    try {
        await axios.post("https://api.whatsapp.com/send", {
            phone: vendorNumber,
            text: message
        });
        console.log("WhatsApp notification sent to vendor");
    } catch (error) {
        console.error("Failed to send WhatsApp message", error);
    }
};

const createNewOrder = async () => {
    try {
        const productId = "65b123abcd123456789"; // Replace with actual product ID from database

        const trackingNumber = uuidv4(); // Ensure tracking number is always generated

        const newOrder = new Order({
            guest: {
                name: 'Jane Doe',
                email: 'janedoe@example.com',
                address: '456 Sample Street, Sample City'
            },
            products: [
                {
                    productId: new mongoose.Types.ObjectId(productId), // Use actual product ID
                    quantity: 3
                }
            ],
            totalAmount: 452.97, // Assuming the price per unit is 150.99 * 3
            status: 'Pending',
            trackingNumber // Ensure tracking number is passed
        });

        await newOrder.save();
        console.log('New Order Created:', newOrder);

        // Send WhatsApp notification to vendor
        await sendWhatsAppNotification(newOrder.guest, newOrder.products, newOrder.trackingNumber);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error creating order:', error);
        mongoose.connection.close();
    }
};

createNewOrder();
