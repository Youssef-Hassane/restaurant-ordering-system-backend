import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { ApiResponse } from '../../types/index.js';

export const getCategories = asyncHandler(
  async (req: Request, res: Response<ApiResponse<string[]>>, next: NextFunction): Promise<void> => {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('available', true);

    if (error) {
      throw new AppError(error.message, 400);
    }

    const categories: string[] = [...new Set(data?.map(item => item.category) || [])].sort();

    res.json({
      success: true,
      data: categories
    });
  }
);