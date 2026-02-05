import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TokenPayload, User } from '../../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generate access token
export const generateAccessToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

// Generate refresh token
export const generateRefreshToken = (user: User): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

// Verify refresh token
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};

// Get token expiry date
export const getRefreshTokenExpiry = (): Date => {
  const match = JWT_REFRESH_EXPIRES_IN.match(/^(\d+)([dhms]?)$/);
  const value = match ? parseInt(match[1]) : 7;
  const unit = match ? match[2] : 'd';
  
  const expiry = new Date();
  
  switch (unit) {
    case 'h':
      expiry.setHours(expiry.getHours() + value);
      break;
    case 'm':
      expiry.setMinutes(expiry.getMinutes() + value);
      break;
    case 's':
      expiry.setSeconds(expiry.getSeconds() + value);
      break;
    case 'd':
    default:
      expiry.setDate(expiry.getDate() + value);
      break;
  }
  
  return expiry;
};