import { Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthenticatedRequest, ApiResponse } from '../../types/index.js';

export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response<ApiResponse<null>>, next: NextFunction): Promise<void> => {
    const refreshToken = req.body.refreshToken;

    if (refreshToken) {
      // Delete refresh token
      await supabase
        .from('refresh_tokens')
        .delete()
        .eq('token', refreshToken);
    }

    // Delete all refresh tokens for user (logout from all devices)
    if (req.user) {
      await supabase
        .from('refresh_tokens')
        .delete()
        .eq('user_id', req.user.userId);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
);