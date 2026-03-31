const PassengerDraft = require('../models/passengerDrafts.model');
const Ticket = require('../models/tickets.model');
const Booking = require('../models/bookings.model');

exports.saveDraftPassengerInfo = async (req, res) => {
    try {
        const { trip_id, seats, passengers } = req.body;
        let userId = req.user ? req.user.userId : null;
        const draft = await PassengerDraft.create({ user_id: userId, trip_id, seats, passengers });
        res.status(201).json({ success: true, data: draft, message: 'Đã lưu bản nháp' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', detail: error.message });
    }
};

exports.getDraftPassengerInfo = async (req, res) => {
    try {
        const draft = await PassengerDraft.findById(req.params.draft_id);
        if (!draft) return res.status(404).json({ success: false, message: 'Bản nháp hết hạn' });
        res.status(200).json({ success: true, data: draft });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Save passenger info to booking (update tickets with passenger details)
exports.savePassengerInfo = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { passengers } = req.body;

        // 1. Validate booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy booking' });
        }

        // 2. Check authorization
        const requestUserId = req.user ? req.user.userId : null;
        if (booking.user_id && !requestUserId) {
            return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục' });
        }
        if (booking.user_id && booking.user_id.toString() !== requestUserId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa booking này' });
        }

        // 3. Check booking status allows editing
        if (booking.status !== 'PENDING' && booking.status !== 'WAITING_PAYMENT') {
            return res.status(400).json({ success: false, message: 'Booking đã hết hạn hoặc đã hoàn tất' });
        }

        // 4. Validate passengers array
        if (!passengers || passengers.length === 0) {
            return res.status(400).json({ success: false, message: 'Danh sách hành khách không được để trống' });
        }

        // 5. Get existing tickets for this booking
        const existingTickets = await Ticket.find({ booking_id: bookingId });
        const incomingSeatIds = passengers.map(p => p.seat_id).filter(Boolean);

        if (existingTickets.length === 0) {
            return res.status(400).json({ success: false, message: 'Booking chưa có ghế để cập nhật hành khách' });
        }

        if (passengers.length !== existingTickets.length) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng hành khách phải khớp với số vé đã được tạo từ bước chọn ghế'
            });
        }

        // 6. Update tickets with passenger information
        const updatePromises = passengers.map(async (p) => {
            // Find existing ticket by seat_id
            let ticket = existingTickets.find(t => t.seat_id.toString() === p.seat_id);

            if (!ticket) {
                // Find ticket by index position if seat_id not matched
                const idx = incomingSeatIds.indexOf(p.seat_id);
                if (idx >= 0 && existingTickets[idx]) {
                    ticket = existingTickets[idx];
                }
            }

            if (!ticket) {
                throw new Error(`Không tìm thấy vé tương ứng với ghế ${p.seat_id}`);
            }

            // Update existing ticket
            ticket.passenger_name = p.passenger_name.toUpperCase();
            ticket.passenger_id_card = p.passenger_id_card;
            if (p.date_of_birth) ticket.date_of_birth = new Date(p.date_of_birth);
            if (p.gender) ticket.gender = p.gender;
            if (p.passenger_type) ticket.passenger_type = p.passenger_type;
            if (p.contact_info) {
                ticket.contact_info = p.contact_info;
            }
            await ticket.save();

            return ticket;
        });

        await Promise.all(updatePromises);

        const primaryPassenger = passengers[0];
        if (primaryPassenger) {
            booking.booking_contact = {
                full_name: (primaryPassenger.passenger_name ?? '').toUpperCase(),
                email: primaryPassenger.contact_info?.email ?? '',
                phone: primaryPassenger.contact_info?.phone ?? '',
                id_card: primaryPassenger.passenger_id_card ?? '',
            };
            await booking.save();
        }

        res.status(200).json({
            success: true,
            message: 'Thông tin hành khách đã được lưu thành công'
        });
    } catch (error) {
        console.error('Error saving passenger info:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu thông tin' });
    }
};
