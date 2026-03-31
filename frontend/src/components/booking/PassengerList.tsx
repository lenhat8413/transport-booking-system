'use client';

import { motion } from 'framer-motion';
import { Users, Edit, AlertCircle } from 'lucide-react';
import type { PassengerDetail } from '@/types';
import { useRouter } from 'next/navigation';

interface PassengerListProps {
  passengers: PassengerDetail[];
  bookingId?: string | null;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function formatSeatClass(seatClass: string): string {
  const classMap: Record<string, string> = {
    economy: 'Phổ thông',
    business: 'Thương gia',
    first: 'Hạng nhất',
    hard_seat: 'Ghế cứng',
    soft_seat: 'Ghế mềm',
    hard_sleeper: 'Giường cứng',
    soft_sleeper: 'Giường mềm',
    vip_cabin: 'VIP',
  };
  return classMap[seatClass] ?? seatClass;
}

export default function PassengerList({ passengers, bookingId }: PassengerListProps) {
  const router = useRouter();

  const handleEditPassengerInfo = () => {
    if (bookingId) {
      router.push(`/user/booking/passenger-info?bookingId=${bookingId}`);
    }
  };

  const hasIncompleteInfo = passengers.some((p) => !p.passenger_name || !p.id_card);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Thông tin hành khách</h3>
            <p className="text-sm text-gray-500">{passengers.length} hành khách</p>
          </div>
        </div>

        {bookingId && (
          <button
            onClick={handleEditPassengerInfo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Chỉnh sửa
          </button>
        )}
      </div>

      {hasIncompleteInfo && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50 p-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500" />
          <p className="text-sm text-brand-700">
            <strong>Chú ý:</strong> Vui lòng nhập đầy đủ thông tin hành khách trước khi thanh toán.
            Nhấn nút "Chỉnh sửa" để nhập thông tin.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {passengers.map((p, idx) => (
          <motion.div
            key={p.ticket_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (idx + 1) }}
            className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100"
          >
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">
                  Họ tên
                </p>
                {p.passenger_name ? (
                  <p className="font-bold text-gray-900 uppercase">{p.passenger_name}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Chưa nhập</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">
                  Số CCCD/CMND
                </p>
                {p.id_card ? (
                  <p className="font-bold text-gray-900 text-[15px] tracking-wide">
                    {p.id_card.length >= 8 ? `${p.id_card.slice(0, 2)}****${p.id_card.slice(-4)}` : p.id_card}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Chưa nhập</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">
                  Chỗ ngồi
                </p>
                <p className="font-bold text-brand-600">
                  {p.seat_info
                    ? (p.seat_info.number.includes('-')
                        ? `Toa ${p.seat_info.number.split('-')[0]} - Ghế ${p.seat_info.number.split('-')[1]}`
                        : `Ghế ${p.seat_info.number}`)
                    : 'Đang chờ xếp chỗ'}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {p.seat_info ? formatSeatClass(p.seat_info.class) : ''}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">
                  Giá vé
                </p>
                <p className="font-bold text-gray-900 text-base">{formatCurrency(p.final_price)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
