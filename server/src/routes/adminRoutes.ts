import express from 'express';
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetUsers,
  adminUpdateUserRole,
} from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';
import { admin } from '../middleware/adminMiddleware';

const router = express.Router();

// Apply both JWT authentication and admin verification globally to all routes
router.use(protect);
router.use(admin);

// Products endpoints
router.route('/products')
  .get(adminGetProducts)
  .post(adminCreateProduct);

router.route('/products/:id')
  .put(adminUpdateProduct)
  .delete(adminDeleteProduct);

// Orders endpoints
router.route('/orders')
  .get(adminGetOrders);

router.route('/orders/:id/status')
  .put(adminUpdateOrderStatus);

// Users endpoints
router.route('/users')
  .get(adminGetUsers);

router.route('/users/:id/role')
  .put(adminUpdateUserRole);

export default router;
