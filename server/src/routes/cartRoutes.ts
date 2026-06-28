import express from 'express';
import {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart
} from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All cart routes require user authentication
router.use(protect);

router.post('/add', addToCart);
router.get('/', getCart);
router.put('/:productId', updateCartItemQuantity);
router.delete('/:productId', removeCartItem);
router.delete('/', clearCart);

export default router;
