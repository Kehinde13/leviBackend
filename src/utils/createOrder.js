"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/createOrder.ts
const mongoose_1 = __importDefault(require("mongoose"));
const orderModel_1 = __importDefault(require("../models/orderModel"));
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
// MongoDB connection
mongoose_1.default.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected for Order Creation'))
    .catch(err => console.log(err));
const sendWhatsAppNotification = (guest, products, trackingNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const vendorNumber = process.env.VENDOR_WHATSAPP_NUMBER || "+1234567890"; // Replace with actual vendor number
    let productDetails = products.map(p => `Product ID: ${p.productId}, Quantity: ${p.quantity}`).join('\n');
    const message = `New Order Received!\nGuest: ${guest.name}\nTracking Number: ${trackingNumber}\nProducts:\n${productDetails}`;
    try {
        yield axios_1.default.post("https://api.whatsapp.com/send", {
            phone: vendorNumber,
            text: message
        });
        console.log("WhatsApp notification sent to vendor");
    }
    catch (error) {
        console.error("Failed to send WhatsApp message", error);
    }
});
const createNewOrder = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = "65b123abcd123456789"; // Replace with actual product ID from database
        const trackingNumber = (0, uuid_1.v4)(); // Ensure tracking number is always generated
        const newOrder = new orderModel_1.default({
            guest: {
                name: 'Jane Doe',
                email: 'janedoe@example.com',
                address: '456 Sample Street, Sample City'
            },
            products: [
                {
                    productId: new mongoose_1.default.Types.ObjectId(productId), // Use actual product ID
                    quantity: 3
                }
            ],
            totalAmount: 452.97, // Assuming the price per unit is 150.99 * 3
            status: 'Pending',
            trackingNumber // Ensure tracking number is passed
        });
        yield newOrder.save();
        console.log('New Order Created:', newOrder);
        // Send WhatsApp notification to vendor
        yield sendWhatsAppNotification(newOrder.guest, newOrder.products, newOrder.trackingNumber);
        mongoose_1.default.connection.close();
    }
    catch (error) {
        console.error('Error creating order:', error);
        mongoose_1.default.connection.close();
    }
});
createNewOrder();
