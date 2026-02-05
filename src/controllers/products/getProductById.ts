import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { Product, ApiResponse } from '../../types/index.js';

export const getProductById = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Product>>, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      data
    });
  }
);