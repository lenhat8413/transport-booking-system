const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  seat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seat",
    required: true,
  },
  passenger_name: { type: String, default: "" },
  passenger_id_card: { type: String, default: "" },
  base_price: { type: Number, required: true, default: 0 },
  seat_selection_fee: { type: Number, required: true, default: 0 },
  final_price: { type: Number, required: true },
  date_of_birth: { type: Date },
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
  passenger_type: { type: String, enum: ['ADULT', 'CHILD', 'INFANT'], default: 'ADULT' },
  contact_info: {
    phone: { type: String },
    email: { type: String }
  }
});

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
