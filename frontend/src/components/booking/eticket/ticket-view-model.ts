import { format } from 'date-fns';
import type { BookingDetails } from '@/types';

type UnknownRecord = Record<string, unknown>;

const TEXT_FALLBACK = 'N/A';
const DEFAULT_DURATION_MS = 5.5 * 60 * 60 * 1000;
const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'PAID / DA THANH TOAN',
  WAITING_PAYMENT: 'WAITING PAYMENT',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Completed',
  WAITING_PAYMENT: 'Waiting payment',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

const DEFAULT_NOTES = [
  'Vui long co mat tai san bay hoac ga it nhat 90 phut truoc gio khoi hanh.',
  'Mang theo CCCD/Passport ban goc de lam thu tuc check-in.',
  'Xuat trinh ma dat cho hoac e-ticket tai quay lam thu tuc.',
  'Luu giu e-ticket den khi ket thuc hanh trinh de doi chieu khi can.',
];

export interface TicketPassengerRow {
  key: string;
  name: string;
  type: string;
  document: string;
}

export interface TicketViewModel {
  bookingCode: string;
  bookingDate: string;
  issuedAt: string;
  statusLabel: string;
  statusSuccess: boolean;
  ticketTypeLabel: string;
  routeCode: string;
  departureCode: string;
  departureCity: string;
  departureStation: string;
  departureDate: string;
  departureTime: string;
  arrivalCode: string;
  arrivalCity: string;
  arrivalStation: string;
  arrivalDate: string;
  arrivalTime: string;
  durationText: string;
  seatNumber: string;
  baggageText: string;
  passengerRows: TicketPassengerRow[];
  primaryPassenger: string;
  routeText: string;
  totalAmount: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionCode: string;
  billingContact: string;
  notes: string[];
  qrValue: string;
}

const readByPath = (source: UnknownRecord | undefined, path: string) =>
  path.split('.').reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== 'object') return undefined;
    return (acc as UnknownRecord)[key];
  }, source);

const hasMojibake = (value: string) => /[\u00C2\u00C3]/.test(value);

