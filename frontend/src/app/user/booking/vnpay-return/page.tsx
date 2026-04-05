'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Home,
  FileText,
  Loader2,
  Copy,
  Check,
  CreditCard,
  Calendar,
  Hash,
  ArrowRight,
} from 'lucide-react';
import {
  capturePaypalPayment,
  getPaymentStatus,
  getBookingDetails,
  verifyVnpayReturn,
} from '@/lib/api';
import { useBookingStore } from '@/store/bookingStore';
import type { PaymentInfo, BookingDetails } from '@/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getMethodName(method: string): string {
  const names: Record<string, string> = {
    VNPAY: 'VNPay',
    PAYPAL: 'PayPal',
  };
  return names[method] ?? method;
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const bookingId = searchParams.get('bookingId');
  const provider = searchParams.get('provider');
  const isPaypal = provider === 'paypal';
  const paypalToken = searchParams.get('token');
  const paypalPayerId = searchParams.get('PayerID');
  const isPaypalCancelled = searchParams.get('cancel') === 'true';

  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const vnpOrderInfo = searchParams.get('vnp_OrderInfo');
  const vnpAmount = searchParams.get('vnp_Amount');
  const vnpTxnRef = searchParams.get('vnp_TxnRef');
  const vnpBankTranNo = searchParams.get('vnp_BankTranNo');
  const vnpPayDate = searchParams.get('vnp_PayDate');

  const { reset } = useBookingStore();

  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isSuccess = payment?.status === 'SUCCESS';

  const loadData = useCallback(async () => {
    if (!bookingId && !vnpResponseCode && !paypalToken) {
      setLoading(false);
      return;
    }

    try {
      if (vnpResponseCode && !isPaypal) {
        await verifyVnpayReturn(queryString).catch(() => {});
      }

      if (isPaypal && bookingId && paypalToken && !isPaypalCancelled) {
        await capturePaypalPayment(bookingId, paypalToken, paypalPayerId).catch(() => {});
      }

      if (bookingId) {
        const paymentData = await getPaymentStatus(bookingId);
        setPayment(paymentData);

        try {
          const bookingData = await getBookingDetails(bookingId);
          setBooking(bookingData);
        } catch {
          // Keep rendering with payment data even if booking details fail.
        }
      } else if (vnpResponseCode) {
        const code = vnpOrderInfo ? vnpOrderInfo.split(' ').pop() : '';
        const rawAmount = parseInt(vnpAmount || '0', 10);
        const amount = rawAmount > 0 ? rawAmount / 100 : 0;

        let formattedDate = new Date().toISOString();
        if (vnpPayDate && vnpPayDate.length === 14) {
          const year = vnpPayDate.substring(0, 4);
          const month = vnpPayDate.substring(4, 6);
          const day = vnpPayDate.substring(6, 8);
          const hour = vnpPayDate.substring(8, 10);
          const min = vnpPayDate.substring(10, 12);
          const sec = vnpPayDate.substring(12, 14);
          formattedDate = `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
        }

        setPayment({
          _id: vnpTxnRef || '',
          booking_id: '',
          method: 'VNPAY',
          amount,
          status: vnpResponseCode === '00' ? 'SUCCESS' : 'FAILED',
          transaction_id: vnpBankTranNo || '',
          paid_at: formattedDate,
          createdAt: formattedDate,
          updatedAt: formattedDate,
        });

        if (code && code !== 'hang') {
          setBooking({
            booking_summary: {
              code,
              type: 'FLIGHT',
              status: vnpResponseCode === '00' ? 'CONFIRMED' : 'FAILED',
            } as BookingDetails['booking_summary'],
            financials: { total_amount: amount } as BookingDetails['financials'],
            passengers: [],
          });
        }
      }
    } catch {
      // Keep the page rendered with whatever fallback data is available.
    } finally {
      setLoading(false);
    }
  }, [
    bookingId,
    isPaypal,
    isPaypalCancelled,
    paypalPayerId,
    paypalToken,
    queryString,
    vnpAmount,
    vnpBankTranNo,
    vnpOrderInfo,
    vnpPayDate,
    vnpResponseCode,
    vnpTxnRef,
  ]);

  useEffect(() => {
    void loadData();

    return () => {
      reset();
    };
  }, [loadData, reset]);

  const handleCopyCode = () => {
    const code = booking?.booking_summary.code ?? '';
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoHome = () => router.push('/');

  const handleOpenBooking = () => {
    if (bookingId) {
      router.push(`/user/bookings/${bookingId}`);
      return;
    }

    router.push('/');
  };

  const handleRetryPayment = () => {
    if (bookingId) {
      router.push(`/user/booking/payment?bookingId=${bookingId}`);
      return;
    }

    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-14 h-14 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang xác nhận giao dịch...</p>
          <p className="text-sm text-gray-400 mt-1">Vui lòng không đóng trang này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        <div className="card text-center overflow-hidden">
          <div
            className={`
              relative -mx-6 -mt-6 px-6 pt-12 pb-8 mb-6
              ${isSuccess ? 'bg-gradient-to-b from-emerald-50 to-white' : 'bg-gradient-to-b from-red-50 to-white'}
            `}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div
                className={`
                  absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10
                  ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}
                `}
              />
              <div
                className={`
                  absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-5
                  ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}
                `}
              />
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative"
            >
              {isSuccess ? (
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto shadow-lg shadow-red-100">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative mt-5"
            >
              <h1 className={`text-2xl font-bold ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`}>
                {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
              </h1>
              <p className="text-gray-500 mt-2 text-sm">
                {isSuccess
                  ? 'Cảm ơn bạn! Vé của bạn đã được xác nhận.'
                  : 'Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức khác.'}
              </p>
            </motion.div>
          </div>

          {payment && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4 mb-6"
            >
              {booking && (
                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Hash className="w-4 h-4" />
                    <span>Mã đặt vé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-600 text-lg">
                      {booking.booking_summary.code}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {payment.transaction_id && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Mã giao dịch
                  </span>
                  <span className="font-mono text-sm text-gray-700">{payment.transaction_id}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Phương thức
                </span>
                <span className="font-medium text-sm text-gray-700">
                  {getMethodName(payment.method)}
                </span>
              </div>

              {payment.amount > 0 && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Số tiền</span>
                  <span className="text-lg font-bold gradient-text">{formatCurrency(payment.amount)}</span>
                </div>
              )}

              {payment.paid_at && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Thời gian
                  </span>
                  <span className="text-sm text-gray-700">{formatDateTime(payment.paid_at)}</span>
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {isSuccess ? (
              <>
                <button onClick={handleOpenBooking} className="btn-primary w-full">
                  <FileText className="w-4 h-4" />
                  Xem chi tiết booking
                </button>
                <button onClick={handleGoHome} className="btn-secondary w-full">
                  <Home className="w-4 h-4" />
                  Về trang chủ
                </button>
              </>
            ) : (
              <>
                <button onClick={handleRetryPayment} className="btn-primary w-full">
                  <ArrowRight className="w-4 h-4" />
                  Thử lại
                </button>
                <button onClick={handleGoHome} className="btn-secondary w-full">
                  <Home className="w-4 h-4" />
                  Về trang chủ
                </button>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-14 h-14 text-brand-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Đang tải kết quả giao dịch...</p>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
