'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Download, Mail, Info, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getBookingDetails } from '@/lib/api';
import type { BookingDetails } from '@/types';
import ETicketPDF from '@/components/booking/ETicketPDF';

export default function BookingSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || !booking) return;

    setIsGeneratingPdf(true);
    try {
      const element = pdfRef.current;

      const canvas = await html2canvas(element, {
        scale: 2, // higher resolution
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`ETicket_${booking.booking_summary.code}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('Đã xảy ra lỗi khi tạo PDF. Vui lòng thử lại sau.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    if (!bookingId) return;

    getBookingDetails(bookingId)
      .then(data => setBooking(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy vé</h2>
        <p className="text-gray-500 mb-6">{error ?? 'Vui lòng kiểm tra lại đường dẫn.'}</p>
        <button onClick={() => router.push('/')} className="btn-primary">
          Về trang chủ
        </button>
      </div>
    );
  }

  const { booking_summary, passengers, financials } = booking;
  const isFlight = booking_summary.type === 'FLIGHT';
  const mainPassenger = passengers[0];
  const departureDate = new Date(booking_summary.created_at);
  // Simulate arrival date/time for UI (in a real app this comes from flight/train details)
  const arrivalDate = new Date(departureDate.getTime() + 5.5 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-[#f4f6f8] pb-20">
      {/* Navbar Minimal */}
      <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-2 font-bold text-xl text-brand-600">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white">
            T
          </div>
          TravelApp
        </div>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Home className="w-4 h-4" />
          Quay lại Trang chủ
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm overflow-hidden"
        >
          {/* Header Status */}
          <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full">
                {booking_summary.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Đang xử lý'}
              </span>
              <span className="font-medium text-gray-900">
                Mã đặt chỗ: <span className="font-bold">{booking_summary.code}</span>
              </span>
            </div>
            <div className="text-gray-500 text-sm">
              Đặt ngày {format(new Date(booking_summary.created_at), 'dd/MM/yyyy')}
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Left Col: Trip Details */}
            <div className="flex-1 p-6 md:p-10 border-b md:border-b-0 md:border-r border-gray-100">
              {/* Passenger & Seat Quick Info */}
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Hành khách</p>
                  <p className="font-bold text-gray-900 text-lg">{mainPassenger?.passenger_name || 'Khách hàng'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Chỗ ngồi</p>
                  <p className="font-bold text-brand-500 text-lg">
                    {mainPassenger?.seat_info
                      ? (mainPassenger.seat_info.number.includes('-')
                        ? `Toa ${mainPassenger.seat_info.number.split('-')[0]} - Ghế ${mainPassenger.seat_info.number.split('-')[1]}`
                        : `Ghế ${mainPassenger.seat_info.number}`)
                      : 'Đang chờ'}
                  </p>
                </div>
              </div>

              {/* Timeline Route UI */}
              <div className="flex items-center justify-between mb-12">
                <div className="text-left w-1/3">
                  <p className="text-3xl font-black text-gray-900 tracking-tight">
                    {format(departureDate, 'HH:mm')}
                  </p>
                  <p className="font-bold text-gray-900 mt-1">Ga Sài Gòn</p>
                  <p className="text-sm text-gray-500">TP. Hồ Chí Minh</p>
                </div>

                <div className="flex-1 px-4 flex flex-col items-center">
                  <span className="text-xs font-bold text-brand-500 mb-2">SE3</span>
                  <div className="w-full flex items-center justify-between relative">
                    <div className="w-2 h-2 rounded-full border-2 border-brand-500 bg-white z-10"></div>
                    <div className="border-t-2 border-dashed border-gray-200 flex-1 absolute inset-0 top-1/2 -translate-y-1/2"></div>
                    <div className="w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center z-10 text-white text-xs">
                      {isFlight ? '✈' : '🚆'}
                    </div>
                    <div className="w-2 h-2 rounded-full border-2 border-brand-500 bg-brand-500 z-10"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-2">
                    Thời gian: 29h 30m
                  </span>
                </div>

                <div className="text-right w-1/3">
                  <p className="text-3xl font-black text-gray-900 tracking-tight">
                    {format(arrivalDate, 'HH:mm')}
                  </p>
                  <p className="font-bold text-gray-900 mt-1">Ga Hà Nội</p>
                  <p className="text-sm text-gray-500">
                    {format(arrivalDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
                  </p>
                </div>
              </div>

              {/* Info Alert */}
              <div className="bg-gray-50 rounded-2xl p-4 flex gap-4 items-start border border-gray-100">
                <div className="mt-0.5 text-gray-400 flex-shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Vui lòng có mặt tại ga ít nhất <strong className="text-gray-900">30 phút</strong> trước giờ khởi hành. Mang theo CCCD hoặc hộ chiếu bản gốc để làm thủ tục lên tàu.
                </p>
              </div>
            </div>

            {/* Right Col: QR Code */}
            <div className="w-full md:w-[320px] p-6 md:p-10 flex flex-col items-center justify-center bg-white">
              <div className="w-48 h-48 bg-red-50 p-6 rounded-2xl mb-6 relative">
                {/* Decorative corners */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-red-200"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-red-200"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-red-200"></div>
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-red-200"></div>
                {/* Fake QR Image */}
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=booking_09812&format=png&color=000000&bgcolor=FFFFFF" alt="QR Code" className="w-full h-full object-cover mix-blend-multiply opacity-80" />
              </div>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Quét tại cổng soát vé
              </p>
              <div className="px-4 py-1.5 bg-gray-100 rounded-md text-xs font-mono font-medium text-gray-500 tracking-wider">
                ID: {booking_summary.id.slice(-8).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="relative border-t border-dashed border-gray-200 mx-8">
            <div className="absolute w-6 h-6 bg-[#f4f6f8] rounded-full -left-11 -top-3"></div>
            <div className="absolute w-6 h-6 bg-[#f4f6f8] rounded-full -right-11 -top-3"></div>
          </div>

          {/* Footer Pricing Summary */}
          <div className="p-8 pb-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1">Loại chỗ</p>
                <p className="font-semibold text-gray-900">Giường nằm khoang 4</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1">Giá vé</p>
                <p className="font-bold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(financials.total_amount)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1">Bảo hiểm</p>
                <p className="font-semibold text-green-600">Đã bao gồm</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase font-bold text-[10px] tracking-wider mb-1">Dịch vụ ăn uống</p>
                <p className="font-semibold text-gray-900">Không bao gồm</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons Below Ticket */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 px-2">
          <div className="flex gap-4 w-full md:w-auto">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-brand-500/20"
            >
              {isGeneratingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isGeneratingPdf ? 'Đang tạo PDF...' : 'Tải vé PDF'}
            </button>
            {/* HIDDEN GỬI EMAIL THEO YÊU CẦU */}
            {/* <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <Mail className="w-5 h-5" />
              Gửi qua Email
            </button> */}
          </div>
          <button className="text-sm font-medium text-gray-400 hover:text-gray-600 border-b border-gray-300 pb-0.5 transition-colors">
            Hủy đặt vé
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 mb-12 flex items-center justify-center gap-2">
          <Info className="w-3 h-3" />
          Bạn có thể in vé này hoặc sử dụng QR code trên điện thoại để lên tàu.
        </p>

        <footer className="border-t border-gray-200/60 pt-6 pb-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-400">
          <p>© 2026 TravelApp. All rights reserved.</p>
          <div className="flex items-center gap-6 uppercase tracking-wider">
            <a href="#" className="hover:text-brand-500 transition-colors">Hỗ trợ</a>
            <a href="#" className="hover:text-brand-500 transition-colors">Quy định</a>
            <a href="#" className="hover:text-brand-500 transition-colors">Bảo mật</a>
          </div>
        </footer>
      </div>

      {/* Off-screen PDF content container */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        <ETicketPDF ref={pdfRef} booking={booking} />
      </div>
    </div>
  );
}
