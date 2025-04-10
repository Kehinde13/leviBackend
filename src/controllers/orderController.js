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
exports.getVendorOrders = exports.getUserOrders = exports.confirmOrder = exports.createOrder = void 0;
const orderModel_1 = __importDefault(require("../models/orderModel"));
const uuid_1 = require("uuid");
const productModel_1 = __importDefault(require("../models/productModel")); // Needed to match vendor's products
// Create Order
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { products, totalAmount, guest, trackingNumber, user } = req.body;
        if (!user && (!guest || !guest.name || !guest.email || !guest.address)) {
            res.status(400).json({ message: "Guest must provide name, email, and address." });
            return;
        }
        const newTrackingNumber = trackingNumber || (0, uuid_1.v4)();
        const orderData = {
            products,
            totalAmount,
            status: 'Pending',
            trackingNumber: newTrackingNumber,
        };
        if (user)
            orderData.user = user;
        else
            orderData.guest = guest;
        const newOrder = new orderModel_1.default(orderData);
        yield newOrder.save();
        res.status(201).json({ message: "Order placed successfully!", order: newOrder });
    }
    catch (error) {
        console.error("Backend error:", error);
        res.status(500).json({ message: "Error processing order", error });
    }
});
exports.createOrder = createOrder;
// Confirm Order
const confirmOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield orderModel_1.default.findById(req.params.id);
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        order.status = "Confirmed";
        yield order.save();
        res.status(200).json({ message: "Order confirmed", order });
    }
    catch (error) {
        res.status(500).json({ message: "Error confirming order", error });
    }
});
exports.confirmOrder = confirmOrder;
// Get orders for a specific customer
const getUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use authenticated user info
        if (!req.user || req.user.role !== "customer") {
            res.status(403).json({ message: "Access denied! Only customers can view orders." });
            return;
        }
        const orders = yield orderModel_1.default.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching orders", error });
    }
});
exports.getUserOrders = getUserOrders;
// ✅ Get orders that contain products owned by a specific vendor
const getVendorOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vendorId = req.params.vendorId;
        // Fetch all product IDs created by the vendor
        const vendorProducts = yield productModel_1.default.find({ vendor: vendorId }, '_id');
        const vendorProductIds = vendorProducts.map((product) => product._id);
        // Fetch orders that include at least one of those product IDs
        const orders = yield orderModel_1.default.find({
            'products.productId': { $in: vendorProductIds }
        }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving vendor orders", error });
    }
});
exports.getVendorOrders = getVendorOrders;
