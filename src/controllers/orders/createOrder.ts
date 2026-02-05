import { Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { OrderWithItems, OrderStatus, ApiResponse, Currency, DEFAULT_CURRENCY, AuthenticatedRequest } from '../../types/index.js';
import { validateCreateOrderRequest } from '../../utils/validators/orderValidators.js';

export const createOrder = asyncHandler(
  async (req: AuthenticatedRequest, res: Response<ApiResponse<OrderWithItems>>, next: NextFunction): Promise<void> => {
    const orderData = validateCreateOrderRequest(req.body);
    const userId = req.user?.userId || null;

    let totalAmount = 0;
    let orderCurrency: Currency | null = null;

    const validatedItems: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      currency: Currency;
      total_price: number;
    }> = [];

    // Validate all items and calculate totals
    for (const item of orderData.items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('id, name, price, currency, available')
        .eq('id', item.product_id)
        .single();

      if (error || !product) {
        throw new AppError(`Product with ID ${item.product_id} not found`, 404);
      }

      if (!product.available) {
        throw new AppError(`"${product.name}" is currently unavailable`, 400);
      }

      if (orderCurrency === null) {
        orderCurrency = product.currency;
      } else if (orderCurrency !== product.currency) {
        throw new AppError(
          `Cannot mix currencies in one order. Order currency is ${orderCurrency}, but "${product.name}" uses ${product.currency}`,
          400
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        currency: product.currency,
        total_price: itemTotal
      });
    }

    // Create the order (order_number is auto-generated)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: orderData.customer_name.trim(),
        customer_email: orderData.customer_email || null,
        customer_phone: orderData.customer_phone || null,
        total_amount: totalAmount,
        currency: orderCurrency || DEFAULT_CURRENCY,
        status: 'pending' as OrderStatus,
        notes: orderData.notes || null,
        created_by: userId,
        updated_by: userId
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new AppError(orderError?.message || 'Failed to create order', 400);
    }

    // Create order items
    const orderItems = validatedItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency: item.currency,
      total_price: item.total_price
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id);
      throw new AppError(itemsError.message, 400);
    }

    res.status(201).json({
      success: true,
      message: `Order #${order.order_number} created successfully!`,
      data: {
        ...order,
        items: createdItems || []
      } as OrderWithItems
    });
  }
);