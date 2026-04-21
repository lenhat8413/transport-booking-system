/*
const mongoose = require("mongoose");
const User = require("../models/users.model");
const Airline = require("../models/airlines.model");
const Airport = require("../models/airports.model");
const Flight = require("../models/flights.model");
const Seat = require("../models/seats.model");
const Booking = require("../models/bookings.model");
const Payment = require("../models/payments.model");
const Voucher = require("../models/vouchers.model");
const Train = require("../models/trains.model");
const TrainStation = require("../models/trainStations.model");
const TrainTrip = require("../models/trainTrips.model");
const TrainCarriage = require("../models/trainCarriages.model");

async function seed() {
  try {
    await mongoose.connect("mongodb://localhost:27017/transport_booking");
    console.log("Connected to MongoDB!");

    // Kiểm tra sự tồn tại của user và thêm nếu không có
    let user = await User.findOne({ email: "john.doe@example.com" });
    if (!user) {
      user = new User({
        full_name: "John Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
        password_hash: "hashedpassword",
        role: "USER",
        status: "ACTIVE",
        created_at: new Date(),
      });
      await user.save();
    }

    // Kiểm tra sự tồn tại của airline và thêm nếu không có
    let airline = await Airline.findOne({ iata_code: "AI1" });
    if (!airline) {
      airline = new Airline({
        name: "Airline1",
        iata_code: "AI1",
        logo_url: "https://example.com/logo.png",
      });
      await airline.save();
    }

    // Kiểm tra sự tồn tại của airports và thêm nếu không có
    let departureAirport = await Airport.findOne({ iata_code: "D1" });
    if (!departureAirport) {
      departureAirport = new Airport({
        iata_code: "D1",
        name: "Airport1",
        city: "City1",
        country: "Country1",
      });
      await departureAirport.save();
    }

    let arrivalAirport = await Airport.findOne({ iata_code: "A1" });
    if (!arrivalAirport) {
      arrivalAirport = new Airport({
        iata_code: "A1",
        name: "Airport2",
        city: "City2",
        country: "Country2",
      });
      await arrivalAirport.save();
    }

    // Kiểm tra sự tồn tại của flight và thêm nếu không có
    let flight = await Flight.findOne({ flight_number: "AI101" });
    if (!flight) {
      flight = new Flight({
        airline_id: airline._id,
        flight_number: "AI101",
        departure_airport_id: departureAirport._id,
        arrival_airport_id: arrivalAirport._id,
        departure_time: new Date("2026-05-15T10:00:00Z"),
        arrival_time: new Date("2026-05-15T12:00:00Z"),
        status: "SCHEDULED",
      });
      await flight.save();
    }

    // Kiểm tra sự tồn tại của train và thêm nếu không có
    let train = await Train.findOne({ train_number: "T1001" });
    if (!train) {
      train = new Train({
        train_number: "T1001",
        name: "Train Express",
      });
      await train.save();
    }

    // Kiểm tra sự tồn tại của train stations và thêm nếu không có
    let departureStation = await TrainStation.findOne({
      name: "Train Station 1",
    });
    if (!departureStation) {
      departureStation = new TrainStation({
        name: "Train Station 1",
        city: "City1",
      });
      await departureStation.save();
    }

    let arrivalStation = await TrainStation.findOne({
      name: "Train Station 2",
    });
    if (!arrivalStation) {
      arrivalStation = new TrainStation({
        name: "Train Station 2",
        city: "City2",
      });
      await arrivalStation.save();
    }

    // Kiểm tra sự tồn tại của train trips và thêm nếu không có
    let trainTrip = await TrainTrip.findOne({ train_id: train._id });
    if (!trainTrip) {
      trainTrip = new TrainTrip({
        train_id: train._id,
        departure_station_id: departureStation._id,
        arrival_station_id: arrivalStation._id,
        departure_time: new Date("2026-05-16T08:00:00Z"),
        arrival_time: new Date("2026-05-16T14:00:00Z"),
        status: "SCHEDULED",
      });
      await trainTrip.save();
    }

    // Kiểm tra sự tồn tại của train carriages và thêm nếu không có
    let trainCarriage = await TrainCarriage.findOne({
      train_trip_id: trainTrip._id,
    });
    if (!trainCarriage) {
      trainCarriage = new TrainCarriage({
        train_trip_id: trainTrip._id,
        carriage_number: "1",
        type: "ECONOMY",
        base_price: 100,
      });
      await trainCarriage.save();
    }

    // Kiểm tra sự tồn tại của bookings và thêm nếu không có
    let booking = await Booking.findOne({ booking_code: "BC123" });
    if (!booking) {
      booking = new Booking({
        user_id: user._id,
        booking_code: "BC123",
        booking_type: "FLIGHT",
        trip_id: flight._id, // THÊM TRIP_ID (DÙNG ID CỦA FLIGHT)
        total_amount: 500,
        status: "PENDING",
      });
      await booking.save();
    }

    // Kiểm tra sự tồn tại của seats và thêm nếu không có
    const flightSeatsData = [
      {
        seat_number: "1A",
        class: "ECONOMY",
        status: "AVAILABLE",
        flight_id: flight._id,
      },
      {
        seat_number: "2B",
        class: "BUSINESS",
        status: "HELD",
        flight_id: flight._id,
        held_by_booking_id: booking._id,
        hold_expired_at: new Date(Date.now() + 15 * 60 * 1000),
      },
    ];

    for (const s of flightSeatsData) {
      const exists = await Seat.findOne({ flight_id: s.flight_id, seat_number: s.seat_number });
      if (!exists) {
        await new Seat(s).save();
      }
    }

    // TẠO THÊM GHẾ CHO TÀU LỬA (TRAIN SEATS)
    const trainSeats = [];
    for (let i = 1; i <= 40; i++) {
      const seatNumber = `${i}`;
      const exists = await Seat.findOne({ carriage_id: trainCarriage._id, seat_number: seatNumber });

      if (!exists) {
        trainSeats.push({
          seat_number: seatNumber,
          class: trainCarriage.type, // Kế thừa từ Toa tàu (ECONOMY/BUSINESS)
          status: "AVAILABLE",
          carriage_id: trainCarriage._id,
          price_modifier: 0
        });
      }
    }

    if (trainSeats.length > 0) {
      await Seat.insertMany(trainSeats);
      console.log(`Đã thêm ${trainSeats.length} ghế cho toa tàu số ${trainCarriage.carriage_number}`);
    }

    // Kiểm tra sự tồn tại của payments và thêm nếu không có
    let payment = await Payment.findOne({ transaction_id: "TX123" });
    if (!payment) {
      payment = new Payment({
        booking_id: booking._id,
        method: "VNPAY",
        transaction_id: "TX123",
        amount: 500,
        status: "SUCCESS",
        paid_at: new Date(),
      });
      await payment.save();
    }

    // Kiểm tra sự tồn tại của vouchers và thêm nếu không có
    let voucher = await Voucher.findOne({ code: "VOUCHER10" });
    if (!voucher) {
      voucher = new Voucher({
        code: "VOUCHER10",
        discount_type: "PERCENTAGE", // THÊM LOẠI GIẢM GIÁ
        discount_value: 10,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // HẠN 30 NGÀY
        is_active: true,
      });
      await voucher.save();
    }

    console.log("Seed data inserted!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error seeding data:", err);
    mongoose.disconnect();
  }
}

seed();
*/

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const env = require('../config/env');
const User = require('../models/users.model');
const Airline = require('../models/airlines.model');
const Airport = require('../models/airports.model');
const Flight = require('../models/flights.model');
const FlightFare = require('../models/flightFares.model');
const Train = require('../models/trains.model');
const TrainStation = require('../models/trainStations.model');
const TrainTrip = require('../models/trainTrips.model');
const TrainCarriage = require('../models/trainCarriages.model');
const Seat = require('../models/seats.model');
const Booking = require('../models/bookings.model');
const Ticket = require('../models/tickets.model');
const Payment = require('../models/payments.model');
const Voucher = require('../models/vouchers.model');
const PaymentMethod = require('../models/paymentMethods.model');
const PassengerDraft = require('../models/passengerDrafts.model');
const PasswordResetToken = require('../models/passwordResetToken.model');

