"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.logoutUser = exports.blacklistedTokens = exports.refreshToken = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importStar(require("../models/userModel"));
const JWT_SECRET = process.env.JWT_SECRET;
//max token age
const maxAge = 3 * 24 * 60 * 60;
// Register User
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = new userModel_1.default({
            name,
            email,
            password: hashedPassword,
            role: role || userModel_1.UserRole.CUSTOMER, // Default role is "customer"
            status: role === userModel_1.UserRole.VENDOR ? "pending" : "approved", // Vendors require admin approval
        });
        yield newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    }
    catch (error) {
        res.status(500).json({ message: "Registration failed", error });
    }
});
exports.registerUser = registerUser;
// Login User
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        // ✅ If vendor is not approved, prevent login
        if (user.role === "vendor" && !user.isApproved) {
            res.status(403).json({ message: "Your account is pending approval by the admin." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: maxAge });
        res.json({ token, user: { id: user._id, name: user.name, role: user.role, isApproved: user.isApproved } });
    }
    catch (error) {
        res.status(500).json({ message: "Login failed", error });
    }
});
exports.loginUser = loginUser;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(401).json({ message: "No Refresh Token Provided" });
            return;
        }
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
            if (err)
                return res.status(403).json({ message: "Invalid Refresh Token" });
            const newAccessToken = jsonwebtoken_1.default.sign({ id: decoded.id, role: decoded.role }, JWT_SECRET, { expiresIn: "15m" }); // 🔥 Refresh access token
            res.json({ accessToken: newAccessToken });
        });
    }
    catch (error) {
        res.status(500).json({ message: "Token refresh failed", error });
    }
});
exports.refreshToken = refreshToken;
// ✅ Temporary storage for invalid tokens (use Redis in production)
exports.blacklistedTokens = new Set();
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "No token provided" });
            return;
        }
        // ✅ Blacklist the token to prevent reuse
        exports.blacklistedTokens.add(token);
        res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Logout failed", error });
    }
});
exports.logoutUser = logoutUser;
