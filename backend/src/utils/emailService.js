const nodemailer = require("nodemailer");
const env = require("../config/env");

/**
 * Tạo transporter mới mỗi lần gửi để đảm bảo dùng giá trị env hiện tại.
 * (Tránh lỗi khi module được load trước khi dotenv đọc xong)
 */
const createTransporter = () =>
	nodemailer.createTransport({
		host: env.smtpHost,
		port: env.smtpPort,
		secure: env.smtpPort === 465,
		auth: {
			user: env.smtpUser,
			pass: env.smtpPass,
		},
	});

/**
 * Gửi email chứa OTP reset mật khẩu.
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} otp - Mã OTP 6 chữ số
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (to, otp) => {
	const expiryMinutes = env.otpExpiryMinutes;

	// Dùng SMTP_USER làm địa chỉ gửi để không cần config EMAIL_FROM
	const fromAddress = env.smtpUser;
	if (!fromAddress) {
		throw new Error("SMTP_USER is required to send emails.");
	}

	const transporter = createTransporter();

	const mailOptions = {
		from: {
			name: "Transport Booking",
			address: fromAddress,
		},
		to,
		subject: "Yêu cầu đặt lại mật khẩu",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #2563eb;">Đặt lại mật khẩu</h2>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Mã OTP của bạn là:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e40af; margin: 16px 0;">
          ${otp}
        </div>
        <p>Mã này có hiệu lực trong <strong>${expiryMinutes} phút</strong>.</p>
        <p style="color: #6b7280; font-size: 13px;">
          Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
        </p>
      </div>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (err) {
		console.error("[sendPasswordResetEmail]", err);
		throw new Error("Failed to send password reset email.");
	}
};

const sendBookingPaymentSuccessEmail = async ({
	to,
	customerName,
	bookingCode,
	bookingType,
	carrierName,
	tripCode,
	fromName,
	toName,
	departureTime,
	arrivalTime,
	passengerCount,
	totalAmount,
	paymentMethod,
}) => {
	if (!to) {
		throw new Error("Recipient email is required.");
	}

	// Dùng SMTP_USER làm địa chỉ gửi để không cần config EMAIL_FROM
	const fromAddress = env.smtpUser;
	if (!fromAddress) {
		throw new Error("SMTP_USER is required to send emails.");
	}
	const transporter = createTransporter();

	const departureText = departureTime ? new Date(departureTime).toLocaleString("vi-VN") : "";
	const arrivalText = arrivalTime ? new Date(arrivalTime).toLocaleString("vi-VN") : "";
	const amountText = Number(totalAmount || 0).toLocaleString("vi-VN");
	const safeName = customerName || "Quy khach";

	const mailOptions = {
		from: {
			name: "Transport Booking",
			address: fromAddress,
		},
		to,
		subject: `[${bookingCode}] Xac nhan thanh toan thanh cong`,
		html: `
      <div style="background:#f3f4f6;padding:24px;font-family:Arial,sans-serif;">
        <div style="max-width:700px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;">
          <div style="padding:16px 20px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:24px;font-weight:700;color:#1d4ed8;">Transport Booking</div>
            <div style="font-size:12px;color:#6b7280;">Hotline: 1900 6091</div>
          </div>

          <div style="padding:24px 20px;">
            <p style="margin:0 0 10px;color:#111827;">Cam on <strong>${safeName}</strong> da su dung dich vu cua chung toi.</p>
            <p style="margin:0 0 20px;color:#111827;">Ve cua ban da duoc thanh toan thanh cong.</p>

            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;width:38%;">Ma dat cho</td><td style="padding:8px;border:1px solid #e5e7eb;">${bookingCode || ""}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">Loai chuyen</td><td style="padding:8px;border:1px solid #e5e7eb;">${bookingType || ""}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">Hang van chuyen</td><td style="padding:8px;border:1px solid #e5e7eb;">${carrierName || ""}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">Ma chuyen</td><td style="padding:8px;border:1px solid #e5e7eb;">${tripCode || ""}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">Hanh trinh</td><td style="padding:8px;border:1px solid #e5e7eb;">${fromName || ""} -> ${toName || ""}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">Gio di / den</td><td style="padding:8px;border:1px solid #e5e7eb;">${departureText} ${arrivalText ? ` / ${arrivalText}` : ""}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">So hanh khach</td><td style="padding:8px;border:1px solid #e5e7eb;">${passengerCount || 0}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">Phuong thuc thanh toan</td><td style="padding:8px;border:1px solid #e5e7eb;">${paymentMethod || ""}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;">Tong thanh toan</td><td style="padding:8px;border:1px solid #e5e7eb;"><strong>${amountText} VND</strong></td></tr>
            </table>

            <p style="margin:20px 0 0;color:#6b7280;font-size:12px;">
              Email nay duoc gui tu dong, vui long khong tra loi.
            </p>
          </div>
        </div>
      </div>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (err) {
		console.error("[sendBookingPaymentSuccessEmail]", err);
		throw new Error("Failed to send booking confirmation email.");
	}
};

module.exports = { sendPasswordResetEmail, sendBookingPaymentSuccessEmail };
