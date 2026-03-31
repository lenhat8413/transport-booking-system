const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// Utility routes
router.post("/webhook", paymentController.paymentWebhook);

// VNPay routes
router.post("/create", paymentController.createVnpayUrl);
router.get("/vnpay_return", paymentController.vnpayReturn);
router.get("/vnpay_ipn", paymentController.vnpayIpn);

// PayPal routes
router.post("/paypal/create", paymentController.createPaypalOrder);
router.post("/paypal/capture", paymentController.capturePaypalOrder);

// Payment status by booking
router.get("/:bookingId/status", paymentController.getPaymentStatus);

module.exports = router;
