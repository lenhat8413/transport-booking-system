const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: null }, // Mở cho khách vãng lai
  booking_code: { type: String, required: true, unique: true },
  booking_contact: {
    full_name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    id_card: { type: String, default: "" },
  },
  booking_type: { type: String, enum: ["FLIGHT", "TRAIN"], required: true },
  trip_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  total_amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["PENDING", "WAITING_PAYMENT", "CONFIRMED", "CANCELLED", "EXPIRED"],
    default: "PENDING",
  },
  voucher_applied: { type: String, default: null }, // Lưu mã giảm giá đã áp dụng
  expires_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
