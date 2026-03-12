const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
    uppercase: true, // Tự động viết hoa (VD: "tet2024" -> "TET2024")
    trim: true       // Tự động cắt khoảng trắng thừa
  },
  discount_type: {
    type: String,
    enum: ["PERCENTAGE", "FIXED"], // Giảm theo % hoặc Cố định tiền mặt
    required: true
  },
  discount_value: {
    type: Number,
    required: true // Ví dụ: 100 (100k) hoặc 10 (10%)
  },
  min_order_value: {
    type: Number,
    default: 0 // Đơn hàng tối thiểu để áp dụng voucher
  },
  max_discount: {
    type: Number,
    default: null // Số tiền giảm tối đa (chủ yếu dùng cho PERCENTAGE)
  },
  usage_limit: {
    type: Number,
    default: 100 // Tổng số lượt xài của voucher này
  },
  used_count: {
    type: Number,
    default: 0 // Số lượt đã có người dùng thật
  },
  expiry_date: {
    type: Date,
    required: true // Hạn chót sử dụng
  },
  is_active: {
    type: Boolean,
    default: true
  },
}, { timestamps: true }); // Tự động có created_at, updated_at

const Voucher = mongoose.model("Voucher", voucherSchema);
module.exports = Voucher;