const {
  AIRLINES,
  AIRPORTS,
  BOOKING_CONTACT_FACTORY,
  DEMO_PASSWORD,
  FLIGHT_BATCHES,
  FLIGHT_ROUTE_TEMPLATES,
  PAYMENT_METHOD_TEMPLATES,
  TRAIN_STATIONS,
  TRAIN_TRIP_TEMPLATES,
  USER_TEMPLATES,
  VOUCHER_TEMPLATES,
  vnDate,
} = require('./seed.data');

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function seatSelectionFee(seatClass) {
  return seatClass === 'ECONOMY' ? 450000 : 0;
}

function getEffectiveFarePrice(fare) {
  return fare.promo_price != null ? fare.promo_price : fare.base_price;
}

function applyVoucherDiscount(subtotal, voucher) {
  if (!voucher || !voucher.is_active) return 0;
  if (subtotal < (voucher.min_order_value || 0)) return 0;

  let discount = voucher.discount_type === 'PERCENTAGE'
    ? (subtotal * voucher.discount_value) / 100
    : voucher.discount_value;

  if (voucher.discount_type === 'PERCENTAGE' && voucher.max_discount && discount > voucher.max_discount) {
    discount = voucher.max_discount;
  }

  return Math.min(subtotal, Math.round(discount));
}

