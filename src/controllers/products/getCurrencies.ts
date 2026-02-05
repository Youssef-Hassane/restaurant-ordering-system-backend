import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { VALID_CURRENCIES, CURRENCY_SYMBOLS, DEFAULT_CURRENCY } from '../../types/index.js';

export const getCurrencies = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const currencies = VALID_CURRENCIES.map(code => ({
      code,
      symbol: CURRENCY_SYMBOLS[code],
      isDefault: code === DEFAULT_CURRENCY
    }));

    res.json({
      success: true,
      defaultCurrency: DEFAULT_CURRENCY,
      data: currencies
    });
  }
);
