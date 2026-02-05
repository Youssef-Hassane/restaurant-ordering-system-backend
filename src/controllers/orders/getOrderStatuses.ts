import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { VALID_ORDER_STATUSES } from '../../types/index.js';

export const getOrderStatuses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const statuses = VALID_ORDER_STATUSES.map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1)
    }));

    res.json({
      success: true,
      data: statuses
    });
  }
);
