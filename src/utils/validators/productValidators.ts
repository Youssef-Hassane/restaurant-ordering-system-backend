import { AppError } from '../../middleware/errorHandler.js';
import { 
  CreateProductRequest, 
  UpdateProductRequest, 
  VALID_CURRENCIES, 
  isValidCurrency,
  DEFAULT_CURRENCY 
} from '../../types/index.js';

export const validateCreateProduct = (body: unknown): CreateProductRequest => {
  const data = body as CreateProductRequest;

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    throw new AppError('Product name is required', 400);
  }

  if (data.price === undefined || typeof data.price !== 'number' || data.price < 0) {
    throw new AppError('Valid price is required (must be >= 0)', 400);
  }

  if (!data.category || typeof data.category !== 'string' || !data.category.trim()) {
    throw new AppError('Category is required', 400);
  }

  if (data.currency && !isValidCurrency(data.currency)) {
    throw new AppError(`Invalid currency. Must be one of: ${VALID_CURRENCIES.join(', ')}`, 400);
  }

  return {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    price: data.price,
    currency: data.currency || DEFAULT_CURRENCY,
    image_url: data.image_url?.trim() || null,
    category: data.category.trim(),
    available: data.available !== undefined ? data.available : true
  };
};

export const validateUpdateProduct = (body: unknown): UpdateProductRequest => {
  const data = body as UpdateProductRequest;
  const updates: UpdateProductRequest = {};

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || !data.name.trim()) {
      throw new AppError('Product name cannot be empty', 400);
    }
    updates.name = data.name.trim();
  }

  if (data.price !== undefined) {
    if (typeof data.price !== 'number' || data.price < 0) {
      throw new AppError('Price must be a valid number >= 0', 400);
    }
    updates.price = data.price;
  }

  if (data.currency !== undefined) {
    if (!isValidCurrency(data.currency)) {
      throw new AppError(`Invalid currency. Must be one of: ${VALID_CURRENCIES.join(', ')}`, 400);
    }
    updates.currency = data.currency;
  }

  if (data.category !== undefined) {
    if (typeof data.category !== 'string' || !data.category.trim()) {
      throw new AppError('Category cannot be empty', 400);
    }
    updates.category = data.category.trim();
  }

  if (data.description !== undefined) {
    updates.description = data.description?.trim() || null;
  }

  if (data.image_url !== undefined) {
    updates.image_url = data.image_url?.trim() || null;
  }

  if (data.available !== undefined) {
    if (typeof data.available !== 'boolean') {
      throw new AppError('Available must be a boolean', 400);
    }
    updates.available = data.available;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('At least one field must be provided for update', 400);
  }

  return updates;
};