const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    method: {
      type: String,
      enum: ["VNPAY", "PAYPAL"],
      required: true,
    },
    transaction_id: {
      type: String,
      default: null,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    gateway_response: {
      type: Object,
    },
    paid_at: { type: Date, required: false },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
