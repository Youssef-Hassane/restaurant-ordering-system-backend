import { Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { Product, ApiResponse, DEFAULT_CURRENCY, AuthenticatedRequest } from '../../types/index.js';
import { validateCreateProduct } from '../../utils/validators/productValidators.js';

export const createProduct = asyncHandler(
  async (req: AuthenticatedRequest, res: Response<ApiResponse<Product>>, next: NextFunction): Promise<void> => {
    const productData = validateCreateProduct(req.body);
    const userId = req.user?.userId || null;

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description || null,
        price: productData.price,
        currency: productData.currency || DEFAULT_CURRENCY,
        image_url: productData.image_url || null,
        category: productData.category,
        available: productData.available ?? true,
        created_by: userId,
        updated_by: userId
      })
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data
    });
  }
);