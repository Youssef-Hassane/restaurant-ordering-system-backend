import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { Product, ApiResponse } from '../../types/index.js';

export const getAllProducts = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Product[]>>, next: NextFunction): Promise<void> => {
    const { category, available, search, currency } = req.query;

    let query = supabase
      .from('products')
      .select('*')
      .order('category')
      .order('name');

    if (available === 'true') {
      query = query.eq('available', true);
    } else if (available === 'false') {
      query = query.eq('available', false);
    }

    if (category && typeof category === 'string') {
      query = query.ilike('category', category);
    }

    if (currency && typeof currency === 'string') {
      query = query.eq('currency', currency.toUpperCase());
    }

    if (search && typeof search === 'string') {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
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
