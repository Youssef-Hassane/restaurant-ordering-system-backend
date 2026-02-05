import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  addOrderItem,
  updateOrderItem,
  removeOrderItem,
  getOrderStatuses
} from '../../controllers/orders/index.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router: Router = Router();

// All order routes require authentication
router.use(authenticate);

// GET /api/orders/statuses
router.get('/statuses', getOrderStatuses);

// Orders CRUD
router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);  // Can search by order_number or id
router.put('/:id', updateOrder);
router.patch('/:id', updateOrder);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', authorize('admin', 'manager'), deleteOrder);

// Order items
router.post('/:id/items', addOrderItem);
router.patch('/:id/items/:itemId', updateOrderItem);
router.delete('/:id/items/:itemId', removeOrderItem);

export default router;