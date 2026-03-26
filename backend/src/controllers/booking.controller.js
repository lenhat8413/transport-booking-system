const Booking = require("../models/bookings.model");
const Payment = require("../models/payments.model");
const Seat = require("../models/seats.model");
const Ticket = require("../models/tickets.model");
const Voucher = require("../models/vouchers.model");
const FlightFare = require("../models/flightFares.model");
const Flight = require("../models/flights.model");
const TrainTrip = require("../models/trainTrips.model");
const Airport = require("../models/airports.model");
const TrainStation = require("../models/trainStations.model");
const Airline = require("../models/airlines.model");
const Train = require("../models/trains.model");

function mapBookingStatus(status) {
  if (status === "CONFIRMED") return "paid";
  if (status === "WAITING_PAYMENT" || status === "PENDING") return "pending";
  return "expired";
}

async function buildFlightBookingView(booking) {
  const flight = await Flight.findById(booking.trip_id).lean();
  if (!flight) return null;

  const [departureAirport, arrivalAirport, airline] = await Promise.all([
    Airport.findById(flight.departure_airport_id).lean(),
    Airport.findById(flight.arrival_airport_id).lean(),
    Airline.findById(flight.airline_id).lean(),
  ]);

  const origin = departureAirport?.city || "Ch\u01b0a x\u00e1c \u0111\u1ecbnh";
  const destination = arrivalAirport?.city || "Ch\u01b0a x\u00e1c \u0111\u1ecbnh";

  return {
    id: booking._id,
    code: booking.booking_code,
    route: `${origin} \u2192 ${destination}`,
    origin,
    destination,
    bookingDate: booking.created_at,
    departureDate: flight.departure_time,
    arrivalDate: flight.arrival_time,
    status: mapBookingStatus(booking.status),
    transportType: "flight",
    carrier: airline?.name || flight.flight_number || "Chuy\u1ebfn bay",
    price: booking.total_amount,
  };
}

async function buildTrainBookingView(booking) {
  const trainTrip = await TrainTrip.findById(booking.trip_id).lean();
  if (!trainTrip) return null;

  const [departureStation, arrivalStation, train] = await Promise.all([
    TrainStation.findById(trainTrip.departure_station_id).lean(),
    TrainStation.findById(trainTrip.arrival_station_id).lean(),
    Train.findById(trainTrip.train_id).lean(),
  ]);

  const origin = departureStation?.city || departureStation?.name || "Ch\u01b0a x\u00e1c \u0111\u1ecbnh";
  const destination = arrivalStation?.city || arrivalStation?.name || "Ch\u01b0a x\u00e1c \u0111\u1ecbnh";

  return {
    id: booking._id,
    code: booking.booking_code,
    route: `${origin} \u2192 ${destination}`,
    origin,
    destination,
    bookingDate: booking.created_at,
    departureDate: trainTrip.departure_time,
    arrivalDate: trainTrip.arrival_time,
    status: mapBookingStatus(booking.status),
    transportType: "train",
    carrier: train?.name || train?.train_number || "Chuy\u1ebfn t\u00e0u",
    price: booking.total_amount,
  };
}

const getRequestUserId = (req) => (req.user && req.user.userId ? req.user.userId : null);
const getAuthFailureMessage = (req) =>
  req.authError || "Vui long dang nhap de truy cap booking nay!";


