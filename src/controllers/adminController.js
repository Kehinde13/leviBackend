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
exports.approveVendor = exports.getAllProducts = exports.getAllOrders = exports.getAllUsers = exports.getAdminProfile = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const orderModel_1 = __importDefault(require("../models/orderModel"));
const productModel_1 = __importDefault(require("../models/productModel"));
// ✅ Get the logged-in admin's data
const getAdminProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ✅ Check if user is attached to request (from `protect` middleware)
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // ✅ Use `req.user.id`, not `userId`
        const admin = yield userModel_1.default.findById(req.user.id).select("-password"); // Exclude password
        if (!admin) {
            res.status(404).json({ message: "Admin not found" });
            return;
        }
        if (!admin || admin.role !== "admin") {
            res.status(403).json({ message: "Access Denied! Admins only." });
            return;
        }
        res.json(admin);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching admin data", error });
    }
});
exports.getAdminProfile = getAdminProfile;
// Get all users (vendors & customers)
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_1.default.find();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
});
exports.getAllUsers = getAllUsers;
// Get all orders
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield orderModel_1.default.find().populate("products.productId");
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching orders", error });
    }
});
exports.getAllOrders = getAllOrders;
// Get all products
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield productModel_1.default.find();
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching products", error });
    }
});
exports.getAllProducts = getAllProducts;
// Approve or suspend a vendor
const approveVendor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body; // Extract status from the request body
        const { vendorId } = req.params; // Extract vendorId from URL params
        // Ensure vendor role filtering
        const vendor = yield userModel_1.default.findOne({ _id: vendorId, role: "vendor" });
        if (!vendor) {
            res.status(404).json({ message: "Vendor not found" });
            return;
        }
        vendor.isApproved = status;
        yield vendor.save();
        res.json({ message: `Vendor ${status ? "approved" : "rejected"} successfully.` });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating vendor status", error });
    }
});
exports.approveVendor = approveVendor;