async function resetDatabase() {
  await Promise.all([
    PasswordResetToken.deleteMany({}),
    PassengerDraft.deleteMany({}),
    Payment.deleteMany({}),
    Ticket.deleteMany({}),
    PaymentMethod.deleteMany({}),
    Booking.deleteMany({}),
    Seat.deleteMany({}),
    FlightFare.deleteMany({}),
    Flight.deleteMany({}),
    TrainCarriage.deleteMany({}),
    TrainTrip.deleteMany({}),
    Train.deleteMany({}),
    TrainStation.deleteMany({}),
    Airport.deleteMany({}),
    Airline.deleteMany({}),
    Voucher.deleteMany({}),
    User.deleteMany({}),
  ]);
}

async function seedUsers() {
  const password_hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const docs = await User.insertMany(USER_TEMPLATES.map((user) => ({ ...user, password_hash })));
  return new Map(docs.map((doc) => [doc.email, doc]));
}

async function seedBasicCollections() {
  const [userMap, airlines, airports, stations, vouchers] = await Promise.all([
    seedUsers(),
    Airline.insertMany(AIRLINES),
    Airport.insertMany(AIRPORTS),
    TrainStation.insertMany(TRAIN_STATIONS),
    Voucher.insertMany(VOUCHER_TEMPLATES),
  ]);

  return {
    userMap,
    airlineMap: new Map(airlines.map((doc) => [doc.iata_code, doc])),
    airportMap: new Map(airports.map((doc) => [doc.iata_code, doc])),
    stationMap: new Map(stations.map((doc) => [doc.name, doc])),
    voucherMap: new Map(vouchers.map((doc) => [doc.code, doc])),
  };
}

function buildFlightDrafts(airlineMap, airportMap) {
  const counters = { VN: 200, VJ: 140, QH: 240 };
  const docs = [];
  const refs = [];

  FLIGHT_BATCHES.forEach((batch, batchIndex) => {
    FLIGHT_ROUTE_TEMPLATES.forEach((route, routeIndex) => {
      const airlineCode = AIRLINES[(routeIndex + batchIndex) % AIRLINES.length].iata_code;
      let hour = route.departure_hour + batch.hour_offset;
      let day = batch.day_start + Math.floor(routeIndex / 2);
      if (hour >= 24) {
        hour -= 24;
        day += 1;
      }

      const departure_time = vnDate(2026, batch.month, day, hour, route.departure_minute);
      const flight_number = `${airlineCode}${String(counters[airlineCode]).padStart(3, '0')}`;
      counters[airlineCode] += 1;

      docs.push({
        airline_id: airlineMap.get(airlineCode)._id,
        flight_number,
        departure_airport_id: airportMap.get(route.from)._id,
        arrival_airport_id: airportMap.get(route.to)._id,
        departure_time,
        arrival_time: addMinutes(departure_time, route.duration_minutes),
        status: 'SCHEDULED',
        prices: { economy: route.economy, business: route.business },
      });

      refs.push({ flight_number, month: batch.month, route });
    });
  });

  return { docs, refs };
}

function buildFlightFareDocs(flights, refs) {
  return flights.flatMap((flight, index) => {
    const route = refs[index].route;
    const economyPromo = route.economy >= 1000000 ? route.economy - 120000 : route.economy - 60000;

    return [
      {
        flight_id: flight._id,
        cabin_class: 'ECONOMY',
        fare_name: 'Eco Standard',
        base_price: route.economy,
        promo_price: economyPromo,
        baggage_kg: 20,
        carry_on_kg: 7,
        is_refundable: false,
        change_fee: 350000,
        available_seats: 36,
        is_active: true,
      },
      {
        flight_id: flight._id,
        cabin_class: 'BUSINESS',
        fare_name: 'Business Flex',
        base_price: route.business,
        promo_price: null,
        baggage_kg: 32,
        carry_on_kg: 10,
        is_refundable: true,
        change_fee: 0,
        available_seats: 8,
        is_active: true,
      },
    ];
  });
}

