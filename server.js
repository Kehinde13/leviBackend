"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./src/routes/userRoutes"));
const productsRoutes_1 = __importDefault(require("./src/routes/productsRoutes"));
const orderRoutes_1 = __importDefault(require("./src/routes/orderRoutes"));
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const authMiddleware_1 = require("./src/middleware/authMiddleware");
const adminRoutes_1 = __importDefault(require("./src/routes/adminRoutes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const allowedOrigins = ["https://levi-0-0-1.vercel.app"]; // 
const app = (0, express_1.default)();
app.use(express_1.default.json());
// ✅ Fix: Explicitly set CORS headers to allow requests from the frontend
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // ✅ Allow cookies and authorization headers
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Specify allowed headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ Specify allowed methods
}));
// ✅ Fix: Handle preflight requests manually
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://levi-0-0-1.vercel.app"); // ✅ Ensure frontend origin is explicitly allowed
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true"); // ✅ Ensure credentials are allowed
    if (req.method === "OPTIONS") {
        res.status(200).end(); // ✅ Ensure void return type
        return;
    }
    next();
});
const CONNECTION = process.env.CONNECTION; // ✅ MongoDB Connection String
// ✅ Connect to MongoDB only once (outside of handler)
mongoose_1.default
    .connect(CONNECTION)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
// ✅ API Routes
app.use("/api/users", userRoutes_1.default);
app.use("/api/products", productsRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/admin", authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)("admin"), adminRoutes_1.default);
// ✅ Fix: Ensure API responses have CORS headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://levi-0-0-1.vercel.app");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});
// ✅ Serve uploaded files
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
// ✅ Health Check Route
app.get("/", (req, res) => {
    res.send("Server is running successfully! 🚀");
});
// ✅ Export the Express app for Vercel
exports.default = app;
