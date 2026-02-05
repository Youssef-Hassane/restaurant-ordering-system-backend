import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { Product, ApiResponse, DEFAULT_CURRENCY } from '../../types/index.js';
import { validateCreateProduct } from '../../utils/validators/productValidators.js';

export const updateProduct = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Product>>, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const productData = validateCreateProduct(req.body);

    const { data: existing, error: existError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (existError || !existing) {
      throw new AppError('Product not found', 404);
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        description: productData.description || null,
        price: productData.price,
        currency: productData.currency || DEFAULT_CURRENCY,
        image_url: productData.image_url || null,
        category: productData.category,
        available: productData.available ?? true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data
    });
  }
);