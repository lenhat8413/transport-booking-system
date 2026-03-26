'use client';

import { motion } from 'framer-motion';
import { Receipt, Tag, TrendingDown } from 'lucide-react';
import type { PassengerDetail, FinancialInfo, VoucherResult } from '@/types';

interface PriceBreakdownProps {
  passengers: PassengerDetail[];
  financials: FinancialInfo;
  voucherResult?: VoucherResult | null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export default function PriceBreakdown({ passengers, financials, voucherResult }: PriceBreakdownProps) {
  const subtotal = passengers.reduce((sum, p) => sum + p.final_price, 0);
  const discount = voucherResult?.discount_amount ?? financials.discount_applied ?? 0;
  const total = voucherResult?.final_total ?? financials.total_amount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-emerald-500" />
        </div>
        <h3 className="font-semibold text-gray-900">Chi tiết thanh toán</h3>
      </div>

      <div className="space-y-3 mb-4">
        {passengers.map((p) => (
          <div key={p.ticket_id} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Vé - {p.passenger_name}
              {p.seat_info && <span className="text-gray-400"> (Ghế {p.seat_info.number})</span>}
            </span>
            <span className="font-medium text-gray-800">{formatCurrency(p.final_price)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-200 my-4" />

      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600">Tạm tính</span>
        <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
      </div>

      {discount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center justify-between text-sm mb-2"
        >
          <span className="flex items-center gap-1.5 text-emerald-600">
            <Tag className="w-3.5 h-3.5" />
            Giảm giá
            {voucherResult?.voucher_code && (
              <span className="px-1.5 py-0.5 bg-emerald-50 rounded text-xs font-mono">
                {voucherResult.voucher_code}
              </span>
            )}
          </span>
          <span className="font-medium text-emerald-600 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            -{formatCurrency(discount)}
          </span>
        </motion.div>
      )}

      <div className="border-t border-gray-200 my-4" />

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
        <div className="text-right">
          {discount > 0 && (
            <span className="block text-sm text-gray-400 line-through mb-0.5">
              {formatCurrency(subtotal)}
            </span>
          )}
          <span className="text-2xl font-bold gradient-text">{formatCurrency(total)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Đã bao gồm thuế và phí dịch vụ
      </p>
    </motion.div>
  );
}