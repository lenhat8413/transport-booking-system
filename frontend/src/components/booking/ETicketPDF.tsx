import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import type { BookingDetails } from '@/types';

interface ETicketPDFProps {
    booking: BookingDetails;
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        width: '794px', // gần chuẩn A4 ở 96dpi
        minHeight: '1123px',
        margin: '0 auto',
        padding: '32px',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#1f2937',
        lineHeight: 1.45,
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px',
        borderBottom: '2px solid #ea580c',
        paddingBottom: '16px',
        marginBottom: '20px',
    },

    brandWrap: {
        flex: 1,
    },

    brandRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px',
    },

    logoBox: {
        border: '2px solid #ea580c',
        color: '#ea580c',
        fontWeight: 700,
        fontSize: '22px',
        width: '34px',
        height: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    brandName: {
        margin: 0,
        color: '#ea580c',
        fontSize: '28px',
        fontWeight: 700,
    },

    ticketTitle: {
        margin: '0 0 6px 0',
        fontSize: '22px',
        fontWeight: 700,
        color: '#111827',
        letterSpacing: '0.3px',
    },

    subText: {
        margin: 0,
        fontSize: '12px',
        color: '#6b7280',
        maxWidth: '460px',
    },

    bookingBox: {
        width: '250px',
        border: '1px solid #fed7aa',
        backgroundColor: '#fff7ed',
        borderRadius: '8px',
        padding: '14px 16px',
        boxSizing: 'border-box',
        textAlign: 'right',
    },

    bookingLabel: {
        margin: 0,
        fontSize: '11px',
        color: '#9a3412',
        fontWeight: 700,
        textTransform: 'uppercase',
    },

    bookingCode: {
        margin: '6px 0 10px 0',
        fontSize: '24px',
        color: '#ea580c',
        fontWeight: 700,
        letterSpacing: '0.8px',
        wordBreak: 'break-word',
    },

    bookingDate: {
        margin: 0,
        fontSize: '12px',
        color: '#374151',
    },

    section: {
        marginBottom: '18px',
        pageBreakInside: 'avoid',
    },

    sectionTitle: {
        margin: '0 0 10px 0',
        fontSize: '14px',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: '#374151',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '6px',
    },

    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px',
    },

    th: {
        backgroundColor: '#f3f4f6',
        color: '#374151',
        textAlign: 'left',
        padding: '10px',
        border: '1px solid #d1d5db',
        fontWeight: 700,
    },

    td: {
        padding: '10px',
        border: '1px solid #d1d5db',
        verticalAlign: 'top',
    },

    centerTd: {
        padding: '10px',
        border: '1px solid #d1d5db',
        verticalAlign: 'middle',
        textAlign: 'center',
    },

    tripCard: {
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
    },

    tripHeader: {
        display: 'grid',
        gridTemplateColumns: '110px 1fr 40px 1fr 110px',
        alignItems: 'center',
        backgroundColor: '#fff7ed',
        borderBottom: '1px solid #e5e7eb',
    },

    tripHeaderCell: {
        padding: '12px',
        fontSize: '12px',
        color: '#9a3412',
        fontWeight: 700,
        textAlign: 'center',
    },

    tripBody: {
        display: 'grid',
        gridTemplateColumns: '110px 1fr 40px 1fr 110px',
        alignItems: 'stretch',
    },

    tripCell: {
        padding: '14px 12px',
        borderRight: '1px solid #e5e7eb',
        textAlign: 'center',
        fontSize: '13px',
    },

    tripCode: {
        color: '#ea580c',
        fontSize: '18px',
        fontWeight: 700,
        marginBottom: '4px',
    },

    locationMain: {
        fontSize: '15px',
        fontWeight: 700,
        color: '#111827',
        marginBottom: '4px',
    },

    locationSub: {
        fontSize: '12px',
        color: '#6b7280',
    },

    arrowCell: {
        padding: '14px 0',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '18px',
        color: '#9ca3af',
        fontWeight: 700,
    },

    paymentWrap: {
        display: 'grid',
        gridTemplateColumns: '1fr 180px',
        gap: '18px',
        alignItems: 'center',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
    },

    paymentLine: {
        margin: '0 0 8px 0',
        fontSize: '14px',
    },

    paid: {
        color: '#16a34a',
        fontWeight: 700,
    },

    qrWrap: {
        textAlign: 'center',
        borderLeft: '1px dashed #d1d5db',
        paddingLeft: '18px',
    },

    qrImg: {
        width: '110px',
        height: '110px',
        objectFit: 'contain',
        display: 'block',
        margin: '0 auto 8px auto',
    },

    qrText: {
        margin: 0,
        fontSize: '11px',
        color: '#6b7280',
    },

    notes: {
        marginTop: '24px',
        borderTop: '2px solid #ea580c',
        paddingTop: '14px',
        pageBreakInside: 'avoid',
    },

    notesTitle: {
        margin: '0 0 8px 0',
        fontSize: '13px',
        fontWeight: 700,
        color: '#ea580c',
    },

    notesList: {
        margin: 0,
        paddingLeft: '18px',
        color: '#4b5563',
        fontSize: '12px',
    },

    footer: {
        marginTop: '18px',
        fontSize: '11px',
        color: '#9ca3af',
        textAlign: 'center',
    },
};

