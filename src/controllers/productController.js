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
exports.getVendorProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const productModel_1 = __importDefault(require("../models/productModel"));
// ✅ Get all products (with pagination)
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10 } = req.query;
        const products = yield productModel_1.default.find()
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const totalProducts = yield productModel_1.default.countDocuments();
        res.status(200).json({
            totalProducts,
            totalPages: Math.ceil(totalProducts / Number(limit)),
            currentPage: Number(page),
            products,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving products', error });
    }
});
exports.getProducts = getProducts;
// ✅ Get a single product by ID
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield productModel_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(200).json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving product', error });
    }
});
exports.getProductById = getProductById;
// ✅ Create a new product (Only approved vendors can create)
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || req.user.role !== 'vendor' || !req.user.isApproved) {
            res.status(403).json({ message: 'Access denied! Only approved vendors can add products.' });
            return;
        }
        const { name, description, price, stock, image, category } = req.body;
        const newProduct = new productModel_1.default({
            name,
            description,
            price,
            stock,
            category,
            image,
            vendor: req.user.id, // ✅ Assign product to vendor
        });
        yield newProduct.save();
        res.status(201).json({ message: 'Product added successfully!', product: newProduct });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
});
exports.createProduct = createProduct;
// ✅ Update a product 
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ✅ Ensure the logged-in vendor is allowed to update
        if (!req.user || req.user.role !== 'vendor' || !req.user.isApproved) {
            res.status(403).json({ message: 'Access denied! Only approved vendors can update products.' });
            return;
        }
        const product = yield productModel_1.default.findById(req.params.id);
        // ✅ Check if the product exists before accessing `vendor`
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // ✅ Ensure `vendor` exists before calling `.toString()`
        if (!product.vendor) {
            res.status(400).json({ message: "Product is missing a vendor field." });
            return;
        }
        // ✅ Handle image upload (if provided)
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : product.image; // ✅ Update image only if a new one is provided
        const { name, description, price, stock, category } = req.body;
        const updatedProduct = yield productModel_1.default.findByIdAndUpdate(req.params.id, {
            name,
            description,
            price,
            stock,
            category,
            image: imageUrl
        }, // ✅ Update only provided fields
        { new: true, runValidators: true });
        if (!updatedProduct) {
            res.status(500).json({ message: "Product update failed. Please try again." });
            return;
        }
        res.status(200).json({ message: "Product updated successfully!", product: updatedProduct });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
});
exports.updateProduct = updateProduct;
// ✅ Delete a product (Only the vendor who created it or admin can delete)
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield productModel_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        // ✅ Ensure only the vendor who created the product or an admin can delete it
        if (!req.user || req.user.role !== 'admin' && product.vendor.toString() !== req.user.id) {
            res.status(403).json({ message: 'Access denied! You can only delete your own products.' });
            return;
        }
        yield productModel_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
});
exports.deleteProduct = deleteProduct;
// ✅ Get products of the logged-in vendor
const getVendorProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || req.user.role !== 'vendor') {
            res.status(403).json({ message: 'Access denied! Only vendors can view their products.' });
            return;
        }
        const { page = 1, limit = 10 } = req.query;
        const vendorProducts = yield productModel_1.default.find({ vendor: req.user.id })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const totalProducts = yield productModel_1.default.countDocuments({ vendor: req.user.id });
        res.status(200).json({
            totalProducts,
            totalPages: Math.ceil(totalProducts / Number(limit)),
            currentPage: Number(page),
            products: vendorProducts,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving vendor products', error });
    }
});
exports.getVendorProducts = getVendorProducts;
