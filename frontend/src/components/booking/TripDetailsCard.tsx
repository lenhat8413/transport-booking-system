'use client';

import { motion } from 'framer-motion';
import { Plane, Train, MapPin, Clock, Calendar, ArrowRight } from 'lucide-react';
import type { BookingSummary } from '@/types';

interface TripDetailsCardProps {
  booking: BookingSummary;
}

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function TripDetailsCard({ booking }: TripDetailsCardProps) {
  const isFlight = booking.type === 'FLIGHT';
  const Icon = isFlight ? Plane : Train;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-brand-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            Chi tiết chuyến {isFlight ? 'bay' : 'tàu'}
          </h3>
          <p className="text-sm text-gray-500">
            Mã đặt vé: <span className="font-mono font-semibold text-brand-600">{booking.code}</span>
          </p>
        </div>
        <div className="ml-auto">
          <span className={`badge ${
            booking.status === 'CONFIRMED' ? 'badge-success' :
            booking.status === 'WAITING_PAYMENT' || booking.status === 'PENDING' ? 'badge-warning' :
            'badge-error'
          }`}>
            {booking.status === 'CONFIRMED' ? 'Đã xác nhận' :
             booking.status === 'WAITING_PAYMENT' ? 'Chờ thanh toán' :
             booking.status === 'PENDING' ? 'Đang xử lý' :
             booking.status === 'CANCELLED' ? 'Đã hủy' : 'Hết hạn'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-gradient-to-r from-brand-50/60 to-orange-50/40 rounded-2xl p-5">
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-wide">Xuất phát</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {isFlight ? 'Sân bay đi' : 'Ga đi'}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-gray-600">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(booking.created_at)}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-px bg-gradient-to-r from-brand-300 to-brand-500 relative">
            <ArrowRight className="w-4 h-4 text-brand-500 absolute -right-2 -top-2" />
          </div>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            {isFlight ? 'Bay' : 'Di chuyển'}
          </span>
        </div>

        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-wide">Đến</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {isFlight ? 'Sân bay đến' : 'Ga đến'}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-gray-600">
            <Clock className="w-3.5 h-3.5" />
            <span>Dự kiến</span>
          </div>
        </div>
      </div>

      {booking.expires_at && (booking.status === 'PENDING' || booking.status === 'WAITING_PAYMENT') && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            Vui lòng hoàn tất trước <strong>{formatTime(booking.expires_at)}</strong>
            {' - '}
            {formatDate(booking.expires_at)}
          </span>
        </div>
      )}
    </motion.div>
  );
}