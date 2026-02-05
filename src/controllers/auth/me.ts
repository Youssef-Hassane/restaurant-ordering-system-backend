import { Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { AuthenticatedRequest, ApiResponse, User } from '../../types/index.js';

export const getMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response<ApiResponse<User>>, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, is_active, created_at, updated_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user
    });
  }
);