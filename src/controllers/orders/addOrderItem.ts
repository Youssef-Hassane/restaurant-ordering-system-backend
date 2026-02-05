import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { OrderWithItems, ApiResponse, AddOrderItemRequest } from '../../types/index.js';
import { recalculateOrderTotal } from '../../utils/helpers/orderHelpers.js';

export const addOrderItem = asyncHandler(
  async (req: Request, res: Response<ApiResponse<OrderWithItems>>, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const orderId = Array.isArray(id) ? id[0] : id;
    const { product_id, quantity } = req.body as AddOrderItemRequest;

    if (!product_id || typeof product_id !== 'string') {
      throw new AppError('Product ID is required', 400);
    }

    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
      throw new AppError('Quantity must be at least 1', 400);
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, currency')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new AppError('Order not found', 404);
    }

    if (['completed', 'cancelled'].includes(order.status)) {
      throw new AppError(`Cannot modify a ${order.status} order`, 400);
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, currency, available')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      throw new AppError('Product not found', 404);
    }

    if (!product.available) {
      throw new AppError(`"${product.name}" is currently unavailable`, 400);
    }

    if (order.currency !== product.currency) {
      throw new AppError(
        `Cannot add product with currency ${product.currency} to order with currency ${order.currency}`,
        400
      );
    }

    const { data: existingItem } = await supabase
      .from('order_items')
      .select('id, quantity')
      .eq('order_id', orderId)
      .eq('product_id', product_id)
      .single();

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      const newTotal = product.price * newQuantity;

      await supabase
        .from('order_items')
        .update({
          quantity: newQuantity,
          total_price: newTotal
        })
        .eq('id', existingItem.id);
    } else {
      const itemTotal = product.price * quantity;

      const { error: insertError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderId,
          product_id: product.id,
          product_name: product.name,
          quantity,
          unit_price: product.price,
          currency: product.currency,
          total_price: itemTotal
        });

      if (insertError) {
        throw new AppError(insertError.message, 400);
      }
    }

    await recalculateOrderTotal(orderId);

    const { data: updatedOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    res.json({
      success: true,
      message: `Added "${product.name}" to order`,
      data: {
        ...updatedOrder,
        items: items || []
      } as OrderWithItems
    });
  }
);