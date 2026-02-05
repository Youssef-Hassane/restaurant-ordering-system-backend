import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { Order, ApiResponse } from '../../types/index.js';
import { validateUpdateOrderRequest } from '../../utils/validators/orderValidators.js';

export const updateOrder = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Order>>, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const updates = validateUpdateOrderRequest(req.body);

    const { data: existing, error: existError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .single();

    if (existError || !existing) {
      throw new AppError('Order not found', 404);
    }

    if (['completed', 'cancelled'].includes(existing.status)) {
      throw new AppError(`Cannot update a ${existing.status} order`, 400);
    }

    const { data, error } = await supabase
      .from('orders')
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
      message: 'Order updated successfully',
      data
    });
  }
);