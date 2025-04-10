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
exports.updateUserProfile = exports.getUserProfile = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getCustomers = exports.getVendors = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
// ✅ Get all vendors
const getVendors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vendors = yield userModel_1.default.find({ role: "vendor" });
        res.status(200).json(vendors);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving vendors", error });
    }
});
exports.getVendors = getVendors;
// ✅ Get all customers
const getCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customers = yield userModel_1.default.find({ role: "customer" });
        res.status(200).json(customers);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving customers", error });
    }
});
exports.getCustomers = getCustomers;
// ✅ Get a single user by ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving user", error });
    }
});
exports.getUserById = getUserById;
// ✅ Update a user
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
});
exports.updateUser = updateUser;
// ✅ Delete a user
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedUser = yield userModel_1.default.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
});
exports.deleteUser = deleteUser;
// ✅ Get logged-in user profile
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.params.id).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching user profile", error });
    }
});
exports.getUserProfile = getUserProfile;
// ✅ Update logged-in user profile
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password)
            user.password = req.body.password; // Password hashing should be handled in the model
        yield user.save();
        res.json({ message: "Profile updated successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
});
exports.updateUserProfile = updateUserProfile;
