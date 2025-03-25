
import mongoose, { Document, Schema } from 'mongoose';

interface IOrder extends Document {
  user?: mongoose.Schema.Types.ObjectId;
  guest?: {
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

const OrderSchema = new Schema<IOrder>(
  {
    // ✅ Optional reference to logged-in user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    // ✅ Guest info (conditionally required if `user` is not present)
    guest: {
      name: {
        type: String,
        required: function () {
          return !this.user;
        },
      },
      email: {
        type: String,
        required: function () {
          return !this.user;
        },
      },
      address: {
        type: String,
        required: function () {
          return !this.user;
        },
      },
    },

    // ✅ Products in the order
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    trackingNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
