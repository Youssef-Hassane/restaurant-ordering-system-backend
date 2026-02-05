import { AppError } from '../../middleware/errorHandler.js';
import { LoginRequest, CreateUserRequest, VALID_USER_ROLES, UserRole } from '../../types/index.js';

export const validateLoginRequest = (body: unknown): LoginRequest => {
  const data = body as LoginRequest;

  if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
    throw new AppError('Email is required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new AppError('Invalid email format', 400);
  }

  if (!data.password || typeof data.password !== 'string') {
    throw new AppError('Password is required', 400);
  }

  return {
    email: data.email.toLowerCase().trim(),
    password: data.password
  };
};

export const validateCreateUserRequest = (body: unknown): CreateUserRequest => {
  const data = body as CreateUserRequest;

  if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
    throw new AppError('Email is required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new AppError('Invalid email format', 400);
  }

  if (!data.password || typeof data.password !== 'string') {
    throw new AppError('Password is required', 400);
  }

  if (data.password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    throw new AppError('Name is required', 400);
  }

  if (data.role && !VALID_USER_ROLES.includes(data.role)) {
    throw new AppError(`Invalid role. Must be one of: ${VALID_USER_ROLES.join(', ')}`, 400);
  }

  return {
    email: data.email.toLowerCase().trim(),
    password: data.password,
    name: data.name.trim(),
    role: data.role || 'cashier'
  };
};