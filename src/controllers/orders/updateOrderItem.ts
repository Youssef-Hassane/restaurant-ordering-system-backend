import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { OrderWithItems, ApiResponse, UpdateOrderItemRequest } from '../../types/index.js';
import { recalculateOrderTotal } from '../../utils/helpers/orderHelpers.js';

export const updateOrderItem = asyncHandler(
  async (req: Request, res: Response<ApiResponse<OrderWithItems>>, next: NextFunction): Promise<void> => {
    const { id, itemId } = req.params;
    const { quantity } = req.body as UpdateOrderItemRequest;

    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
      throw new AppError('Quantity must be at least 1', 400);
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      throw new AppError('Order not found', 404);
    }

    if (['completed', 'cancelled'].includes(order.status)) {
      throw new AppError(`Cannot modify a ${order.status} order`, 400);
    }

    const { data: item, error: itemError } = await supabase
      .from('order_items')
      .select('id, unit_price, product_name')
      .eq('id', itemId)
      .eq('order_id', id)
      .single();

    if (itemError || !item) {
      throw new AppError('Order item not found', 404);
    }

    const newTotal = item.unit_price * quantity;

    const { error: updateError } = await supabase
      .from('order_items')
      .update({
        quantity,
        total_price: newTotal
      })
      .eq('id', itemId);

    if (updateError) {
      throw new AppError(updateError.message, 400);
    }

    await recalculateOrderTotal(id);

    const { data: updatedOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    res.json({
      success: true,
      message: `Updated quantity for "${item.product_name}"`,
      data: {
        ...updatedOrder,
        items: items || []
      } as OrderWithItems
    });
  }
);