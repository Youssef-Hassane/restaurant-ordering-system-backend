import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { Order, ApiResponse, UpdateOrderStatusRequest, VALID_ORDER_STATUSES, isValidOrderStatus } from '../../types/index.js';

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Order>>, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body as UpdateOrderStatusRequest;

    if (!status || !isValidOrderStatus(status)) {
      throw new AppError(`Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`, 400);
    }

    const { data: existing, error: existError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .single();

    if (existError || !existing) {
      throw new AppError('Order not found', 404);
    }

    if (existing.status === 'completed' && status !== 'completed') {
      throw new AppError('Cannot change status of a completed order', 400);
    }

    if (existing.status === 'cancelled' && status !== 'cancelled') {
      throw new AppError('Cannot change status of a cancelled order', 400);
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new AppError('Failed to update order status', 400);
    }

    res.json({
      success: true,
      message: `Order status updated to "${status}"`,
      data
    });
  }
);
