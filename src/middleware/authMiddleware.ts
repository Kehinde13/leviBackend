import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import type { IUser } from "../models/userModel";
import { blacklistedTokens } from "../controllers/authController";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Extend Request type to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

// ✅ Protect Route (Require Authentication)
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized - No Token" });
    return
  }

   // ✅ Check if token is blacklisted
   if (blacklistedTokens.has(token)) {
    res.status(401).json({ message: "Session expired. Please log in again." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.user = await User.findById(decoded.id).select("-password"); // Exclude password
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
};

// ✅ Authorize Roles

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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