function buildFlightSeatDocs(flights) {
  const docs = [];
  flights.forEach((flight) => {
    for (let row = 1; row <= 2; row += 1) {
      ['A', 'B', 'C', 'D'].forEach((suffix) => {
        docs.push({ flight_id: flight._id, seat_number: `${row}${suffix}`, class: 'BUSINESS', status: 'AVAILABLE', price_modifier: 0 });
      });
    }

    for (let row = 3; row <= 8; row += 1) {
      ['A', 'B', 'C', 'D', 'E', 'F'].forEach((suffix) => {
        docs.push({ flight_id: flight._id, seat_number: `${row}${suffix}`, class: 'ECONOMY', status: 'AVAILABLE', price_modifier: row === 3 || row === 4 ? 120000 : 0 });
      });
    }
  });
  return docs;
}

function buildTrainDrafts(stationMap) {
  return TRAIN_TRIP_TEMPLATES.map((template) => {
    const departure_time = vnDate(...template.departure);
    return {
      train: { train_number: template.train_number, name: template.name },
      trip: {
        train_number: template.train_number,
        departure_station_id: stationMap.get(template.from)._id,
        arrival_station_id: stationMap.get(template.to)._id,
        departure_time,
        arrival_time: addMinutes(departure_time, template.duration_minutes),
        status: 'SCHEDULED',
      },
      pricing: { economy: template.economy, business: template.business },
    };
  });
}

function buildTrainCarriageDocs(trips, pricingByTrainNumber) {
  return trips.flatMap((trip) => {
    const pricing = pricingByTrainNumber.get(trip.train_number);
    return [
      { train_trip_id: trip._id, carriage_number: 'A1', type: 'BUSINESS', base_price: pricing.business },
      { train_trip_id: trip._id, carriage_number: 'B1', type: 'ECONOMY', base_price: pricing.economy },
      { train_trip_id: trip._id, carriage_number: 'B2', type: 'ECONOMY', base_price: pricing.economy + 50000 },
    ];
  });
}

function buildTrainSeatDocs(carriages) {
  const docs = [];
  carriages.forEach((carriage) => {
    const seatCount = carriage.type === 'BUSINESS' ? 16 : 32;
    for (let index = 1; index <= seatCount; index += 1) {
      docs.push({ carriage_id: carriage._id, seat_number: String(index).padStart(2, '0'), class: carriage.type, status: 'AVAILABLE', price_modifier: 0 });
    }
  });
  return docs;
}

function buildSeatLookupByField(seats, fieldName) {
  const lookup = new Map();
  seats.forEach((seat) => {
    const key = seat[fieldName].toString();
    if (!lookup.has(key)) lookup.set(key, new Map());
    lookup.get(key).set(seat.seat_number, seat);
  });
  return lookup;
}

function buildFareLookup(fares) {
  return new Map(fares.map((fare) => [`${fare.flight_id.toString()}-${fare.cabin_class}`, fare]));
}

async function seedPaymentMethods(userMap) {
  await PaymentMethod.insertMany(
    PAYMENT_METHOD_TEMPLATES.map((method) => ({
      user_id: userMap.get(method.email)._id,
      card_type: method.card_type,
      bank_name: method.bank_name,
      card_holder: method.card_holder,
      last4: method.last4,
      expiry: method.expiry,
      is_default: method.is_default,
      created_at: vnDate(2026, 4, 1, 10, 0),
      updated_at: vnDate(2026, 4, 1, 10, 0),
    })),
  );
}

async function syncFlightFareAvailability(flights) {
  for (const flight of flights) {
    const [availableEconomy, availableBusiness] = await Promise.all([
      Seat.countDocuments({ flight_id: flight._id, class: 'ECONOMY', status: 'AVAILABLE' }),
      Seat.countDocuments({ flight_id: flight._id, class: 'BUSINESS', status: 'AVAILABLE' }),
    ]);

    await Promise.all([
      FlightFare.updateMany({ flight_id: flight._id, cabin_class: 'ECONOMY' }, { $set: { available_seats: availableEconomy } }),
      FlightFare.updateMany({ flight_id: flight._id, cabin_class: 'BUSINESS' }, { $set: { available_seats: availableBusiness } }),
    ]);
  }
}

