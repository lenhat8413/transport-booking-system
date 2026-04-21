const crypto = require("crypto");
const Payment = require("../models/payments.model");
const Booking = require("../models/bookings.model");
const Seat = require("../models/seats.model");
const Ticket = require("../models/tickets.model");
const User = require("../models/users.model");
const Flight = require("../models/flights.model");
const TrainTrip = require("../models/trainTrips.model");
const TrainStation = require("../models/trainStations.model");
const Train = require("../models/trains.model");
const env = require("../config/env");
const { sendBookingPaymentSuccessEmail } = require("../utils/emailService");

const DEFAULT_PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

const getVNPayDate = (date) => {
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate()
  )}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).map((key) => encodeURIComponent(key));
  keys.sort();

  keys.forEach((key) => {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  });

  return sorted;
}

function createSilentRes() {
  return {
    status: () => ({ json: () => { }, send: () => { } }),
    json: () => { },
    send: () => { },
  };
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "127.0.0.1";
}

function getBaseUrl(input, fallback) {
  if (!input) return fallback;

  try {
    const parsed = new URL(input);
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "");
  } catch {
    return fallback;
  }
}

function getPaypalBaseUrl() {
  return getBaseUrl(env.paypalBaseUrl, DEFAULT_PAYPAL_BASE_URL);
}

function getFrontendBaseUrl() {
  const fallback = env.corsOrigin || "http://localhost:5173";
  const base = getBaseUrl(env.paypalRedirectBaseUrl, fallback);
  try {
    return new URL(base).origin;
  } catch {
    return getBaseUrl(fallback, "http://localhost:5173");
  }
}

function getPaypalCurrency() {
  return (env.paypalCurrency || "USD").toUpperCase();
}

function getPaypalExchangeRate() {
  const rate = Number(env.paypalExchangeRate || 0);
  return Number.isFinite(rate) && rate > 0 ? rate : 25000;
}

function formatPaypalAmount(amount, currency) {
  const numericAmount = Number(amount || 0);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Invalid booking amount for PayPal");
  }

  if (ZERO_DECIMAL_CURRENCIES.has(currency)) {
    return `${Math.round(numericAmount)}`;
  }

  return numericAmount.toFixed(2);
}

