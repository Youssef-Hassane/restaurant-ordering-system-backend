import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import { ApiResponse, User } from '../../types/index.js';
import { validateCreateUserRequest } from '../../utils/validators/authValidators.js';
import { hashPassword } from '../../utils/helpers/authHelpers.js';

export const register = asyncHandler(
  async (req: Request, res: Response<ApiResponse<User>>, next: NextFunction): Promise<void> => {
    const userData = validateCreateUserRequest(req.body);

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        password_hash: passwordHash,
        name: userData.name,
        role: userData.role || 'cashier'
      })
      .select('id, email, name, role, is_active, created_at, updated_at')
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user
    });
  }
);