async function seedBookingsAndPayments({ userMap, voucherMap, flightLookup, flightSeatLookup, fareLookup, trainTripMap, carriageMap, carriageSeatLookup }) {
  const bookingTemplates = [
    {
      booking_code: 'BK-FL-260401',
      booking_type: 'FLIGHT',
      user_email: 'le.haanh@demo.vn',
      booking_contact: BOOKING_CONTACT_FACTORY({ full_name: 'Le Ha Anh', email: 'le.haanh@demo.vn', phone: '0901234567', id_card: '079123456701' }),
      trip: { route: 'HAN-SGN-6', class: 'ECONOMY', seat_numbers: ['3A', '3B'] },
      passengers: [
        { passenger_name: 'LE HA ANH', passenger_id_card: '079123456701', date_of_birth: vnDate(1993, 6, 18, 0, 0), gender: 'FEMALE', passenger_type: 'ADULT', contact_info: { phone: '0901234567', email: 'le.haanh@demo.vn' } },
        { passenger_name: 'LE MINH THU', passenger_id_card: '079123456799', date_of_birth: vnDate(1996, 11, 2, 0, 0), gender: 'FEMALE', passenger_type: 'ADULT', contact_info: { phone: '0901234567', email: 'le.haanh@demo.vn' } },
      ],
      voucher_code: 'HEVANG200',
      status: 'CONFIRMED',
      created_at: vnDate(2026, 4, 10, 9, 15),
      payment: { method: 'VNPAY', transaction_id: 'VNPAY-DEMO-260401', status: 'SUCCESS', paid_at: vnDate(2026, 4, 10, 9, 20) },
    },
    {
      booking_code: 'BK-TR-260402',
      booking_type: 'TRAIN',
      user_email: 'tran.linhchi@demo.vn',
      booking_contact: BOOKING_CONTACT_FACTORY({ full_name: 'Tran Linh Chi', email: 'tran.linhchi@demo.vn', phone: '0912345678', id_card: '079234567802' }),
      trip: { train_number: 'SE7', carriage_number: 'B1', seat_numbers: ['05', '06'] },
      passengers: [
        { passenger_name: 'TRAN LINH CHI', passenger_id_card: '079234567802', date_of_birth: vnDate(1994, 3, 9, 0, 0), gender: 'FEMALE', passenger_type: 'ADULT', contact_info: { phone: '0912345678', email: 'tran.linhchi@demo.vn' } },
        { passenger_name: 'TRAN GIA HUY', passenger_id_card: '079234567855', date_of_birth: vnDate(2015, 8, 21, 0, 0), gender: 'MALE', passenger_type: 'CHILD', contact_info: { phone: '0912345678', email: 'tran.linhchi@demo.vn' } },
      ],
      voucher_code: 'TAUVIET10',
      status: 'CONFIRMED',
      created_at: vnDate(2026, 4, 9, 11, 10),
      payment: { method: 'PAYPAL', transaction_id: 'PAYPAL-DEMO-260402', status: 'SUCCESS', paid_at: vnDate(2026, 4, 9, 11, 20) },
    },
    {
      booking_code: 'BK-FL-260403',
      booking_type: 'FLIGHT',
      user_email: 'pham.khangminh@demo.vn',
      booking_contact: BOOKING_CONTACT_FACTORY({ full_name: 'Pham Khang Minh', email: 'pham.khangminh@demo.vn', phone: '0923456789', id_card: '079345678903' }),
      trip: { route: 'SGN-PQC-7', class: 'ECONOMY', seat_numbers: ['4C'] },
      passengers: [
        { passenger_name: 'PHAM KHANG MINH', passenger_id_card: '079345678903', date_of_birth: vnDate(1991, 1, 12, 0, 0), gender: 'MALE', passenger_type: 'ADULT', contact_info: { phone: '0923456789', email: 'pham.khangminh@demo.vn' } },
      ],
      voucher_code: null,
      status: 'WAITING_PAYMENT',
      created_at: vnDate(2026, 4, 12, 9, 30),
      expires_at: new Date(Date.now() + env.seatHoldTtlMinutes * 60 * 1000),
      payment: { method: 'VNPAY', transaction_id: 'VNPAY-DEMO-260403', status: 'PENDING' },
    },
    {
      booking_code: 'BK-TR-260404',
      booking_type: 'TRAIN',
      user_email: 'tran.linhchi@demo.vn',
      booking_contact: BOOKING_CONTACT_FACTORY({ full_name: 'Tran Linh Chi', email: 'tran.linhchi@demo.vn', phone: '0912345678', id_card: '079234567802' }),
      trip: { train_number: 'NA1', carriage_number: 'B1', seat_numbers: ['07'] },
      passengers: [
        { passenger_name: 'TRAN LINH CHI', passenger_id_card: '079234567802', date_of_birth: vnDate(1994, 3, 9, 0, 0), gender: 'FEMALE', passenger_type: 'ADULT', contact_info: { phone: '0912345678', email: 'tran.linhchi@demo.vn' } },
      ],
      voucher_code: null,
      status: 'CANCELLED',
      created_at: vnDate(2026, 3, 18, 14, 45),
      payment: { method: 'PAYPAL', transaction_id: 'PAYPAL-DEMO-260404', status: 'FAILED' },
    },
    {
      booking_code: 'BK-FL-260405',
      booking_type: 'FLIGHT',
      user_email: null,
      booking_contact: BOOKING_CONTACT_FACTORY({ full_name: 'Nguyen Quoc Huy', email: 'nguyen.quochuy@example.com', phone: '0945678901', id_card: '079567890105' }),
      trip: { route: 'DAD-UIH-6', class: 'BUSINESS', seat_numbers: ['1A'] },
      passengers: [
        { passenger_name: 'NGUYEN QUOC HUY', passenger_id_card: '079567890105', date_of_birth: vnDate(1988, 9, 7, 0, 0), gender: 'MALE', passenger_type: 'ADULT', contact_info: { phone: '0945678901', email: 'nguyen.quochuy@example.com' } },
      ],
      voucher_code: null,
      status: 'CONFIRMED',
      created_at: vnDate(2026, 3, 25, 8, 30),
      payment: { method: 'VNPAY', transaction_id: 'VNPAY-DEMO-260405', status: 'SUCCESS', paid_at: vnDate(2026, 3, 25, 8, 35) },
    },
    {
      booking_code: 'BK-TR-260406',
      booking_type: 'TRAIN',
      user_email: 'pham.khangminh@demo.vn',
      booking_contact: BOOKING_CONTACT_FACTORY({ full_name: 'Pham Khang Minh', email: 'pham.khangminh@demo.vn', phone: '0923456789', id_card: '079345678903' }),
      trip: { train_number: 'DN1', carriage_number: 'A1', seat_numbers: ['03'] },
      passengers: [
        { passenger_name: 'PHAM KHANG MINH', passenger_id_card: '079345678903', date_of_birth: vnDate(1991, 1, 12, 0, 0), gender: 'MALE', passenger_type: 'ADULT', contact_info: { phone: '0923456789', email: 'pham.khangminh@demo.vn' } },
      ],
      voucher_code: null,
      status: 'EXPIRED',
      created_at: vnDate(2026, 4, 1, 15, 0),
      expires_at: vnDate(2026, 4, 1, 15, 15),
    },
    {
      booking_code: 'BK-FL-260407',
      booking_type: 'FLIGHT',
      user_email: 'le.haanh@demo.vn',
      booking_contact: BOOKING_CONTACT_FACTORY({ full_name: 'Le Ha Anh', email: 'le.haanh@demo.vn', phone: '0901234567', id_card: '079123456701' }),
      trip: { route: 'SGN-BMV-7', class: 'ECONOMY', seat_numbers: ['5D'] },
      passengers: [
        { passenger_name: 'LE HA ANH', passenger_id_card: '079123456701', date_of_birth: vnDate(1993, 6, 18, 0, 0), gender: 'FEMALE', passenger_type: 'ADULT', contact_info: { phone: '0901234567', email: 'le.haanh@demo.vn' } },
      ],
      voucher_code: 'WELCOME50K',
      status: 'CONFIRMED',
      created_at: vnDate(2026, 4, 3, 13, 20),
      payment: { method: 'PAYPAL', transaction_id: 'PAYPAL-DEMO-260407', status: 'SUCCESS', paid_at: vnDate(2026, 4, 3, 13, 30) },
    },
  ];

  const ticketDocs = [];
  const paymentDocs = [];
  const seatUpdates = [];

  for (const template of bookingTemplates) {
    const user = template.user_email ? userMap.get(template.user_email) : null;
    const voucher = template.voucher_code ? voucherMap.get(template.voucher_code) : null;

    let tripId;
    let seatClass;
    let basePrice;
    let selectedSeats;

    if (template.booking_type === 'FLIGHT') {
      const flight = flightLookup.get(template.trip.route);
      const fare = fareLookup.get(`${flight._id.toString()}-${template.trip.class}`);
      const seatMap = flightSeatLookup.get(flight._id.toString());
      tripId = flight._id;
      seatClass = template.trip.class;
      basePrice = getEffectiveFarePrice(fare);
      selectedSeats = template.trip.seat_numbers.map((seatNumber) => seatMap.get(seatNumber));
    } else {
      const trip = trainTripMap.get(template.trip.train_number);
      const carriage = carriageMap.get(`${trip._id.toString()}-${template.trip.carriage_number}`);
      const seatMap = carriageSeatLookup.get(carriage._id.toString());
      tripId = trip._id;
      seatClass = carriage.type;
      basePrice = carriage.base_price;
      selectedSeats = template.trip.seat_numbers.map((seatNumber) => seatMap.get(seatNumber));
    }

    const seatFee = seatSelectionFee(seatClass);
    const subtotal = selectedSeats.length * (basePrice + seatFee);
    const discount = applyVoucherDiscount(subtotal, voucher);

    const booking = await Booking.create({
      user_id: user ? user._id : null,
      booking_code: template.booking_code,
      booking_contact: template.booking_contact,
      booking_type: template.booking_type,
      trip_id: tripId,
      total_amount: subtotal - discount,
      status: template.status,
      voucher_applied: voucher ? voucher.code : null,
      expires_at: template.expires_at || null,
      created_at: template.created_at,
    });

    template.passengers.forEach((passenger, index) => {
      const seat = selectedSeats[index];
      ticketDocs.push({
        booking_id: booking._id,
        seat_id: seat._id,
        passenger_name: passenger.passenger_name,
        passenger_id_card: passenger.passenger_id_card,
        base_price: basePrice,
        seat_selection_fee: seatFee,
        final_price: basePrice + seatFee,
        date_of_birth: passenger.date_of_birth,
        gender: passenger.gender,
        passenger_type: passenger.passenger_type,
        contact_info: passenger.contact_info,
      });

      seatUpdates.push({
        _id: seat._id,
        status: template.status === 'CONFIRMED' ? 'BOOKED' : template.status === 'WAITING_PAYMENT' || template.status === 'PENDING' ? 'HELD' : 'AVAILABLE',
        held_by: template.status === 'WAITING_PAYMENT' || template.status === 'PENDING' ? (user ? user._id : null) : null,
        held_by_booking_id: template.status === 'CONFIRMED' || template.status === 'WAITING_PAYMENT' || template.status === 'PENDING' ? booking._id : null,
        hold_expired_at: template.status === 'WAITING_PAYMENT' || template.status === 'PENDING' ? (template.expires_at || new Date(Date.now() + env.seatHoldTtlMinutes * 60 * 1000)) : null,
      });
    });

    if (template.payment) {
      paymentDocs.push({
        booking_id: booking._id,
        method: template.payment.method,
        transaction_id: template.payment.transaction_id,
        amount: subtotal - discount,
        status: template.payment.status,
        gateway_response: { provider: template.payment.method, demo_seed: true, booking_code: template.booking_code },
        paid_at: template.payment.paid_at || undefined,
      });
    }
  }

  if (ticketDocs.length) await Ticket.insertMany(ticketDocs);
  if (paymentDocs.length) await Payment.insertMany(paymentDocs);
  if (seatUpdates.length) {
    await Promise.all(
      seatUpdates.map(({ _id, ...seat }) => Seat.updateOne({ _id }, { $set: seat })),
    );
  }
}