function getPaypalCheckoutAmountFromVnd(vndAmount, currency) {
  const normalizedCurrency = (currency || "USD").toUpperCase();
  if (normalizedCurrency === "VND") {
    throw new Error("PayPal does not support VND. Please set PAYPAL_CURRENCY to USD.");
  }

  const exchangeRate = getPaypalExchangeRate();
  const amountInTargetCurrency = Number(vndAmount || 0) / exchangeRate;
  return formatPaypalAmount(amountInTargetCurrency, normalizedCurrency);
}

  function parsePaypalIssue(payload) {
    if (payload?.details && Array.isArray(payload.details) && payload.details.length > 0) {
      const detail = payload.details[0];
      return detail.description || detail.issue || null;
    }

    return payload?.message || payload?.error_description || payload?.error || null;
  }

  function extractPaypalCapture(payload) {
    const purchaseUnits = payload?.purchase_units || [];
    for (const unit of purchaseUnits) {
      const captures = unit?.payments?.captures || [];
      if (captures.length > 0) {
        return captures[0];
      }
    }
    return null;
  }

  async function resolveBookingRecipientEmail(booking) {
    const bookingContactEmail = booking?.booking_contact?.email || "";
    if (bookingContactEmail) return bookingContactEmail;

    if (booking?.user_id) {
      const user = await User.findById(booking.user_id).lean();
      if (user?.email) return user.email;
    }

    const firstTicket = await Ticket.findOne({ booking_id: booking._id }).lean();
    return firstTicket?.contact_info?.email || "";
  }

  async function buildTripInfoForEmail(booking) {
    if (booking.booking_type === "FLIGHT") {
      const flight = await Flight.findById(booking.trip_id)
        .populate("airline_id", "name")
        .populate("departure_airport_id", "name city iata_code")
        .populate("arrival_airport_id", "name city iata_code")
        .lean();

      return {
        carrierName: flight?.airline_id?.name || "Chuyen bay",
        tripCode: flight?.flight_number || "",
        fromName:
          flight?.departure_airport_id?.city ||
          flight?.departure_airport_id?.name ||
          "",
        toName:
          flight?.arrival_airport_id?.city ||
          flight?.arrival_airport_id?.name ||
          "",
        departureTime: flight?.departure_time || null,
        arrivalTime: flight?.arrival_time || null,
      };
    }

    const trainTrip = await TrainTrip.findById(booking.trip_id).lean();
    if (!trainTrip) {
      return {
        carrierName: "Chuyen tau",
        tripCode: "",
        fromName: "",
        toName: "",
        departureTime: null,
        arrivalTime: null,
      };
    }

    const [train, departureStation, arrivalStation] = await Promise.all([
      Train.findById(trainTrip.train_id).lean(),
      TrainStation.findById(trainTrip.departure_station_id).lean(),
      TrainStation.findById(trainTrip.arrival_station_id).lean(),
    ]);

    return {
      carrierName: train?.name || train?.train_number || "Chuyen tau",
      tripCode: train?.train_number || "",
      fromName: departureStation?.city || departureStation?.name || "",
      toName: arrivalStation?.city || arrivalStation?.name || "",
      departureTime: trainTrip.departure_time || null,
      arrivalTime: trainTrip.arrival_time || null,
    };
  }

  async function notifyBookingPaymentSuccess({ booking, payment }) {
    const to = await resolveBookingRecipientEmail(booking);
    if (!to) return;

    const [tripInfo, passengerCount] = await Promise.all([
      buildTripInfoForEmail(booking),
      Ticket.countDocuments({ booking_id: booking._id }),
    ]);

    await sendBookingPaymentSuccessEmail({
      to,
      customerName: booking.booking_contact?.full_name || "",
      bookingCode: booking.booking_code,
      bookingType: booking.booking_type,
      carrierName: tripInfo.carrierName,
      tripCode: tripInfo.tripCode,
      fromName: tripInfo.fromName,
      toName: tripInfo.toName,
      departureTime: tripInfo.departureTime,
      arrivalTime: tripInfo.arrivalTime,
      passengerCount,
      totalAmount: payment.amount,
      paymentMethod: payment.method,
    });
  }

  async function createOrReusePendingPayment(booking, method) {
    let payment = await Payment.findOne({
      booking_id: booking._id,
      status: "PENDING",
    }).sort({ createdAt: -1 });

    if (!payment) {
      payment = await Payment.create({
        booking_id: booking._id,
        method,
        amount: booking.total_amount,
        status: "PENDING",
      });
      return payment;
    }

    if (payment.method !== method || payment.amount !== booking.total_amount) {
      payment.method = method;
      payment.amount = booking.total_amount;
      payment.transaction_id = null;
      await payment.save();
    }

    return payment;
  }

  async function finalizePayment({ payment, status, gatewayPayload, transactionId }) {
    if (!payment) return null;

    if (payment.status === "SUCCESS" || payment.status === "FAILED") {
      return payment;
    }

    payment.status = status;
    payment.gateway_response = gatewayPayload || {};

    if (transactionId) {
      payment.transaction_id = transactionId;
    }

    if (status === "SUCCESS") {
      payment.paid_at = new Date();
    }

    await payment.save();

    const booking = await Booking.findById(payment.booking_id);
    if (!booking) {
      return payment;
    }

    if (booking.status !== "WAITING_PAYMENT" && booking.status !== "PENDING") {
      return payment;
    }

    if (status === "SUCCESS") {
      booking.status = "CONFIRMED";
      booking.total_amount = payment.amount;
      await booking.save();

      await Seat.updateMany(
        { held_by_booking_id: booking._id },
        {
          $set: {
            status: "BOOKED",
            held_by: null,
            hold_expired_at: null,
          },
        }
      );

      try {
        await notifyBookingPaymentSuccess({ booking, payment });
      } catch (emailError) {
        console.error("Send booking confirmation email error:", emailError);
      }
    } else if (status === "FAILED") {
      booking.status = "CANCELLED";
      await booking.save();

      await Seat.updateMany(
        { held_by_booking_id: booking._id },
        {
          $set: {
            status: "AVAILABLE",
            held_by: null,
            held_by_booking_id: null,
            hold_expired_at: null,
          },
        }
      );
    }

    return payment;
  }

  async function getPaypalAccessToken() {
    if (typeof fetch !== "function") {
      throw new Error("Node.js must be v18+ to use PayPal integration");
    }

    if (!env.paypalClientId || !env.paypalSecret) {
      throw new Error("Missing PayPal credentials in environment variables");
    }

    const baseUrl = getPaypalBaseUrl();
    const auth = Buffer.from(`${env.paypalClientId}:${env.paypalSecret}`).toString("base64");

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.access_token) {
      throw new Error(parsePaypalIssue(payload) || "Cannot get PayPal access token");
    }

    return payload.access_token;
  }

  async function getBookingForPayment(bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) return null;

    if (booking.status !== "WAITING_PAYMENT" && booking.status !== "PENDING") {
      return null;
    }

    return booking;
  }

  exports.createVnpayUrl = async (req, res) => {
    try {
      const { booking_id } = req.body || {};
      if (!booking_id) {
        return res.status(400).json({ success: false, message: "Missing booking_id" });
      }

      const booking = await getBookingForPayment(booking_id);
      if (!booking) {
        return res.status(400).json({
          success: false,
          message: "Booking is not valid for payment or already completed",
        });
      }

      const payment = await createOrReusePendingPayment(booking, "VNPAY");

      const ipAddr = getClientIp(req);
      const tmnCode = env.vnpTmnCode;
      const secretKey = env.vnpHashSecret;
      const vnpUrl = env.vnpUrl;
      const returnUrl = env.vnpReturnUrl;

      if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
        return res.status(500).json({
          success: false,
          message: "VNPay config is missing in backend environment",
        });
      }

      const now = new Date();
      const createDate = getVNPayDate(now);
      const expireDate = getVNPayDate(new Date(now.getTime() + 15 * 60 * 1000));

      const finalReturnUrl = returnUrl.includes("?")
        ? `${returnUrl}&bookingId=${booking._id.toString()}`
        : `${returnUrl}?bookingId=${booking._id.toString()}`;

      let vnpParams = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: payment._id.toString(),
        vnp_OrderInfo: `Thanh toan don hang ${booking.booking_code}`,
        vnp_OrderType: "other",
        vnp_Amount: booking.total_amount * 100,
        vnp_ReturnUrl: finalReturnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
      };

      vnpParams = sortObject(vnpParams);

      const signData = Object.keys(vnpParams)
        .map((key) => `${key}=${vnpParams[key]}`)
        .join("&");

      const signed = crypto
        .createHmac("sha512", secretKey)
        .update(Buffer.from(signData, "utf-8"))
        .digest("hex");

      const queryParams = { ...vnpParams, vnp_SecureHash: signed };
      const paymentUrl =
        `${vnpUrl}?` +
        Object.keys(queryParams)
          .map((key) => `${key}=${queryParams[key]}`)
          .join("&");

      return res.status(200).json({ success: true, url: paymentUrl });
    } catch (error) {
      console.error("Create VNPay URL error:", error);
      return res.status(500).json({
        success: false,
        message: "Cannot create VNPay payment URL",
      });
    }
  };

  exports.createPaypalOrder = async (req, res) => {
    try {
      const { booking_id } = req.body || {};
      if (!booking_id) {
        return res.status(400).json({ success: false, message: "Missing booking_id" });
      }

      const booking = await getBookingForPayment(booking_id);
      if (!booking) {
        return res.status(400).json({
          success: false,
          message: "Booking is not valid for payment or already completed",
        });
      }

      const payment = await createOrReusePendingPayment(booking, "PAYPAL");
      const accessToken = await getPaypalAccessToken();

      const paypalBaseUrl = getPaypalBaseUrl();
      const frontendBaseUrl = getFrontendBaseUrl();
      const currency = getPaypalCurrency();

      const returnUrl =
        `${frontendBaseUrl}/user/booking/paypal-return` +
        `?provider=paypal&bookingId=${booking._id.toString()}`;
      const cancelUrl =
        `${frontendBaseUrl}/user/booking/paypal-return` +
        `?provider=paypal&cancel=true&bookingId=${booking._id.toString()}`;

      const orderPayload = {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: payment._id.toString(),
            custom_id: booking._id.toString(),
            invoice_id: `${booking.booking_code}-${payment._id.toString().slice(-6)}`,
            amount: {
              currency_code: currency,
              value: getPaypalCheckoutAmountFromVnd(booking.total_amount, currency),
            },
          },
        ],
        application_context: {
          brand_name: "Transport Booking",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      };

      const response = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(orderPayload),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        return res.status(400).json({
          success: false,
          message: parsePaypalIssue(payload) || "Cannot create PayPal order",
        });
      }

      const approvalUrl =
        payload?.links?.find((link) => link.rel === "approve")?.href || null;

      if (!payload?.id || !approvalUrl) {
        return res.status(400).json({
          success: false,
          message: "PayPal did not return approve URL",
        });
      }

      payment.transaction_id = payload.id;
      payment.gateway_response = {
        ...(payment.gateway_response || {}),
        paypal_order_create: payload,
      };
      await payment.save();

      return res.status(200).json({
        success: true,
        url: approvalUrl,
        order_id: payload.id,
      });
    } catch (error) {
      console.error("Create PayPal order error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Cannot create PayPal order",
      });
    }
  };

  exports.capturePaypalOrder = async (req, res) => {
    try {
      const { booking_id, order_id, token, payer_id } = req.body || {};
      const orderId = order_id || token;

      if (!booking_id && !orderId) {
        return res.status(400).json({
          success: false,
          message: "Missing booking_id or order_id",
        });
      }

      let payment = null;

      if (booking_id) {
        payment = await Payment.findOne({
          booking_id,
          method: "PAYPAL",
        }).sort({ createdAt: -1 });
      }

      if (!payment && orderId) {
        payment = await Payment.findOne({
          transaction_id: orderId,
          method: "PAYPAL",
        }).sort({ createdAt: -1 });
      }

      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment not found" });
      }

      if (payment.status === "SUCCESS" || payment.status === "FAILED") {
        return res.status(200).json({
          success: true,
          message: "Payment already processed",
          data: payment,
        });
      }

      const accessToken = await getPaypalAccessToken();
      const paypalBaseUrl = getPaypalBaseUrl();
      const captureOrderId = orderId || payment.transaction_id;

      if (!captureOrderId) {
        return res.status(400).json({
          success: false,
          message: "Missing PayPal order ID for capture",
        });
      }

      const captureResponse = await fetch(
        `${paypalBaseUrl}/v2/checkout/orders/${encodeURIComponent(captureOrderId)}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
        }
      );

      let capturePayload = await captureResponse.json().catch(() => ({}));
      let capture = extractPaypalCapture(capturePayload);

      if (!captureResponse.ok) {
        const issue = capturePayload?.details?.[0]?.issue;

        if (issue !== "ORDER_ALREADY_CAPTURED") {
          return res.status(400).json({
            success: false,
            message: parsePaypalIssue(capturePayload) || "PayPal capture failed",
          });
        }

        const orderResponse = await fetch(
          `${paypalBaseUrl}/v2/checkout/orders/${encodeURIComponent(captureOrderId)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        capturePayload = await orderResponse.json().catch(() => ({}));
        capture = extractPaypalCapture(capturePayload);

        if (!orderResponse.ok || !capture) {
          return res.status(400).json({
            success: false,
            message: parsePaypalIssue(capturePayload) || "Cannot verify captured PayPal order",
          });
        }
      }

      const status = capture?.status === "COMPLETED" ? "SUCCESS" : "FAILED";
      const updatedPayment = await finalizePayment({
        payment,
        status,
        transactionId: capture?.id || captureOrderId,
        gatewayPayload: {
          paypal_capture: capturePayload,
          payer_id: payer_id || null,
        },
      });

      return res.status(200).json({ success: true, data: updatedPayment });
    } catch (error) {
      console.error("Capture PayPal order error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Cannot capture PayPal order",
      });
    }
  };

  exports.paymentWebhook = async (req, res) => {
    try {
      const { transaction_id, status, gateway_payload } = req.body || {};

      if (!transaction_id || !status) {
        return res.status(400).json({
          success: false,
          message: "Missing transaction_id or status",
        });
      }

      let payment = await Payment.findById(transaction_id);
      if (!payment) {
        payment = await Payment.findOne({ transaction_id });
      }

      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment not found" });
      }

      const normalizedStatus = status === "SUCCESS" ? "SUCCESS" : "FAILED";
      const transactionNo = gateway_payload?.vnp_TransactionNo || payment.transaction_id;

      const updatedPayment = await finalizePayment({
        payment,
        status: normalizedStatus,
        transactionId: transactionNo,
        gatewayPayload: gateway_payload || {},
      });

      return res.status(200).json({ success: true, data: updatedPayment });
    } catch (error) {
      console.error("Payment webhook error:", error);
      return res.status(500).json({
        success: false,
        message: "Webhook processing error",
      });
    }
  };

  exports.vnpayReturn = async (req, res) => {
    try {
      const vnpParams = req.query || {};
      const secureHash = vnpParams.vnp_SecureHash;

      const signDataParams = {};
      for (const key of Object.keys(vnpParams)) {
        if (
          key.startsWith("vnp_") &&
          key !== "vnp_SecureHash" &&
          key !== "vnp_SecureHashType"
        ) {
          signDataParams[key] = vnpParams[key];
        }
      }

      const sortedParams = sortObject(signDataParams);
      const signData = Object.keys(sortedParams)
        .map((key) => `${key}=${sortedParams[key]}`)
        .join("&");

      const signed = crypto
        .createHmac("sha512", env.vnpHashSecret)
        .update(Buffer.from(signData, "utf-8"))
        .digest("hex");

      if (secureHash !== signed) {
        return res.status(400).json({
          success: false,
          message: "Invalid signature",
          code: "97",
        });
      }

      const paymentId = vnpParams.vnp_TxnRef;
      const paymentStatus = vnpParams.vnp_ResponseCode === "00" ? "SUCCESS" : "FAILED";

      try {
        const payment = await Payment.findById(paymentId);
        if (payment && payment.status === "PENDING") {
          await exports.paymentWebhook(
            {
              body: {
                transaction_id: paymentId,
                status: paymentStatus,
                gateway_payload: vnpParams,
              },
            },
            createSilentRes()
          );
        }
      } catch (innerError) {
        console.error("VNPay return fallback update error:", innerError);
      }

      return res.status(200).json({
        success: true,
        message: "Valid signature",
        code: vnpParams.vnp_ResponseCode,
      });
    } catch (error) {
      console.error("VNPay return error:", error);
      return res.status(500).json({ success: false, message: "Error" });
    }
  };

  exports.vnpayIpn = async (req, res) => {
    try {
      const vnpParams = req.query || {};
      const secureHash = vnpParams.vnp_SecureHash;
      const paymentId = vnpParams.vnp_TxnRef;

      const signDataParams = {};
      for (const key of Object.keys(vnpParams)) {
        if (
          key.startsWith("vnp_") &&
          key !== "vnp_SecureHash" &&
          key !== "vnp_SecureHashType"
        ) {
          signDataParams[key] = vnpParams[key];
        }
      }

      const sortedParams = sortObject(signDataParams);
      const signData = Object.keys(sortedParams)
        .map((key) => `${key}=${sortedParams[key]}`)
        .join("&");

      const signed = crypto
        .createHmac("sha512", env.vnpHashSecret)
        .update(Buffer.from(signData, "utf-8"))
        .digest("hex");

      if (secureHash !== signed) {
        return res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
      }

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(200).json({ RspCode: "01", Message: "Order not found" });
      }

      if (payment.amount * 100 !== parseInt(vnpParams.vnp_Amount, 10)) {
        return res.status(200).json({ RspCode: "04", Message: "Amount invalid" });
      }

      if (payment.status === "SUCCESS" || payment.status === "FAILED") {
        return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
      }

      const status = vnpParams.vnp_ResponseCode === "00" ? "SUCCESS" : "FAILED";

      await exports.paymentWebhook(
        {
          body: {
            transaction_id: paymentId,
            status,
            gateway_payload: vnpParams,
          },
        },
        createSilentRes()
      );

      return res.status(200).json({ RspCode: "00", Message: "Confirm success" });
    } catch (error) {
      console.error("VNPay IPN error:", error);
      return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
    }
  };

  exports.getPaymentStatus = async (req, res) => {
    try {
      const payment = await Payment.findOne({ booking_id: req.params.bookingId }).sort({
        createdAt: -1,
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "No payment transaction found for this booking",
        });
      }

      return res.status(200).json({ success: true, data: payment });
    } catch (error) {
      console.error("Get payment status error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
