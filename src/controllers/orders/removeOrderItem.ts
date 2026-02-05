import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { OrderWithItems, ApiResponse } from '../../types/index.js';
import { recalculateOrderTotal } from '../../utils/helpers/orderHelpers.js';

export const removeOrderItem = asyncHandler(
  async (req: Request, res: Response<ApiResponse<OrderWithItems>>, next: NextFunction): Promise<void> => {
    const { id, itemId } = req.params;

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
      .select('id, product_name')
      .eq('id', itemId)
      .eq('order_id', id)
      .single();

    if (itemError || !item) {
      throw new AppError('Order item not found', 404);
    }

    const { data: allItems } = await supabase
      .from('order_items')
      .select('id')
      .eq('order_id', id);

    if (allItems && allItems.length === 1) {
      throw new AppError('Cannot remove the last item. Delete the order instead.', 400);
    }

    const { error: deleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) {
      throw new AppError(deleteError.message, 400);
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
      message: `Removed "${item.product_name}" from order`,
      data: {
        ...updatedOrder,
        items: items || []
      } as OrderWithItems
    });
  }
);