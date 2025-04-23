import { Request, Response, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { UserRole } from "../models/userModel";
import crypto from 'crypto';
import { sendResetEmail } from '../utils/mailer';
 
const JWT_SECRET = process.env.JWT_SECRET as string;
//max token age
const maxAge = 3 * 24 * 60 * 60;

// Register User
export const registerUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || UserRole.CUSTOMER, // Default role is "customer"
      status: role === UserRole.VENDOR ? "pending" : "approved", // Vendors require admin approval
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

// Login User
export const loginUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return
    }  

    // ✅ If vendor is not approved, prevent login
    if (user.role === "vendor" && !user.isApproved) {
      res.status(403).json({ message: "Your account is pending approval by the admin." });
      return;
    }

    const token = jwt.sign({ id: user._id, role: user.role}, JWT_SECRET, { expiresIn: maxAge });

    res.json({ token, user: { id: user._id, name: user.name, role: user.role, isApproved: user.isApproved } });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.resetToken = token;
  user.resetTokenExpires = expires;
  await user.save();

  const resetLink = `http://localhost:5173/reset-password/${token}`;
  await sendResetEmail(user.email, resetLink);

  res.json({ message: 'Password reset link sent' });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpires: { $gt: new Date() }
  });

  if (!user) {
    res.status(400).json({ message: 'Invalid or expired token' });
    return;
  } 

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
};


export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body; 
    if (!token) {
       res.status(401).json({ message: "No Refresh Token Provided" });
       return
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return res.status(403).json({ message: "Invalid Refresh Token" });

      const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, JWT_SECRET, { expiresIn: "15m" }); // 🔥 Refresh access token
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Token refresh failed", error });
  }
};

// ✅ Temporary storage for invalid tokens (use Redis in production)
export const blacklistedTokens = new Set<string>();

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    // ✅ Blacklist the token to prevent reuse
    blacklistedTokens.add(token);

    res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error });
  }
};

