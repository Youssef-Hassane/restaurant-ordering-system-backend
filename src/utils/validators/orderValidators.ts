import { AppError } from '../../middleware/errorHandler.js';
import { CreateOrderRequest, UpdateOrderRequest } from '../../types/index.js';

export const validateCreateOrderRequest = (body: unknown): CreateOrderRequest => {
  const data = body as CreateOrderRequest;

  if (!data.customer_name || typeof data.customer_name !== 'string' || !data.customer_name.trim()) {
    throw new AppError('Customer name is required', 400);
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw new AppError('At least one item is required', 400);
  }

  for (const item of data.items) {
    if (!item.product_id || typeof item.product_id !== 'string') {
      throw new AppError('Each item must have a valid product_id', 400);
    }
    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
      throw new AppError('Each item must have a quantity of at least 1', 400);
    }
  }

  if (data.customer_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customer_email)) {
      throw new AppError('Invalid email format', 400);
    }
  }

  if (data.customer_phone) {
    const phoneRegex = /^[\d\s\-+()]{7,20}$/;
    if (!phoneRegex.test(data.customer_phone)) {
      throw new AppError('Invalid phone number format', 400);
    }
  }

  return data;
};

export const validateUpdateOrderRequest = (body: unknown): UpdateOrderRequest => {
  const data = body as UpdateOrderRequest;
  const updates: UpdateOrderRequest = {};

  if (data.customer_name !== undefined) {
    if (typeof data.customer_name !== 'string' || !data.customer_name.trim()) {
      throw new AppError('Customer name cannot be empty', 400);
    }
    updates.customer_name = data.customer_name.trim();
  }

  if (data.customer_email !== undefined) {
    if (data.customer_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.customer_email)) {
        throw new AppError('Invalid email format', 400);
      }
      updates.customer_email = data.customer_email;
    } else {
      updates.customer_email = null;
    }
  }

  if (data.customer_phone !== undefined) {
    if (data.customer_phone) {
      const phoneRegex = /^[\d\s\-+()]{7,20}$/;
      if (!phoneRegex.test(data.customer_phone)) {
        throw new AppError('Invalid phone number format', 400);
      }
      updates.customer_phone = data.customer_phone;
    } else {
      updates.customer_phone = null;
    }
  }

  if (data.notes !== undefined) {
    updates.notes = data.notes?.trim() || null;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('At least one field must be provided for update', 400);
  }

  return updates;
};