import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { ApiResponse } from '../../types/index.js';

export const deleteOrder = asyncHandler(
  async (req: Request, res: Response<ApiResponse<null>>, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const { data: existing, error: existError } = await supabase
      .from('orders')
      .select('id, status, customer_name')
      .eq('id', id)
      .single();

    if (existError || !existing) {
      throw new AppError('Order not found', 404);
    }

    if (!['pending', 'cancelled'].includes(existing.status)) {
      throw new AppError(
        `Cannot delete order with status "${existing.status}". Only pending or cancelled orders can be deleted.`,
        400
      );
    }

    await supabase.from('order_items').delete().eq('order_id', id);

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.json({
      success: true,
      message: `Order for "${existing.customer_name}" deleted successfully`
    });
  }
);