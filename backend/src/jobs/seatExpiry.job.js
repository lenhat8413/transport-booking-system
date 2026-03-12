const Seat = require("../models/seats.model");
const Booking = require("../models/bookings.model");
const Payment = require("../models/payments.model");

// Job kiểm tra ghế và booking hết hạn giữ
async function releaseExpiredSeats() {
  try {
    const now = new Date();

    // 1. Tìm tất cả các Booking đã quá hạn 15 phút (expires_at < now) và đang chờ thanh toán
    const expiredBookings = await Booking.find({
      status: { $in: ["PENDING", "WAITING_PAYMENT"] },
      expires_at: { $lt: now }
    });

    if (expiredBookings.length > 0) {
      const expiredBookingIds = expiredBookings.map(b => b._id);

      // Cập nhật trạng thái Booking thành EXPIRED
      await Booking.updateMany(
        { _id: { $in: expiredBookingIds } },
        { $set: { status: "EXPIRED" } }
      );

      // Cập nhật trạng thái Payment thành FAILED (Hoặc CANCELLED)
      await Payment.updateMany(
        { booking_id: { $in: expiredBookingIds }, status: "PENDING" },
        { $set: { status: "FAILED" } }
      );

      // Nhả tất cả các ghế (Seat) thuộc về các Booking này lại thành AVAILABLE
      const releasedBookingSeats = await Seat.updateMany(
        { held_by_booking_id: { $in: expiredBookingIds } },
        {
          $set: {
            status: "AVAILABLE",
            held_by_booking_id: null,
            hold_expired_at: null
          }
        }
      );
      console.log(`[ExpiryJob] Hủy ${expiredBookingIds.length} Booking quá hạn. Giải phóng ${releasedBookingSeats.modifiedCount} ghế.`);
    }

    // 2. Tìm và nhả các ghế bị giữ tự do (qua API holdSeat ngoài lề nếu có) mà quá hạn
    const standaloneReleased = await Seat.updateMany(
      {
        status: "HELD",
        held_by_booking_id: null, // Chỉ nhắm vào ghế giữ tự do không gắn với Booking
        hold_expired_at: { $lt: now },
      },
      {
        $set: {
          status: "AVAILABLE",
          held_by_booking_id: null,
          hold_expired_at: null,
        },
      }
    );

    if (standaloneReleased.modifiedCount > 0) {
      console.log(`[ExpiryJob] Giải phóng thêm ${standaloneReleased.modifiedCount} ghế giữ tự do quá hạn.`);
    }

  } catch (err) {
    console.error("[ExpiryJob] Lỗi tự động hủy vé:", err);
  }
}

module.exports = releaseExpiredSeats;
