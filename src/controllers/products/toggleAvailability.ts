import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { Product, ApiResponse } from '../../types/index.js';

export const toggleAvailability = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Product>>, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { available } = req.body;

    if (typeof available !== 'boolean') {
      throw new AppError('Available must be a boolean value', 400);
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        available,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      message: `Product is now ${available ? 'available' : 'unavailable'}`,
      data
    });
  }
);