import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shippingAddress } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
    res.status(400).json({ success: false, message: 'Please provide all shipping address details' });
    return;
  }

  try {
    // Find user's cart and populate the product details
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      model: 'Product',
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: 'Your cart is empty' });
      return;
    }

    // Verify product availability and mapping
    const orderItems: any[] = [];
    let itemsPrice = 0;

    for (const item of cart.items) {
      const product = item.product as any;
      
      if (!product) {
        res.status(404).json({ success: false, message: 'One or more products in your cart no longer exist' });
        return;
      }

      const imageUrl = product.images && product.images.length > 0
        ? product.images[0]
        : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

      orderItems.push({
        product: product._id,
        name: product.title,
        image: imageUrl,
        price: product.price,
        quantity: item.quantity,
      });

      itemsPrice += product.price * item.quantity;
    }

    // Calculation formulas
    const shippingPrice = itemsPrice > 300 ? 0 : 15;
    const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    const order = new Order({
      user: userId,
      orderItems,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Clear cart automatically
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      data: createdOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
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

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid order ID format' });
    return;
  }

  try {
    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Authorization: User can only view their own orders (admins could view all, but role check is optional based on template scope)
    if (order.user.toString() !== userId.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden. This order is not yours.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};
