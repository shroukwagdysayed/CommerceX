import express from 'express';
import { getProducts, getProductById } from '../controllers/productController';

const router = express.Router();

// Route mappings
router.get('/', getProducts);
router.get('/:id', getProductById);

export default router;
