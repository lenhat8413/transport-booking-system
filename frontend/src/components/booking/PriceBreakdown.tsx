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

export default function PriceBreakdown({
  passengers,
  financials,
  voucherResult,
}: PriceBreakdownProps) {
  const baseFareSubtotal =
    financials.base_fare_amount ??
    passengers.reduce((sum, passenger) => sum + (passenger.base_price ?? 0), 0);
  const seatSelectionSubtotal =
    financials.seat_selection_amount ??
    passengers.reduce(
      (sum, passenger) => sum + (passenger.seat_selection_fee ?? 0),
      0,
    );
  const subtotal =
    financials.subtotal_amount ??
    passengers.reduce((sum, passenger) => sum + passenger.final_price, 0);
  const discount =
    voucherResult?.discount_amount ?? financials.discount_applied ?? 0;
  const total = voucherResult?.final_total ?? financials.total_amount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <Receipt className="h-5 w-5 text-emerald-500" />
        </div>
        <h3 className="font-semibold text-gray-900">Chi tiết thanh toán</h3>
      </div>

      <div className="mb-4 space-y-4">
        {passengers.map((passenger) => (
          <div key={passenger.ticket_id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Vé gốc - {passenger.passenger_name}
                {passenger.seat_info && (
                  <span className="text-gray-400">
                    {' '}
                    (Ghế {passenger.seat_info.number})
                  </span>
                )}
              </span>
              <span className="font-medium text-gray-800">
                {formatCurrency(passenger.base_price ?? 0)}
              </span>
            </div>

            {(passenger.seat_selection_fee ?? 0) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Phí chọn ghế
                  {passenger.seat_info && (
                    <span className="text-gray-400">
                      {' '}
                      ({passenger.seat_info.number})
                    </span>
                  )}
                </span>
                <span className="font-medium text-brand-600">
                  {formatCurrency(passenger.seat_selection_fee ?? 0)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="my-4 border-t border-dashed border-gray-200" />

      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-gray-600">Giá vé gốc</span>
        <span className="font-medium text-gray-800">
          {formatCurrency(baseFareSubtotal)}
        </span>
      </div>

      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-gray-600">Phí chọn ghế</span>
        <span className="font-medium text-gray-800">
          {formatCurrency(seatSelectionSubtotal)}
        </span>
      </div>

      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-gray-600">Tạm tính</span>
        <span className="font-medium text-gray-800">
          {formatCurrency(subtotal)}
        </span>
      </div>

      {discount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-2 flex items-center justify-between text-sm"
        >
          <span className="flex items-center gap-1.5 text-emerald-600">
            <Tag className="h-3.5 w-3.5" />
            Giảm giá
            {voucherResult?.voucher_code && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-xs">
                {voucherResult.voucher_code}
              </span>
            )}
          </span>
          <span className="flex items-center gap-1 font-medium text-emerald-600">
            <TrendingDown className="h-3 w-3" />
            -{formatCurrency(discount)}
          </span>
        </motion.div>
      )}

      <div className="my-4 border-t border-gray-200" />

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
        <div className="text-right">
          {discount > 0 && (
            <span className="mb-0.5 block text-sm text-gray-400 line-through">
              {formatCurrency(subtotal)}
            </span>
          )}
          <span className="text-2xl font-bold gradient-text">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-gray-400">
        Đã bao gồm thuế và phí dịch vụ
      </p>
    </motion.div>
  );
}
