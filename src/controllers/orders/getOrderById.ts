import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { OrderWithItems, ApiResponse } from '../../types/index.js';

export const getOrderById = asyncHandler(
  async (req: Request, res: Response<ApiResponse<OrderWithItems>>, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const orderId = Array.isArray(id) ? id[0] : id;

    // Check if id is a number (order_number) or UUID
    const isOrderNumber = /^\d+$/.test(orderId);

    let orderQuery = supabase
      .from('orders')
      .select('*, creator:users!orders_created_by_fkey(id, name, email, role)');

    if (isOrderNumber) {
      orderQuery = orderQuery.eq('order_number', parseInt(orderId));
    } else {
      orderQuery = orderQuery.eq('id', orderId);
    }

    const { data: order, error: orderError } = await orderQuery.single();

    if (orderError || !order) {
      throw new AppError('Order not found', 404);
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at');

    if (itemsError) {
      throw new AppError(itemsError.message, 400);
    }

    res.json({
      success: true,
      data: {
        ...order,
        items: items || []
      } as OrderWithItems
    });
  }
);