async function seedPassengerDraft({ userMap, flightLookup, flightSeatLookup, fareLookup }) {
  const user = userMap.get('tran.linhchi@demo.vn');
  const flight = flightLookup.get('HAN-DAD-7');
  const seatMap = flightSeatLookup.get(flight._id.toString());
  const fare = fareLookup.get(`${flight._id.toString()}-ECONOMY`);
  const finalPrice = getEffectiveFarePrice(fare) + seatSelectionFee('ECONOMY');
  const seats = ['6A', '6B'].map((seatNumber) => seatMap.get(seatNumber));

  await PassengerDraft.create({
    user_id: user._id,
    trip_id: flight._id,
    seats: seats.map((seat) => seat._id),
    passengers: [
      { seat_id: seats[0]._id, passenger_name: 'TRAN LINH CHI', passenger_id_card: '079234567802', date_of_birth: vnDate(1994, 3, 9, 0, 0), gender: 'FEMALE', contact_info: { phone: '0912345678', email: 'tran.linhchi@demo.vn' }, passenger_type: 'ADULT', final_price: finalPrice },
      { seat_id: seats[1]._id, passenger_name: 'TRAN KHANH AN', passenger_id_card: '079234567899', date_of_birth: vnDate(2018, 5, 12, 0, 0), gender: 'FEMALE', contact_info: { phone: '0912345678', email: 'tran.linhchi@demo.vn' }, passenger_type: 'CHILD', final_price: finalPrice },
    ],
    created_at: new Date(),
  });
}

