// src/models/orderModel.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IOrder extends Document {
    guest: {
        name: string;
        email: string;
        address: string;
    };
    products: { productId: mongoose.Schema.Types.ObjectId; quantity: number }[];
    totalAmount: number;
    status: string;
    trackingNumber: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
    guest: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true }
    },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    trackingNumber: { type: String, required: true, unique: true },
}, { timestamps: true });

const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
