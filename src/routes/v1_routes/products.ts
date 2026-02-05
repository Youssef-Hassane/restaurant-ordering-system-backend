import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  getCategories,
  getCurrencies,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
  toggleAvailability
} from '../../controllers/products/index.js';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth.js';

const router: Router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/currencies', getCurrencies);
router.get('/:id', getProductById);

// Protected routes (require authentication)
router.post('/', authenticate, authorize('admin', 'manager'), createProduct);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateProduct);
router.patch('/:id', authenticate, authorize('admin', 'manager'), patchProduct);
router.patch('/:id/availability', authenticate, authorize('admin', 'manager'), toggleAvailability);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;