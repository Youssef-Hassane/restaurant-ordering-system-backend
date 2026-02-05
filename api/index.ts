import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../src/routes/v1_routes/auth.js';
import productRoutes from '../src/routes/v1_routes/products.js';
import orderRoutes from '../src/routes/v1_routes/orders.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Restaurant API is running!',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use(errorHandler);

export default app;