import { supabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Currency, DEFAULT_CURRENCY } from '../../types/index.js';

export const recalculateOrderTotal = async (orderId: string): Promise<{ total: number; currency: Currency }> => {
  const { data: items, error } = await supabase
    .from('order_items')
    .select('total_price, currency')
    .eq('order_id', orderId);

  if (error) {
    throw new AppError(error.message, 400);
  }

  const total = items?.reduce((sum, item) => sum + Number(item.total_price), 0) || 0;
  const currency = (items?.[0]?.currency as Currency) || DEFAULT_CURRENCY;

  await supabase
    .from('orders')
    .update({ 
      total_amount: total,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  return { total, currency };
};