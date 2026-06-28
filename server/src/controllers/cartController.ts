import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';
import Cart from '../models/Cart';
import Product from '../models/Product';

/**
 * Helper to fetch a cart populated with Product references.
 */
const getPopulatedCart = async (userId: string) => {
  return await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    model: 'Product',
  });
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({ success: false, message: 'Invalid product ID format' });
    return;
  }

  const qtyNum = Number(quantity);
  if (isNaN(qtyNum) || qtyNum <= 0) {
    res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
    return;
  }

  try {
    // Validate product existence
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Find cart or create if it doesn't exist
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: qtyNum }],
      });
    } else {
      // Check if product already exists in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += qtyNum;
      } else {
        cart.items.push({ product: new mongoose.Types.ObjectId(productId), quantity: qtyNum });
      }
    }

    await cart.save();

    // Return the updated populated cart
    const populatedCart = await getPopulatedCart(userId);
    res.status(200).json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    let cart = await getPopulatedCart(userId);

    // If no cart exists, initialize one automatically to guarantee structure consistency
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
      cart = await getPopulatedCart(userId);
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItemQuantity = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({ success: false, message: 'Invalid product ID format' });
    return;
  }

  const qtyNum = Number(quantity);
  if (isNaN(qtyNum) || qtyNum <= 0) {
    res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
    return;
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      res.status(404).json({ success: false, message: 'Product not found in cart' });
      return;
    }

    cart.items[itemIndex].quantity = qtyNum;
    await cart.save();

    const populatedCart = await getPopulatedCart(userId);
    res.status(200).json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({ success: false, message: 'Invalid product ID format' });
    return;
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await getPopulatedCart(userId);
    res.status(200).json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    } else {
      cart.items = [];
    }

    await cart.save();

    const populatedCart = await getPopulatedCart(userId);
    res.status(200).json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: (error as Error).message,
    });
  }
};
