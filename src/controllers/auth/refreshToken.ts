import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { ApiResponse, User } from '../../types/index.js';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '../../utils/helpers/authHelpers.js';

export const refreshToken = asyncHandler(
  async (req: Request, res: Response<ApiResponse<{ accessToken: string; refreshToken: string }>>, next: NextFunction): Promise<void> => {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify token
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Check if token exists in database
    const { data: storedToken, error: tokenError } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !storedToken) {
      throw new AppError('Refresh token not found', 401);
    }

    // Check if token is expired
    if (new Date(storedToken.expires_at) < new Date()) {
      await supabase.from('refresh_tokens').delete().eq('id', storedToken.id);
      throw new AppError('Refresh token has expired', 401);
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single();

    if (userError || !user || !user.is_active) {
      throw new AppError('User not found or inactive', 401);
    }

    // Delete old refresh token
    await supabase.from('refresh_tokens').delete().eq('id', storedToken.id);

    // Generate new tokens
    const userWithoutPassword: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    const newAccessToken = generateAccessToken(userWithoutPassword);
    const newRefreshToken = generateRefreshToken(userWithoutPassword);

    // Store new refresh token
    await supabase.from('refresh_tokens').insert({
      user_id: user.id,
      token: newRefreshToken,
      expires_at: getRefreshTokenExpiry().toISOString()
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  }
);