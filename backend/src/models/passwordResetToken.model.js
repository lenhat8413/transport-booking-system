const mongoose = require("mongoose");

const passwordResetTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  otp_hash: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // MongoDB TTL: tự xóa khi hết hạn
  },
  used: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const PasswordResetToken = mongoose.model(
  "PasswordResetToken",
  passwordResetTokenSchema,
);

module.exports = PasswordResetToken;
