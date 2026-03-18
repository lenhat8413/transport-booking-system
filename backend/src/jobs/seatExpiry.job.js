const Seat = require("../models/seats.model");
const Booking = require("../models/bookings.model");
const Payment = require("../models/payments.model");
const { emitSeatUpdate } = require("../socket");

/**
 * Giải phóng các ghế hết hạn và tự động hủy các Booking quá hạn thanh toán.
 * Kết hợp logic cập nhật database và thông báo Socket realtime.
 */
async function releaseExpiredSeats() {
  try {
    const now = new Date();
    // Tìm các Booking quá hạn (15 phút) và đang ở trạng thái chờ
    const expiredBookings = await Booking.find({
      status: { $in: ["PENDING", "WAITING_PAYMENT"] },
      expires_at: { $lt: now }
    });

    const expiredBookingIds = expiredBookings.map(b => b._id);

    if (expiredBookingIds.length > 0) {
      // 1. Cập nhật trạng thái Booking thành EXPIRED
      await Booking.updateMany(
        { _id: { $in: expiredBookingIds } },
        { $set: { status: "EXPIRED" } }
      );

      // 2. Cập nhật trạng thái Payment liên quan thành FAILED
      await Payment.updateMany(
        { booking_id: { $in: expiredBookingIds }, status: "PENDING" },
        { $set: { status: "FAILED" } }
      );

      console.log(`[SeatJob] Đã hủy ${expiredBookingIds.length} Booking quá hạn.`);
    }

    // 3. Tìm và giải phóng các ghế: Thuộc Booking vừa hết hạn HOẶC Ghế HELD đã quá hạn giữ (standalone hold)
    const expiredSeats = await Seat.find({
      $or: [
        { held_by_booking_id: { $in: expiredBookingIds } },
        { status: "HELD", hold_expired_at: { $lt: now } }
      ]
    });

    if (expiredSeats.length > 0) {
      const result = await Seat.updateMany(
        { _id: { $in: expiredSeats.map(s => s._id) } },
        {
          $set: {
            status: "AVAILABLE",
            held_by: null,
            held_by_booking_id: null,
            hold_expired_at: null,
          },
        }
      );

      console.log(`[SeatJob] Đã giải phóng ${result.modifiedCount} ghế.`);

      // 4. Phát tín hiệu Socket cho Frontend cập nhật lại trạng thái ghế
      expiredSeats.forEach((seat) => {
        // Tạm thời lấy flight_id làm tripId.
        const tripId = seat.flight_id?.toString();
        if (!tripId) return;

        try {
          emitSeatUpdate(tripId, "seat_released", {
            tripId,
            seatId: seat._id,
            seat_number: seat.seat_number,
            status: "AVAILABLE",
            updatedAt: now,
          });
        } catch (error) {
          console.error(`[SeatJob] Lỗi gửi socket cho ghế ${seat._id}:`, error);
        }
      });
    }

  } catch (err) {
    console.error("[ExpiryJob] Lỗi trong quá trình xử lý hết hạn:", err);
  }
}

module.exports = releaseExpiredSeats;