async function seedDemoData() {
  console.log(`[seed] Connecting to ${env.mongoUri}`);
  await mongoose.connect(env.mongoUri);

  try {
    console.log('[seed] Clearing old data');
    await resetDatabase();

    console.log('[seed] Seeding master collections');
    const { userMap, airlineMap, airportMap, stationMap, voucherMap } = await seedBasicCollections();

    console.log('[seed] Seeding flights, fares, and flight seats');
    const { docs: flightDocs, refs: flightRefs } = buildFlightDrafts(airlineMap, airportMap);
    const flights = await Flight.insertMany(flightDocs);
    const flightLookup = new Map(flightRefs.map((ref, index) => [`${ref.route.from}-${ref.route.to}-${ref.month}`, flights[index]]));
    const flightFares = await FlightFare.insertMany(buildFlightFareDocs(flights, flightRefs));
    const flightSeats = await Seat.insertMany(buildFlightSeatDocs(flights));
    const fareLookup = buildFareLookup(flightFares);
    const flightSeatLookup = buildSeatLookupByField(flightSeats, 'flight_id');

    console.log('[seed] Seeding trains, trips, carriages, and train seats');
    const trainDrafts = buildTrainDrafts(stationMap);
    const trains = await Train.insertMany(trainDrafts.map((item) => item.train));
    const trainIdByNumber = new Map(trains.map((train) => [train.train_number, train._id]));
    const tripDrafts = trainDrafts.map((item) => ({
      train_number: item.train.train_number,
      train_id: trainIdByNumber.get(item.train.train_number),
      departure_station_id: item.trip.departure_station_id,
      arrival_station_id: item.trip.arrival_station_id,
      departure_time: item.trip.departure_time,
      arrival_time: item.trip.arrival_time,
      status: item.trip.status,
    }));
    const insertedTrips = await TrainTrip.insertMany(tripDrafts.map((trip) => ({
      train_id: trip.train_id,
      departure_station_id: trip.departure_station_id,
      arrival_station_id: trip.arrival_station_id,
      departure_time: trip.departure_time,
      arrival_time: trip.arrival_time,
      status: trip.status,
    })));
    const tripRefs = tripDrafts.map((trip, index) => ({ ...trip, _id: insertedTrips[index]._id }));
    const pricingByTrainNumber = new Map(trainDrafts.map((item) => [item.train.train_number, item.pricing]));
    const trainTripMap = new Map(insertedTrips.map((trip, index) => [tripDrafts[index].train_number, trip]));
    const carriages = await TrainCarriage.insertMany(buildTrainCarriageDocs(tripRefs, pricingByTrainNumber));
    const carriageMap = new Map(carriages.map((carriage) => [`${carriage.train_trip_id.toString()}-${carriage.carriage_number}`, carriage]));
    const trainSeats = await Seat.insertMany(buildTrainSeatDocs(carriages));
    const carriageSeatLookup = buildSeatLookupByField(trainSeats, 'carriage_id');

    console.log('[seed] Seeding payment methods, bookings, payments, tickets, and drafts');
    await seedPaymentMethods(userMap);
    await seedBookingsAndPayments({ userMap, voucherMap, flightLookup, flightSeatLookup, fareLookup, trainTripMap, carriageMap, carriageSeatLookup });
    await seedPassengerDraft({ userMap, flightLookup, flightSeatLookup, fareLookup });
    await syncFlightFareAvailability(flights);

    const counts = {
      users: await User.countDocuments(),
      airlines: await Airline.countDocuments(),
      airports: await Airport.countDocuments(),
      flights: await Flight.countDocuments(),
      flightFares: await FlightFare.countDocuments(),
      trains: await Train.countDocuments(),
      trainStations: await TrainStation.countDocuments(),
      trainTrips: await TrainTrip.countDocuments(),
      trainCarriages: await TrainCarriage.countDocuments(),
      seats: await Seat.countDocuments(),
      bookings: await Booking.countDocuments(),
      tickets: await Ticket.countDocuments(),
      payments: await Payment.countDocuments(),
      paymentMethods: await PaymentMethod.countDocuments(),
      passengerDrafts: await PassengerDraft.countDocuments(),
      vouchers: await Voucher.countDocuments(),
    };

    console.log('[seed] Demo data ready');
    console.log(counts);
    console.log('[seed] Demo accounts');
    console.log(`  - admin@traveladmin.vn / ${DEMO_PASSWORD}`);
    console.log(`  - le.haanh@demo.vn / ${DEMO_PASSWORD}`);
    console.log(`  - tran.linhchi@demo.vn / ${DEMO_PASSWORD}`);
    console.log(`  - pham.khangminh@demo.vn / ${DEMO_PASSWORD}`);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = { seedDemoData };

if (require.main === module) {
  seedDemoData().catch((error) => {
    console.error('[seed] Failed to import demo data:', error);
    process.exit(1);
  });
}
