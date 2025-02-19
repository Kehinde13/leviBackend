// src/models/productModel.ts
import mongoose, { Document, Schema } from 'mongoose';


interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    image: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    image: { type: String, required: false } // Optional image field
}, {
    timestamps: true,
});

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
