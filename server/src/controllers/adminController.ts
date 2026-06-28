import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Order from '../models/Order';
import User from '../models/User';

// ==========================================
// ADMIN PRODUCT CRUD
// ==========================================

// @desc    Get all products (Admin version)
// @route   GET /api/admin/products
// @access  Private/Admin
export const adminGetProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private/Admin
export const adminCreateProduct = async (req: Request, res: Response): Promise<void> => {
  const { title, description, price, category, brand, stock, images } = req.body;

  // Validation
  if (!title || !title.trim()) {
    res.status(400).json({ success: false, message: 'Product title is required' });
    return;
  }
  if (!description || !description.trim()) {
    res.status(400).json({ success: false, message: 'Product description is required' });
    return;
  }
  if (!category || !category.trim()) {
    res.status(400).json({ success: false, message: 'Product category is required' });
    return;
  }
  if (!brand || !brand.trim()) {
    res.status(400).json({ success: false, message: 'Product brand is required' });
    return;
  }

  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    res.status(400).json({ success: false, message: 'Price must be greater than zero' });
    return;
  }

  const numStock = Number(stock);
  if (isNaN(numStock) || numStock < 0) {
    res.status(400).json({ success: false, message: 'Stock must be a non-negative number' });
    return;
  }

  try {
    const product = new Product({
      title: title.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      brand: brand.trim(),
      stock: numStock,
      images: Array.isArray(images) ? images : [],
      rating: 0, // Initial rating for newly created products
    });

    const createdProduct = await product.save();
    res.status(201).json({
      success: true,
      data: createdProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const adminUpdateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, price, category, brand, stock, images } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid product ID format' });
    return;
  }

  // Optional validations if fields are provided
  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      res.status(400).json({ success: false, message: 'Price must be greater than zero' });
      return;
    }
  }

  if (stock !== undefined) {
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      res.status(400).json({ success: false, message: 'Stock must be a non-negative number' });
      return;
    }
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    product.title = title !== undefined ? title.trim() : product.title;
    product.description = description !== undefined ? description.trim() : product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.category = category !== undefined ? category.trim() : product.category;
    product.brand = brand !== undefined ? brand.trim() : product.brand;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.images = images !== undefined ? (Array.isArray(images) ? images : []) : product.images;

    const updatedProduct = await product.save();
    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const adminDeleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid product ID format' });
    return;
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    await Product.deleteOne({ _id: id });
    res.status(200).json({
      success: true,
      message: 'Product removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};

// ==========================================
// ADMIN ORDER MANAGEMENT
// ==========================================

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const adminGetOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({})
      .populate({ path: 'user', select: 'name email', model: 'User' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const adminUpdateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid order ID format' });
    return;
  }

  const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  if (!allowedStatuses.includes(status)) {
    res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
    });
    return;
  }

  try {
    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    order.status = status;
    
    // Automatically set payment status to paid if delivered as a business logic fallback (or keep separate)
    if (status === 'Delivered') {
      order.isPaid = true;
      order.paidAt = new Date();
    }

    const updatedOrder = await order.save();
    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};

// ==========================================
// ADMIN USER MANAGEMENT
// ==========================================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const adminGetUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const adminUpdateUserRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid user ID format' });
    return;
  }

  if (role !== 'user' && role !== 'admin') {
    res.status(400).json({ success: false, message: 'Role must be user or admin' });
    return;
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.role = role;
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};
