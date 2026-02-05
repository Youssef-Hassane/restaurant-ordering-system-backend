import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { Order, ApiResponse, isValidOrderStatus } from '../../types/index.js';

export const getAllOrders = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Order[]>>, next: NextFunction): Promise<void> => {
    const { 
      status, 
      customer_name, 
      order_number,
      limit = '50', 
      offset = '0', 
      sort = 'created_at', 
      order = 'desc' 
    } = req.query;

    let query = supabase
      .from('orders')
      .select('*')
      .order(sort as string, { ascending: order === 'asc' })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    // Filter by status
    if (status && typeof status === 'string' && isValidOrderStatus(status)) {
      query = query.eq('status', status);
    }

    // Search by customer name
    if (customer_name && typeof customer_name === 'string') {
      query = query.ilike('customer_name', `%${customer_name}%`);
    }

    // Search by order number
    if (order_number && typeof order_number === 'string') {
      const orderNum = parseInt(order_number);
      if (!isNaN(orderNum)) {
        query = query.eq('order_number', orderNum);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.json({
      success: true,
      count: data?.length || 0,
      data: data || []
    });
  }
);