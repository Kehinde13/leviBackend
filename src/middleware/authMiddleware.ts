import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import type { IUser } from "../models/userModel";

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

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.user = await User.findById(decoded.id).select("-password"); // Exclude password
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
};

// ✅ Restrict Access to Specific Roles
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
       res.status(403).json({ message: "Access Denied" });
       return;
    }
    next();
  };
};
