'use client';

import { motion } from 'framer-motion';
import { Plane, Train, MapPin, Clock, Calendar, ArrowRight } from 'lucide-react';
import type { BookingSummary } from '@/types';

interface TripDetailsCardProps {
  booking: BookingSummary;
}

function formatDate(value?: string | null): string {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(value?: string | null): string {
  if (!value) return '--:--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';

  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(booking: BookingSummary): string {
  const durationMinutes =
    booking.duration_minutes ??
    (() => {
      if (!booking.departure_time || !booking.arrival_time) return null;

      const start = new Date(booking.departure_time);
      const end = new Date(booking.arrival_time);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

      return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    })();

  if (durationMinutes == null) return 'Đang cập nhật';

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) return `${minutes}p`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}p`;
}

function getStatusLabel(status: BookingSummary['status']): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'WAITING_PAYMENT':
      return 'Chờ thanh toán';
    case 'PENDING':
      return 'Đang xử lý';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return 'Hết hạn';
  }
}

function getStatusClass(status: BookingSummary['status']): string {
  if (status === 'CONFIRMED') return 'badge-success';
  if (status === 'WAITING_PAYMENT' || status === 'PENDING') return 'badge-warning';
  return 'badge-error';
}

function buildLocationTitle(
  city?: string,
  name?: string,
  fallback?: string,
): string {
  return city || name || fallback || '--';
}

function buildLocationMeta(name?: string, code?: string): string {
  return [name, code].filter(Boolean).join(' - ');
}

export default function TripDetailsCard({ booking }: TripDetailsCardProps) {
  const isFlight = booking.type === 'FLIGHT';
  const Icon = isFlight ? Plane : Train;

  const departureTitle = buildLocationTitle(
    booking.departure_city,
    booking.departure_name,
    isFlight ? 'Sân bay đi' : 'Ga đi',
  );
  const arrivalTitle = buildLocationTitle(
    booking.arrival_city,
    booking.arrival_name,
    isFlight ? 'Sân bay đến' : 'Ga đến',
  );

  const departureMeta = buildLocationMeta(booking.departure_name, booking.departure_code);
  const arrivalMeta = buildLocationMeta(booking.arrival_name, booking.arrival_code);
  const carrierLabel = [booking.carrier_name, booking.trip_code].filter(Boolean).join(' - ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card"
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
          <Icon className="h-5 w-5 text-brand-500" />
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">
            {isFlight ? 'Chi tiết chuyến bay' : 'Chi tiết chuyến tàu'}
          </h3>
          <p className="text-sm text-gray-500">
            Mã đặt vé:{' '}
            <span className="font-mono font-semibold text-brand-600">{booking.code}</span>
          </p>
          {carrierLabel && <p className="mt-1 text-xs text-gray-400">{carrierLabel}</p>}
        </div>

        <div className="ml-auto">
          <span className={`badge ${getStatusClass(booking.status)}`}>
            {getStatusLabel(booking.status)}
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-brand-50/80 to-sky-50/70 p-5">
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="text-center md:text-left">
            <div className="mb-2 flex items-center justify-center gap-1 text-gray-500 md:justify-start">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wide">Xuất phát</span>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {formatTime(booking.departure_time)}
            </p>
            <p className="mt-1 text-base font-semibold text-gray-900">{departureTitle}</p>
            <p className="mt-1 text-sm text-gray-500">{departureMeta || '--'}</p>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-gray-600 md:justify-start">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(booking.departure_time || booking.created_at)}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand-600 shadow-sm">
              {formatDuration(booking)}
            </span>
            <div className="flex w-28 items-center md:w-32">
              <div className="h-2 w-2 rounded-full border-2 border-brand-400 bg-white" />
              <div className="h-px flex-1 bg-gradient-to-r from-brand-300 to-brand-500" />
              <ArrowRight className="mx-1 h-4 w-4 text-brand-500" />
              <div className="h-px flex-1 bg-gradient-to-r from-brand-500 to-brand-300" />
              <div className="h-2 w-2 rounded-full bg-brand-500" />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              {isFlight ? 'Bay thẳng' : 'Hành trình'}
            </span>
          </div>

          <div className="text-center md:text-right">
            <div className="mb-2 flex items-center justify-center gap-1 text-gray-500 md:justify-end">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wide">Điểm đến</span>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {formatTime(booking.arrival_time)}
            </p>
            <p className="mt-1 text-base font-semibold text-gray-900">{arrivalTitle}</p>
            <p className="mt-1 text-sm text-gray-500">{arrivalMeta || '--'}</p>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-gray-600 md:justify-end">
              <Clock className="h-3.5 w-3.5" />
              <span>Dự kiến đến lúc {formatTime(booking.arrival_time)}</span>
            </div>
          </div>
        </div>
      </div>

      {booking.expires_at &&
        (booking.status === 'PENDING' || booking.status === 'WAITING_PAYMENT') && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-700">
            <Clock className="h-4 w-4 flex-shrink-0" />
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