// Táº¡o booking má»›i
exports.createBooking = async (req, res) => {
  try {
    const { trip_id, booking_type, seats, passengers } = req.body;
    const user_id = getRequestUserId(req);

    // 1. Kiá»ƒm tra tráº¡ng thÃ¡i hÃ ng gháº¿
    const seatDocs = await Seat.find({ _id: { $in: seats } });
    if (seatDocs.length !== seats.length) {
      return res.status(400).json({ message: 'Má»™t hoáº·c nhiá»u mÃ£ gháº¿ khÃ´ng tá»“n táº¡i.' });
    }

    let total_amount = 0;

    // Map Ä‘á»ƒ tra cá»©u giÃ¡ tá»«ng gháº¿ nhanh hÆ¡n (seat_id \u2192 final_price)
    const seatPriceMap = {};

    for (let seat of seatDocs) {
      if (seat.status === 'BOOKED' || seat.status === 'HELD') {
        return res.status(400).json({ message: `Gháº¿ ${seat.seat_number} Ä‘Ã£ cÃ³ ngÆ°á»i Ä‘áº·t hoáº·c Ä‘ang giá»¯.` });
      }

      // 2. Query báº£ng giÃ¡ tá»« FlightFare theo chuyáº¿n bay + háº¡ng gháº¿
      // Chá»‰ Ã¡p dá»¥ng cho FLIGHT; TRAIN dÃ¹ng base_price cá»§a TrainCarriage
      let seatPrice = 0;

      if (booking_type === 'FLIGHT') {
        const fare = await FlightFare.findOne({
          flight_id: trip_id,
          cabin_class: seat.class,
          is_active: true,
        });

        if (!fare) {
          return res.status(400).json({
            message: `KhÃ´ng tÃ¬m tháº¥y báº£ng giÃ¡ cho háº¡ng ${seat.class} trÃªn chuyáº¿n bay nÃ y. Vui lÃ²ng liÃªn há»‡ quáº£n trá»‹ viÃªn.`,
          });
        }

        // Æ¯u tiÃªn giÃ¡ khuyáº¿n mÃ£i, náº¿u khÃ´ng cÃ³ thÃ¬ dÃ¹ng giÃ¡ gá»‘c
        const effectivePrice = fare.promo_price != null ? fare.promo_price : fare.base_price;
        seatPrice = effectivePrice + (seat.price_modifier || 0);
      } else {
        // TRAIN
        seatPrice = seat.price_modifier || 0;
      }

      seatPriceMap[seat._id.toString()] = seatPrice;
      total_amount += seatPrice;
    }

    // 3. Táº¡o Booking
    const newBooking = new Booking({
      user_id: user_id,
      booking_code: "BKG" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000),
      booking_type: booking_type,
      trip_id: trip_id,
      total_amount: total_amount,
      status: 'WAITING_PAYMENT',
      expires_at: new Date(Date.now() + 15 * 60 * 1000),
    });

    await newBooking.save();

    // 4. Táº¡o Ticket vá»›i final_price Ä‘Ãºng tá»« báº£ng giÃ¡ Tra cá»©u Ä‘Æ°á»£c
    const ticketPromises = passengers.map(async (p) => {
      const finalPrice = seatPriceMap[p.seat_id.toString()] || 0;

      return Ticket.create({
        booking_id: newBooking._id,
        seat_id: p.seat_id,
        passenger_name: p.passenger_name,
        passenger_id_card: p.passenger_id_card,
        final_price: finalPrice,
      });
    });

    await Promise.all(ticketPromises);

    // 5. KhoÃ¡ gháº¿ Ä‘á»ƒ ngÄƒn ngÆ°á»i khÃ¡c Ä‘áº·t trÃ¹ng
    await Seat.updateMany(
      { _id: { $in: seats } },
      { $set: { status: 'HELD', held_by_booking_id: newBooking._id } }
    );

    res.status(201).json({
      message: "Booking created successfully, pending for payment",
      booking: newBooking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error!" });
  }
};

// Xá»­ lÃ½ thanh toÃ¡n
exports.processPayment = async (req, res) => {
  try {
    const { booking_id, method, transaction_id, amount, status } = req.body;
    const requestUserId = getRequestUserId(req);

    // kiá»ƒm tra booking tá»“n táº¡i
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found!" });
    }

    // kiá»ƒm tra booking thuá»™c user
    if (booking.user_id && !requestUserId) {
      return res.status(401).json({
        message: getAuthFailureMessage(req),
      });
    }

    if (booking.user_id && booking.user_id.toString() !== requestUserId) {
      return res.status(403).json({
        message: "You are not allowed to pay for this booking",
      });
    }

    const payment = new Payment({
      booking_id,
      method,
      transaction_id,
      amount,
      status,
      paid_at: new Date(),
    });

    await payment.save();

    // cáº­p nháº­t tráº¡ng thÃ¡i booking náº¿u thanh toÃ¡n thÃ nh cÃ´ng
    if (status === "SUCCESS") {
      booking.status = "CONFIRMED";
      await booking.save();
    }

    res.status(200).json({
      message: "Payment processed successfully!",
      payment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error!" });
  }
};

// Láº¥y táº¥t cáº£ booking cá»§a user Ä‘ang Ä‘Äƒng nháº­p
exports.getAllBookings = async (req, res) => {
  try {
    const requestUserId = getRequestUserId(req);

    if (!requestUserId) {
      return res.status(401).json({ message: getAuthFailureMessage(req) });
    }

    const bookings = await Booking.find({
      user_id: requestUserId,
    })
      .sort({ created_at: -1 })
      .lean();

    const data = (
      await Promise.all(
        bookings.map((booking) =>
          booking.booking_type === "FLIGHT"
            ? buildFlightBookingView(booking)
            : buildTrainBookingView(booking),
        ),
      )
    ).filter(Boolean);
    res.status(200).json({
      count: data.length,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error!" });
  }
};
// Ãp dá»¥ng Voucher vÃ o Booking
exports.applyVoucher = async (req, res) => {
  try {
    const { booking_id, voucher_code } = req.body;

    // KAN-209: Kiá»ƒm tra Ä‘áº§u vÃ o tá»“n táº¡i vÃ  tÃ¬m Booking
    if (!booking_id || !voucher_code) {
      return res.status(400).json({ success: false, message: "Thiáº¿u mÃ£ Booking hoáº·c MÃ£ giáº£m giÃ¡!" });
    }

    const Booking = require("../models/bookings.model");
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin chuyáº¿n Ä‘i (Booking)!" });
    }

    // CHECK Náº¾U ÄÃƒ ÃP Dá»¤NG VOUCHER Rá»’I
    if (booking.voucher_applied) {
      return res.status(400).json({ success: false, message: "Booking nÃ y Ä‘Ã£ Ä‘Æ°á»£c Ã¡p dá»¥ng mÃ£ giáº£m giÃ¡. KhÃ´ng thá»ƒ Ã¡p dá»¥ng thÃªm!" });
    }

    // TÆ°á»ng lá»­a chá»‘ng láº¥y trá»™m / sá»­a Booking ngÆ°á»i khÃ¡c
    const requestUserId = getRequestUserId(req);
    if (booking.user_id && !requestUserId) {
      return res.status(401).json({ success: false, message: getAuthFailureMessage(req) });
    }
    if (booking.user_id && booking.user_id.toString() !== requestUserId) {
      return res.status(403).json({ success: false, message: "Báº¡n khÃ´ng cÃ³ quyá»n sá»­a Ä‘á»•i Booking nÃ y!" });
    }

    // Cháº·n Ã¡p dá»¥ng lÃªn Booking Ä‘Ã£ ná»™p tiá»n
    if (booking.status !== "WAITING_PAYMENT" && booking.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Booking Ä‘Ã£ háº¿t háº¡n, Ä‘Ã£ há»§y hoáº·c Ä‘Ã£ hoÃ n táº¥t thanh toÃ¡n!" });
    }

    // KAN-209 & KAN-210: Kiá»ƒm tra Ä‘iá»u kiá»‡n kháº¯c nghiá»‡t cá»§a Voucher
    const voucher = await Voucher.findOne({ code: voucher_code.toUpperCase() });

    if (!voucher) {
      return res.status(404).json({ success: false, message: "MÃ£ giáº£m giÃ¡ khÃ´ng tá»“n táº¡i!" });
    }

    if (!voucher.is_active || voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ success: false, message: "MÃ£ giáº£m giÃ¡ Ä‘Ã£ háº¿t lÆ°á»£t sá»­ dá»¥ng hoáº·c bá»‹ vÃ´ hiá»‡u hÃ³a!" });
    }

    const now = new Date();
    if (now > voucher.expiry_date) {
      return res.status(400).json({ success: false, message: "MÃ£ giáº£m giÃ¡ Ä‘Ã£ háº¿t háº¡n sá»­ dá»¥ng!" });
    }

    if (booking.total_amount < voucher.min_order_value) {
      return res.status(400).json({ success: false, message: `MÃ£ giáº£m giÃ¡ chá»‰ Ã¡p dá»¥ng cho Ä‘Æ¡n hÃ ng tá»« ${voucher.min_order_value.toLocaleString()} VND!` });
    }

    // KAN-211: TÃ­nh toÃ¡n sá»‘ tiá»n Ä‘Æ°á»£c giáº£m giÃ¡
    let discount_amount = 0;
    if (voucher.discount_type === "PERCENTAGE") {
      // TÃ­nh theo %
      discount_amount = (booking.total_amount * voucher.discount_value) / 100;
      // Ãp tráº§n tá»‘i Ä‘a
      if (voucher.max_discount && discount_amount > voucher.max_discount) {
        discount_amount = voucher.max_discount;
      }
    } else {
      // FIXED - Trá»« tháº³ng tiá»n máº·t
      discount_amount = voucher.discount_value;
    }

    // Cháº·n sá»‘ Ã‚m (Náº¿u voucher 500k Ã¡p cho hoÃ¡ Ä‘Æ¡n 100k)
    if (discount_amount >= booking.total_amount) {
      discount_amount = booking.total_amount;
    }

    const old_total = booking.total_amount;
    const new_total = booking.total_amount - discount_amount;

    // KAN-212: TiÃªu hao lÆ°á»£t dÃ¹ng Voucher & Cáº­p nháº­t HoÃ¡ ÄÆ¡n
    voucher.used_count += 1;
    await voucher.save();

    booking.total_amount = new_total;
    booking.voucher_applied = voucher.code; // LÆ¯U Dáº¤U Váº¾T ÄÃƒ ÃP Dá»¤NG
    await booking.save(); // LÆ°u giÃ¡ má»›i vÃ o DB

    // Pháº£n há»“i vá» Frontend thÃ nh cÃ´ng
    res.status(200).json({
      success: true,
      message: "Ãp dá»¥ng mÃ£ giáº£m giÃ¡ thÃ nh cÃ´ng!",
      data: {
        booking_id: booking._id,
        voucher_code: voucher.code,
        old_total: old_total,
        discount_amount: discount_amount,
        final_total: new_total
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lá»—i há»‡ thá»‘ng khi Ã¡p dá»¥ng voucher!" });
  }
};


// â”€â”€â”€ KAN-213: Xem láº¡i toÃ n bá»™ thÃ´ng tin Booking trÆ°á»›c khi Checkout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // KAN-214 & KAN-215: TÃ¬m kiáº¿m Booking vÃ  kiá»ƒm tra tÃ­nh há»£p lá»‡
    const booking = await Booking.findById(bookingId).lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: "KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin chuyáº¿n Ä‘i (Booking)!" });
    }

    const requestUserId = getRequestUserId(req);
    if (booking.user_id && !requestUserId) {
      return res.status(401).json({ success: false, message: getAuthFailureMessage(req) });
    }
    if (booking.user_id && booking.user_id.toString() !== requestUserId) {
      return res.status(403).json({ success: false, message: "Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p thÃ´ng tin Booking nÃ y!" });
    }

    // KAN-216: Gom thÃ´ng tin HÃ nh KhÃ¡ch & Gháº¿ ngá»“i tá»« báº£ng Tickets
    const tickets = await Ticket.find({ booking_id: booking._id })
      .populate({
        path: 'seat_id',
        select: 'seat_number class price_modifier status'
      })
      .lean();

    let passengerDetails = [];
    let totalDiscount = 0;

    // KAN-217: GhÃ©p ná»‘i Dá»¯ liá»‡u Phá»¥ (TÃ­nh nÄƒng Voucher TÆ°Æ¡ng lai)
    if (tickets && tickets.length > 0) {
      passengerDetails = tickets.map(ticket => {
        return {
          ticket_id: ticket._id,
          passenger_name: ticket.passenger_name,
          id_card: ticket.passenger_id_card,
          seat_info: ticket.seat_id ? {
            id: ticket.seat_id._id,
            number: ticket.seat_id.seat_number,
            class: ticket.seat_id.class,
            additional_fee: ticket.seat_id.price_modifier
          } : null,
          final_price: ticket.final_price,
          date_of_birth: ticket.date_of_birth,
          gender: ticket.gender,
          passenger_type: ticket.passenger_type,
          contact_info: ticket.contact_info
        };
      });
    }

    // KAN-218: GÃ³i ghÃ©m táº¥t cáº£ Data tráº£ vá» cho Giao Diá»‡n Xong XuÃ´i
    res.status(200).json({
      success: true,
      data: {
        booking_summary: {
          id: booking._id,
          code: booking.booking_code,
          type: booking.booking_type,
          trip_id: booking.trip_id,
          status: booking.status,
          created_at: booking.created_at,
          expires_at: booking.expires_at,
        },
        financials: {
          total_amount: booking.total_amount, // ÄÃ£ tá»± gÃ¡nh tiá»n trá»« tá»« hÃ m Voucher trÆ°á»›c Ä‘Ã³
          discount_applied: totalDiscount
        },
        passengers: passengerDetails
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lá»—i há»‡ thá»‘ng khi táº£i thÃ´ng tin xÃ¡c nháº­n!" });
  }
};
