const mongoose = require("mongoose");
const Seat = require("../models/seats.model");
const Flight = require("../models/flights.model");
const TrainTrip = require("../models/trainTrips.model");
const TrainCarriage = require("../models/trainCarriages.model");
const env = require("../config/env");

// ─── Custom error class for domain errors ─────────────────────────────────────
class SeatServiceError extends Error {
	constructor(message, statusCode = 400, code = null) {
		super(message);
		this.name = "SeatServiceError";
		this.statusCode = statusCode;
		this.code = code;
	}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatSeat(s) {
	return {
		_id: s._id,
		seat_number: s.seat_number,
		class: s.class,
		status: s.status,
		holdUntil: s.hold_expired_at ?? null,
		price_modifier: s.price_modifier,
	};
}

function validateObjectId(id, label = "ID") {
	if (!id || !mongoose.Types.ObjectId.isValid(id)) {
		throw new SeatServiceError(`A valid ${label} is required.`, 400);
	}
}

function validateSeatIds(seatIds, max = 9) {
	if (!Array.isArray(seatIds) || seatIds.length === 0) {
		throw new SeatServiceError("seatIds must be a non-empty array.", 400);
	}
	if (seatIds.length > max) {
		throw new SeatServiceError(
			`Cannot process more than ${max} seats at once.`,
			422,
			"SEAT_HOLD_LIMIT_EXCEEDED",
		);
	}
	const invalidIds = seatIds.filter(
		(id) => !mongoose.Types.ObjectId.isValid(id),
	);
	if (invalidIds.length > 0) {
		throw new SeatServiceError(
			`Invalid seat IDs: ${invalidIds.join(", ")}`,
			400,
		);
	}
}

// ─── getSeatStatus ────────────────────────────────────────────────────────────
async function getSeatStatus(seatId) {
	validateObjectId(seatId, "seatId");

	const seat = await Seat.findById(seatId);
	if (!seat) throw new SeatServiceError("Seat not found.", 404);

	return {
		seatId: seat._id,
		seat_number: seat.seat_number,
		status: seat.status,
		holdUntil: seat.hold_expired_at ?? null,
	};
}

// ─── getSeatMap ───────────────────────────────────────────────────────────────
async function getSeatMap(tripId) {
	validateObjectId(tripId, "tripId");

	const flight = await Flight.findById(tripId);

	if (flight) {
		const seats = await Seat.find({ flight_id: tripId }).sort("seat_number");
		return {
			tripType: "flight",
			tripId: flight._id,
			trip: {
				flightNumber: flight.flight_number,
				departureTime: flight.departure_time,
				arrivalTime: flight.arrival_time,
				status: flight.status,
			},
			seats: seats.map(formatSeat),
		};
	}

	const trainTrip = await TrainTrip.findById(tripId);
	if (!trainTrip) throw new SeatServiceError("Trip not found.", 404);

	const carriages = await TrainCarriage.find({ train_trip_id: tripId }).sort(
		"carriage_number",
	);
	const carriageIds = carriages.map((c) => c._id);
	const seats = await Seat.find({ carriage_id: { $in: carriageIds } }).sort(
		"seat_number",
	);

	return {
		tripType: "train",
		tripId: trainTrip._id,
		trip: {
			departureTime: trainTrip.departure_time,
			arrivalTime: trainTrip.arrival_time,
			status: trainTrip.status,
		},
		carriages: carriages.map((carriage) => ({
			carriageId: carriage._id,
			carriageNumber: carriage.carriage_number,
			type: carriage.type,
			basePrice: carriage.base_price,
			seats: seats
				.filter((s) => s.carriage_id.toString() === carriage._id.toString())
				.map(formatSeat),
		})),
	};
}

// ─── holdSeats ────────────────────────────────────────────────────────────────
async function holdSeats({ seatIds, tripType, tripId, userId }) {
	validateSeatIds(seatIds);
	validateObjectId(tripId, "tripId");

	if (!tripType || !["flight", "train"].includes(tripType)) {
		throw new SeatServiceError("tripType must be 'flight' or 'train'.", 400);
	}

	const seats = await Seat.find({ _id: { $in: seatIds } });
	if (seats.length !== seatIds.length) {
		throw new SeatServiceError("One or more seats were not found.", 404);
	}

	const now = new Date();
	for (const seat of seats) {
		const isHeldActive =
			seat.status === "HELD" &&
			seat.hold_expired_at &&
			seat.hold_expired_at > now;

		if (seat.status === "BOOKED" || isHeldActive) {
			throw new SeatServiceError(
				`Seat ${seat.seat_number} is not available.`,
				409,
				"SEAT_NOT_AVAILABLE",
			);
		}
	}

	const holdExpiry = new Date(Date.now() + env.seatHoldTtlMinutes * 60 * 1000);
	const savedSeats = await Promise.all(
		seats.map((seat) => {
			seat.status = "HELD";
			seat.held_by = userId;
			seat.hold_expired_at = holdExpiry;
			return seat.save();
		}),
	);

	return {
		heldSeats: savedSeats.map((seat) => ({
			_id: seat._id,
			seat_number: seat.seat_number,
			status: seat.status,
			holdUntil: seat.hold_expired_at,
		})),
	};
}

// ─── releaseSeats ─────────────────────────────────────────────────────────────
async function releaseSeats({ seatIds, tripId, userId }) {
	validateSeatIds(seatIds);
	validateObjectId(tripId, "tripId");

	const seats = await Seat.find({ _id: { $in: seatIds } });
	if (seats.length !== seatIds.length) {
		throw new SeatServiceError(
			"One or more seats were not found.",
			404,
			"SEAT_NOT_FOUND",
		);
	}

	for (const seat of seats) {
		if (!seat.held_by || seat.held_by.toString() !== userId.toString()) {
			throw new SeatServiceError(
				`Seat ${seat.seat_number} is not held by you.`,
				403,
				"SEAT_NOT_HELD_BY_USER",
			);
		}
	}

	await Promise.all(
		seats.map((seat) => {
			seat.status = "AVAILABLE";
			seat.held_by = null;
			seat.hold_expired_at = null;
			return seat.save();
		}),
	);

	return { released: seats.map((seat) => seat._id) };
}

// ─── selectSeats ──────────────────────────────────────────────────────────────
async function selectSeats({ tripId, seatIds, userId }) {
	validateObjectId(tripId, "tripId");
	validateSeatIds(seatIds);

	// Detect trip type
	const flight = await Flight.findById(tripId);
	const trainTrip = flight ? null : await TrainTrip.findById(tripId);
	if (!flight && !trainTrip) {
		throw new SeatServiceError("Trip not found.", 404);
	}

	const seats = await Seat.find({ _id: { $in: seatIds } });
	if (seats.length !== seatIds.length) {
		throw new SeatServiceError("One or more seats were not found.", 404);
	}

	// Verify seats belong to this trip
	for (const seat of seats) {
		const belongsToFlight =
			flight && seat.flight_id && seat.flight_id.toString() === tripId;
		const belongsToTrain = trainTrip && seat.carriage_id;

		if (!belongsToFlight && !belongsToTrain) {
			throw new SeatServiceError(
				`Seat ${seat.seat_number} does not belong to the specified trip.`,
				400,
			);
		}
	}

	if (trainTrip) {
		const carriages = await TrainCarriage.find({ train_trip_id: tripId });
		const carriageIdSet = new Set(carriages.map((c) => c._id.toString()));
		for (const seat of seats) {
			if (
				!seat.carriage_id ||
				!carriageIdSet.has(seat.carriage_id.toString())
			) {
				throw new SeatServiceError(
					`Seat ${seat.seat_number} does not belong to the specified trip.`,
					400,
				);
			}
		}
	}

	// Check availability
	const now = new Date();
	for (const seat of seats) {
		if (seat.status === "BOOKED") {
			throw new SeatServiceError(
				`Seat ${seat.seat_number} has already been booked.`,
				409,
				"SEAT_NOT_AVAILABLE",
			);
		}
		if (
			seat.status === "HELD" &&
			seat.hold_expired_at &&
			seat.hold_expired_at > now &&
			seat.held_by?.toString() !== userId.toString()
		) {
			throw new SeatServiceError(
				`Seat ${seat.seat_number} is currently held by another user.`,
				409,
				"SEAT_NOT_AVAILABLE",
			);
		}
	}

	const holdExpiry = new Date(Date.now() + env.seatHoldTtlMinutes * 60 * 1000);
	const savedSeats = await Promise.all(
		seats.map((seat) => {
			seat.status = "HELD";
			seat.held_by = userId;
			seat.hold_expired_at = holdExpiry;
			return seat.save();
		}),
	);

	return {
		tripId,
		selectedSeats: savedSeats.map(formatSeat),
		holdUntil: holdExpiry,
	};
}

module.exports = {
	SeatServiceError,
	getSeatStatus,
	getSeatMap,
	holdSeats,
	releaseSeats,
	selectSeats,
};
