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
exports.authorizeRoles = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const authController_1 = require("../controllers/authController");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// ✅ Protect Route (Require Authentication)
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Unauthorized - No Token" });
        return;
    }
    // ✅ Check if token is blacklisted
    if (authController_1.blacklistedTokens.has(token)) {
        res.status(401).json({ message: "Session expired. Please log in again." });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = yield userModel_1.default.findById(decoded.id).select("-password"); // Exclude password
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }
});
exports.protect = protect;
// ✅ Authorize Roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // ✅ Ensure `req.user` exists
        if (!req.user) {
            console.error("❌ User not authenticated in authorizeRoles middleware.");
            res.status(401).json({ message: "Unauthorized! Please log in." });
            return;
        }
        // ✅ Ensure user has the correct role
        if (!roles.includes(req.user.role)) {
            console.error(`❌ Access Denied! User role '${req.user.role}' is not authorized.`);
            res.status(403).json({ message: "Access Denied! Insufficient permissions." });
            return;
        }
        // ✅ User has correct role, proceed to next middleware
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
