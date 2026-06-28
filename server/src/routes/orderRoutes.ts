import express from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Apply auth protection to all order endpoints
router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

export default router;
