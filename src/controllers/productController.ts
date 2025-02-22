import { Request, Response } from 'express';
import Product from '../models/productModel';
import { AuthRequest } from '../middleware/authMiddleware';

// ✅ Get all products (with pagination)
export const getProducts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const products = await Product.find()
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const totalProducts = await Product.countDocuments();

        res.status(200).json({
            totalProducts,
            totalPages: Math.ceil(totalProducts / Number(limit)),
            currentPage: Number(page),
            products,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products', error });
    }
};

// ✅ Get a single product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving product', error });
    }
};

// ✅ Create a new product (Only approved vendors can create)
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'vendor' || !req.user.isApproved) {
            res.status(403).json({ message: 'Access denied! Only approved vendors can add products.' });
            return;
        }

        const { name, description, price, stock, category, image } = req.body;

        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            category,
            image,
            vendor: req.user.id, // ✅ Assign product to vendor
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully!', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
};

// ✅ Update a product 
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);

        // ✅ Check if the product exists before accessing `vendor`
        if (!product) {
          res.status(404).json({ message: "Product not found" });
          return;
        }

        // ✅ Ensure `vendor` exists before calling `.toString()`
        if (!product.vendor) {
            res.status(400).json({ message: "Product is missing a vendor field." });
            return;
        }

        // ✅ Ensure the logged-in vendor/admin is allowed to update
        if (!req.user || (req.user.role !== "admin" && product.vendor.toString() !== req.user.id)) {
            res.status(403).json({ message: "Access denied! You can only update your own products." });
            return; 
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true, // ✅ Ensure validation is enforced
            }
        );

        if (!updatedProduct) {
            res.status(500).json({ message: "Product update failed. Please try again." });
            return;
        }

        res.status(200).json({ message: "Product updated successfully!", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
};



// ✅ Delete a product (Only the vendor who created it or admin can delete)
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return; 
        }

        // ✅ Ensure only the vendor who created the product or an admin can delete it
        if (!req.user || req.user.role !== 'admin' && product.vendor.toString() !== req.user.id) {
            res.status(403).json({ message: 'Access denied! You can only delete your own products.' });
            return; 
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
};
