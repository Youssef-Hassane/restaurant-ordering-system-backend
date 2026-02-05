import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { AuthResponse, ApiResponse, User } from '../../types/index.js';
import { validateLoginRequest } from '../../utils/validators/authValidators.js';
import { comparePassword, generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '../../utils/helpers/authHelpers.js';

export const login = asyncHandler(
  async (req: Request, res: Response<ApiResponse<AuthResponse>>, next: NextFunction): Promise<void> => {
    const { email, password } = validateLoginRequest(req.body);

    // Get user with password
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.is_active) {
      throw new AppError('Your account has been deactivated', 401);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const userWithoutPassword: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    const accessToken = generateAccessToken(userWithoutPassword);
    const refreshToken = generateRefreshToken(userWithoutPassword);

    // Store refresh token
    await supabase.from('refresh_tokens').insert({
      user_id: user.id,
      token: refreshToken,
      expires_at: getRefreshTokenExpiry().toISOString()
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  }
);