import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { ApiResponse } from '../../types/index.js';

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response<ApiResponse<null>>, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const { data: existing, error: existError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', id)
      .single();

    if (existError || !existing) {
      throw new AppError('Product not found', 404);
    }

    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1);

    if (orderError) {
      throw new AppError(orderError.message, 400);
    }

    if (orderItems && orderItems.length > 0) {
      throw new AppError(
        `Cannot delete "${existing.name}" because it has been ordered. Consider marking it as unavailable instead.`,
        400
      );
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.json({
      success: true,
      message: `Product "${existing.name}" deleted successfully`
    });
  }
);