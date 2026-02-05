import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { Product, ApiResponse } from '../../types/index.js';
import { validateUpdateProduct } from '../../utils/validators/productValidators.js';

export const patchProduct = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Product>>, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const updates = validateUpdateProduct(req.body);

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
        ...updates,
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