'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Shield,
  Lock,
  CreditCard,
  Wallet,
  ExternalLink,
  Receipt,
} from 'lucide-react';
import BookingSteps from '@/components/booking/BookingSteps';
import { createPaypalPayment, createVnpayPayment, getBookingDetails } from '@/lib/api';
import { useBookingStore } from '@/store/bookingStore';
import type { BookingDetails, PaymentMethod } from '@/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'VNPAY',
    name: 'VNPay',
    description: 'Thanh toán qua cổng VNPay: thẻ ATM, Visa, MasterCard, mã QR',
    icon: <CreditCard className="h-6 w-6" />,
  },
  {
    id: 'PAYPAL',
    name: 'PayPal',
    description: 'Thanh toán quốc tế qua PayPal',
    icon: <Wallet className="h-6 w-6" />,
  },
];

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const { bookingData, setBookingData, setPaymentMethod, voucherResult } =
    useBookingStore();

  const [booking, setBooking] = useState<BookingDetails | null>(bookingData);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('VNPAY');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(!bookingData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (bookingData) {
      setBooking(bookingData);
      setPageLoading(false);
      return;
    }

    if (!bookingId) {
      setPageLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await getBookingDetails(bookingId);
        if (!cancelled) {
          setBooking(data);
          setBookingData(data);
        }
      } catch {
        if (!cancelled) setError('Không thể tải thông tin booking');
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId, bookingData, setBookingData]);

  const handlePayment = async () => {
    if (!bookingId || !agreedTerms) return;

    setLoading(true);
    setError(null);
    setPaymentMethod(selectedMethod);

    try {
      if (selectedMethod === 'VNPAY') {
        const paymentUrl = await createVnpayPayment(bookingId);
        window.location.href = paymentUrl;
        return;
      }

      if (selectedMethod === 'PAYPAL') {
        const paymentUrl = await createPaypalPayment(bookingId);
        window.location.href = paymentUrl;
        return;
      }

      setError('Phương thức thanh toán chưa được hỗ trợ');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Lỗi khi xử lý thanh toán';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount =
    voucherResult?.final_total ?? booking?.financials.total_amount ?? 0;

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 z-30 border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={() => router.push(`/user/booking/checkout?bookingId=${bookingId}`)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">Thanh toán</h1>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-brand-600">
              <Shield className="h-3.5 w-3.5" />
              <span className="font-medium">Thanh toán bảo mật</span>
            </div>
          </div>
          <BookingSteps currentStep={3} />
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="mb-2 text-lg font-bold text-slate-900">
                Chọn phương thức thanh toán
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                Chọn cách bạn muốn thanh toán cho chuyến đi
              </p>

              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((option) => {
                  const isSelected = selectedMethod === option.id;

                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => setSelectedMethod(option.id)}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/70 shadow-glow'
                          : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                            isSelected ? 'border-brand-500' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="h-2.5 w-2.5 rounded-full bg-brand-500"
                            />
                          )}
                        </div>

                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                            isSelected
                              ? 'bg-brand-100 text-brand-600'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {option.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {option.name}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-slate-500">
                            {option.description}
                          </p>
                        </div>

                        {isSelected && (
                          <ExternalLink className="h-4 w-4 flex-shrink-0 text-brand-500" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card"
            >
              <label className="group flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 h-5 w-5 cursor-pointer rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                />
                <div className="text-sm leading-relaxed text-slate-600">
                  <span>Tôi đã đọc và đồng ý với </span>
                  <span className="font-medium text-brand-500 hover:underline">
                    Điều khoản sử dụng
                  </span>
                  <span> và </span>
                  <span className="font-medium text-brand-500 hover:underline">
                    Chính sách hoàn/hủy vé
                  </span>
                  <span>. Tôi xác nhận thông tin đặt vé là chính xác.</span>
                </div>
              </label>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                  <Receipt className="h-5 w-5 text-brand-500" />
                </div>
                <h3 className="font-semibold text-slate-900">Tóm tắt đơn hàng</h3>
              </div>

              {booking && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mã đặt vé</span>
                    <span className="font-mono font-semibold text-brand-600">
                      {booking.booking_summary.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loại vé</span>
                    <span className="font-medium">
                      {booking.booking_summary.type === 'FLIGHT' ? 'Máy bay' : 'Tàu hỏa'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số hành khách</span>
                    <span className="font-medium">{booking.passengers.length} người</span>
                  </div>

                  {voucherResult && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Giảm giá ({voucherResult.voucher_code})</span>
                      <span className="font-medium">
                        -{formatCurrency(voucherResult.discount_amount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="font-bold text-slate-900">Tổng thanh toán</span>
                    <span className="text-xl font-bold gradient-text">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <button
                onClick={handlePayment}
                disabled={!agreedTerms || loading}
                className="btn-primary w-full py-4 text-base"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Thanh toán {formatCurrency(totalAmount)}
                  </>
                )}
              </button>

              <button
                onClick={() => router.push(`/user/booking/checkout?bookingId=${bookingId}`)}
                className="btn-secondary w-full"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </button>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Lock className="h-3 w-3" />
              <span>Mã hóa SSL 256-bit - Thanh toán an toàn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