const ETicketPDF = forwardRef<HTMLDivElement, ETicketPDFProps>(({ booking }, ref) => {
    const { booking_summary, passengers, financials } = booking;
    const isFlight = booking_summary.type === 'FLIGHT';
    const mainPassenger = passengers?.[0];

    const departureDate = new Date(booking_summary.created_at);
    const arrivalDate = new Date(departureDate.getTime() + 5.5 * 60 * 60 * 1000);

    const totalAmount = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(financials.total_amount);

    return (
        <div ref={ref} style={styles.page}>
            <div style={styles.header}>
                <div style={styles.brandWrap}>
                    <div style={styles.brandRow}>
                        <div style={styles.logoBox}>T</div>
                        <h1 style={styles.brandName}>TravelApp</h1>
                    </div>

                    <h2 style={styles.ticketTitle}>VÉ ĐIỆN TỬ / E-TICKET</h2>
                    <p style={styles.subText}>
                        Quý khách vui lòng xuất trình mã đặt chỗ và giấy tờ tùy thân hợp lệ tại quầy làm thủ tục
                        để nhận thẻ lên {isFlight ? 'máy bay' : 'tàu'}.
                    </p>
                </div>

                <div style={styles.bookingBox}>
                    <p style={styles.bookingLabel}>Mã đặt chỗ / Booking code</p>
                    <p style={styles.bookingCode}>{booking_summary.code}</p>
                    <p style={styles.bookingDate}>
                        <strong>Ngày đặt:</strong> {format(new Date(booking_summary.created_at), 'dd/MM/yyyy')}
                    </p>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Thông tin hành khách / Passenger information</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Hành khách</th>
                            <th style={styles.th}>Loại</th>
                            <th style={styles.th}>CCCD / Passport</th>
                        </tr>
                    </thead>
                    <tbody>
                        {passengers.map((p, idx) => (
                            <tr key={idx}>
                                <td style={{ ...styles.td, fontWeight: 700 }}>{p.passenger_name}</td>
                                <td style={styles.td}>Người lớn (Adult)</td>
                                <td style={styles.td}>{p.id_card || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Thông tin chuyến đi / Itinerary details</h3>

                <div style={styles.tripCard}>
                    <div style={styles.tripHeader}>
                        <div style={styles.tripHeaderCell}>Chuyến</div>
                        <div style={styles.tripHeaderCell}>Điểm đi</div>
                        <div style={styles.tripHeaderCell}></div>
                        <div style={styles.tripHeaderCell}>Điểm đến</div>
                        <div style={styles.tripHeaderCell}>Ghế / Hành lý</div>
                    </div>

                    <div style={styles.tripBody}>
                        <div style={styles.tripCell}>
                            <div style={styles.tripCode}>SE3</div>
                            <div style={styles.locationSub}>{isFlight ? 'Flight' : 'Trip'}</div>
                        </div>

                        <div style={styles.tripCell}>
                            <div style={styles.locationMain}>Sài Gòn (SGN)</div>
                            <div style={styles.locationSub}>{format(departureDate, 'HH:mm - dd/MM/yyyy')}</div>
                        </div>

                        <div style={styles.arrowCell}>→</div>

                        <div style={styles.tripCell}>
                            <div style={styles.locationMain}>Hà Nội (HAN)</div>
                            <div style={styles.locationSub}>{format(arrivalDate, 'HH:mm - dd/MM/yyyy')}</div>
                        </div>

                        <div style={{ ...styles.tripCell, borderRight: 'none' }}>
                            <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                                Ghế: {mainPassenger?.seat_info?.number || 'Đang chờ'}
                            </div>
                            <div style={styles.locationSub}>Hành lý: 20 KG</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Thông tin thanh toán / Payment details</h3>

                <div style={styles.paymentWrap}>
                    <div>
                        <p style={styles.paymentLine}>
                            <strong>Tổng tiền vé:</strong> {totalAmount}
                        </p>
                        <p style={styles.paymentLine}>
                            <strong>Trạng thái:</strong> <span style={styles.paid}>ĐÃ THANH TOÁN (PAID)</span>
                        </p>
                        <p style={{ ...styles.paymentLine, marginBottom: 0 }}>
                            <strong>Hành khách chính:</strong> {mainPassenger?.passenger_name || 'N/A'}
                        </p>
                    </div>

                    <div style={styles.qrWrap}>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking_summary.code}&format=png`}
                            alt="QR Code"
                            style={styles.qrImg}
                        />
                        <p style={styles.qrText}>Mã quét xác nhận vé</p>
                    </div>
                </div>
            </div>

            <div style={styles.notes}>
                <p style={styles.notesTitle}>Quý khách lưu ý / Important notes</p>
                <ul style={styles.notesList}>
                    <li>
                        Vui lòng có mặt tại {isFlight ? 'sân bay' : 'nhà ga'} tối thiểu <strong>90 phút</strong>{' '}
                        trước giờ khởi hành.
                    </li>
                    <li>Vé cần được sử dụng đúng thông tin hành khách và đúng hành trình đã đặt.</li>
                    <li>
                        Mang theo giấy tờ hợp lệ: CCCD, Hộ chiếu, hoặc Giấy khai sinh bản chính (đối với trẻ em).
                    </li>
                    <li>Cảm ơn quý khách đã sử dụng dịch vụ của TravelApp. Chúc quý khách chuyến đi tốt đẹp.</li>
                </ul>
            </div>

            <div style={styles.footer}>
                TravelApp E-Ticket • Xuất lúc {format(new Date(), 'HH:mm - dd/MM/yyyy')}
            </div>
        </div>
    );
});

ETicketPDF.displayName = 'ETicketPDF';

export default ETicketPDF;