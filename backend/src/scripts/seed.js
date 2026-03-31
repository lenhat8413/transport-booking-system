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
        departure_time: new Date(),
        arrival_time: new Date(),
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
        departure_time: new Date(),
        arrival_time: new Date(),
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
