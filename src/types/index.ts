// =============================================
// CURRENCY TYPES
// =============================================
export type Currency = 'USD' | 'EUR' | 'GBP' | 'EGP' | 'SAR' | 'AED' | 'JPY' | 'CAD' | 'AUD';

export const DEFAULT_CURRENCY: Currency = 'EGP';

export const VALID_CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED', 'JPY', 'CAD', 'AUD'];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  EGP: 'E£',
  SAR: '﷼',
  AED: 'د.إ',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$'
};

export const isValidCurrency = (currency: string): currency is Currency => {
  return VALID_CURRENCIES.includes(currency as Currency);
};

// =============================================
// USER TYPES
// =============================================
export type UserRole = 'admin' | 'manager' | 'cashier';

export const VALID_USER_ROLES: UserRole[] = ['admin', 'manager', 'cashier'];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// =============================================
// PRODUCT TYPES
// =============================================
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: Currency;
  image_url: string | null;
  category: string;
  available: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCreator extends Product {
  creator?: User | null;
  updater?: User | null;
}

export interface CreateProductRequest {
  name: string;
  description?: string | null;
  price: number;
  currency?: Currency;
  image_url?: string | null;
  category: string;
  available?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string | null;
  price?: number;
  currency?: Currency;
  image_url?: string | null;
  category?: string;
  available?: boolean;
}

// =============================================
// ORDER TYPES
// =============================================
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'completed' 
  | 'cancelled';

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'cancelled'
];

export const isValidOrderStatus = (status: string): status is OrderStatus => {
  return VALID_ORDER_STATUSES.includes(status as OrderStatus);
};

export interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  total_amount: number;
  currency: Currency;
  status: OrderStatus;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  creator?: User | null;
  updater?: User | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  currency: Currency;
  total_price: number;
  created_at: string;
}

// =============================================
// REQUEST TYPES
// =============================================
export interface CreateOrderItemRequest {
  product_id: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  items: CreateOrderItemRequest[];
  notes?: string;
}

export interface UpdateOrderRequest {
  customer_name?: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  notes?: string | null;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface AddOrderItemRequest {
  product_id: string;
  quantity: number;
}

export interface UpdateOrderItemRequest {
  quantity: number;
}

// =============================================
// API RESPONSE TYPES
// =============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: string;
}

// =============================================
// EXPRESS EXTENDED REQUEST
// =============================================
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}