const fixMojibake = (value: string) => {
  if (!hasMojibake(value)) return value;

  try {
    const bytes = Uint8Array.from(value.split('').map((char) => char.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    return decoded || value;
  } catch {
    return value;
  }
};

const cleanText = (value: unknown, fallback = TEXT_FALLBACK) => {
  if (value === undefined || value === null) return fallback;

  const raw = String(value).trim();
  if (!raw) return fallback;

  return fixMojibake(raw).normalize('NFC');
};

const pickValue = (source: UnknownRecord | undefined, paths: string[], fallback = TEXT_FALLBACK) => {
  for (const path of paths) {
    const value = readByPath(source, path);
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return cleanText(value, fallback);
    }
  }

  return fallback;
};

const parseDate = (value: unknown, fallback: Date) => {
  if (!value) return fallback;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const formatDate = (value: Date) => format(value, 'dd/MM/yyyy');
const formatTime = (value: Date) => format(value, 'HH:mm');
const formatDateTime = (value: Date) => format(value, 'HH:mm - dd/MM/yyyy');

const toDurationText = (start: Date, end: Date) => {
  const delta = Math.max(end.getTime() - start.getTime(), 0);
  const hours = Math.floor(delta / (60 * 60 * 1000));
  const minutes = Math.floor((delta % (60 * 60 * 1000)) / (60 * 1000));

  if (hours === 0 && minutes === 0) return '5h 30m';
  return `${hours}h ${minutes}m`;
};

export const buildTicketViewModel = (booking: BookingDetails): TicketViewModel => {
  const summary = booking.booking_summary as unknown as UnknownRecord;
  const financials = booking.financials as unknown as UnknownRecord;
  const passengers = booking.passengers ?? [];
  const primaryPassengerRecord = (passengers[0] as unknown as UnknownRecord | undefined) ?? undefined;

  const isFlight = booking.booking_summary.type === 'FLIGHT';
  const fallbackCreatedAt = new Date();
  const createdAt = parseDate(booking.booking_summary.created_at, fallbackCreatedAt);
  const departureAt = parseDate(
    pickValue(
      summary,
      ['departure_time', 'depart_at', 'departure_at', 'trip_date', 'schedule.departure_time'],
      booking.booking_summary.created_at,
    ),
    createdAt,
  );
  const arrivalAt = parseDate(
    pickValue(summary, ['arrival_time', 'arrive_at', 'arrival_at', 'schedule.arrival_time'], ''),
    new Date(departureAt.getTime() + DEFAULT_DURATION_MS),
  );

  const bookingCode = cleanText(booking.booking_summary.code, 'BKG000000000');
  const statusLabel = STATUS_LABELS[booking.booking_summary.status] ?? booking.booking_summary.status;
  const statusSuccess = booking.booking_summary.status === 'CONFIRMED';

  const departureCode = pickValue(summary, ['departure_code', 'from_code', 'origin_code'], isFlight ? 'SGN' : 'DEP');
  const arrivalCode = pickValue(summary, ['arrival_code', 'to_code', 'destination_code'], isFlight ? 'HAN' : 'ARR');
  const departureCity = pickValue(summary, ['departure_name', 'from_name', 'origin_name'], isFlight ? 'Sai Gon' : 'Diem di');
  const arrivalCity = pickValue(summary, ['arrival_name', 'to_name', 'destination_name'], isFlight ? 'Ha Noi' : 'Diem den');

  const departureStation = pickValue(summary, ['departure_station', 'from_station', 'origin_station'], `${departureCity} (${departureCode})`);
  const arrivalStation = pickValue(summary, ['arrival_station', 'to_station', 'destination_station'], `${arrivalCity} (${arrivalCode})`);

  const routeCode = pickValue(
    summary,
    ['vehicle_code', 'trip_code', 'flight_number', 'train_number', 'code'],
    isFlight ? 'VN-248' : 'SE-03',
  );

  const seatNumber = pickValue(primaryPassengerRecord, ['seat_info.number', 'seat_number', 'seat'], 'Updating');
  const baggageText = pickValue(primaryPassengerRecord, ['baggage', 'baggage_allowance'], isFlight ? '20KG Baggage' : 'Standard baggage');

  const totalAmount = CURRENCY_FORMATTER.format(Number(booking.financials.total_amount) || 0);
  const paymentMethod = pickValue(financials, ['payment_method', 'method'], 'Online payment');
  const transactionCode = pickValue(financials, ['transaction_id', 'transaction_code', '_id'], `TXN-${bookingCode.slice(-6).toUpperCase()}`);

  const passengerRows: TicketPassengerRow[] = passengers.length
    ? passengers.map((passenger, index) => {
        const record = passenger as unknown as UnknownRecord;
        return {
          key: `${bookingCode}-${index}`,
          name: pickValue(record, ['passenger_name', 'name'], `Passenger ${index + 1}`),
          type: pickValue(record, ['type', 'passenger_type'], 'Adult'),
          document: pickValue(record, ['id_card', 'passport', 'passport_number'], 'Updating'),
        };
      })
    : [
        {
          key: `${bookingCode}-0`,
          name: 'Passenger updating',
          type: 'Adult',
          document: 'Updating',
        },
      ];

  const primaryPassenger = passengerRows[0]?.name ?? 'Passenger updating';

  return {
    bookingCode,
    bookingDate: formatDate(createdAt),
    issuedAt: formatDateTime(new Date()),
    statusLabel,
    statusSuccess,
    ticketTypeLabel: isFlight ? 'Issuance / Cap moi' : 'Issuance / Cap moi',
    routeCode,
    departureCode,
    departureCity,
    departureStation,
    departureDate: formatDate(departureAt),
    departureTime: formatTime(departureAt),
    arrivalCode,
    arrivalCity,
    arrivalStation,
    arrivalDate: formatDate(arrivalAt),
    arrivalTime: formatTime(arrivalAt),
    durationText: toDurationText(departureAt, arrivalAt),
    seatNumber,
    baggageText,
    passengerRows,
    primaryPassenger,
    routeText: `${departureCity.toUpperCase()} -> ${arrivalCity.toUpperCase()}`,
    totalAmount,
    paymentStatus: PAYMENT_STATUS_LABELS[booking.booking_summary.status] ?? 'Completed',
    paymentMethod,
    transactionCode,
    billingContact: primaryPassenger,
    notes: DEFAULT_NOTES,
    qrValue: bookingCode,
  };
};
