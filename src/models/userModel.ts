// src/models/userModel.ts
import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
    VENDOR = 'vendor'
}

interface ICartItem {
    productId: mongoose.Schema.Types.ObjectId;
    quantity: number;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isApproved?: string;
    cart: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 }
});

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: Object.values(UserRole), required: true},
    isApproved: { type: Boolean, default: false },
    cart: [CartItemSchema],
}, {
    timestamps: true,
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
