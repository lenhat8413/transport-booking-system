import Link from 'next/link';

export default function Home() {
  // A mock booking ID for testing purposes
  const testBookingId = '6601a4f9e1b2c3001c8b4567';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="card max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent mb-4">
          Hệ thống Đặt vé - Giao diện Demo
        </h1>
        <p className="text-gray-600 mb-8">
          Trang chủ hiện chưa được thiết lập. Để test luồng thanh toán và xác nhận đặt vé mà chúng ta vừa xây dựng, vui lòng chọn các liên kết bên dưới:
        </p>

        <div className="space-y-4">
          <Link 
            href={`/user/booking/checkout?bookingId=${testBookingId}`}
            className="btn-primary w-full flex justify-center py-4"
          >
            Bắt đầu luồng Booking Checkout Demo
          </Link>
          <div className="text-xs text-gray-400 mt-2">
            Mã test booking ID: {testBookingId}
          </div>
        </div>
      </div>
    </div>
  );
}
