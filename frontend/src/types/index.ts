// ─── Booking Types ─────────────────────────────────────────────
export interface SeatInfo {
  id: string;
  number: string;
  class: string;
  additional_fee: number;
}

export interface PassengerDetail {
  ticket_id: string;
  passenger_name: string;
  id_card: string;
  seat_info: SeatInfo | null;
  final_price: number;
  date_of_birth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  passenger_type?: 'ADULT' | 'CHILD' | 'INFANT';
  contact_info?: {
    phone: string;
    email: string;
  };
}

export interface BookingSummary {
  id: string;
  code: string;
  type: 'FLIGHT' | 'TRAIN';
  trip_id: string;
  status: 'PENDING' | 'WAITING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  created_at: string;
  expires_at: string;
}

export interface FinancialInfo {
  total_amount: number;
  discount_applied: number;
}

export interface BookingDetails {
  booking_summary: BookingSummary;
  financials: FinancialInfo;
  passengers: PassengerDetail[];
}

// ─── Voucher Types ─────────────────────────────────────────────
export interface VoucherResult {
  booking_id: string;
  voucher_code: string;
  old_total: number;
  discount_amount: number;
  final_total: number;
}

// ─── Payment Types ────────────────────────────────────────────
export type PaymentMethod = 'VNPAY' | 'MOMO' | 'PAYPAL' | 'MOCK';

export interface PaymentInfo {
  _id: string;
  booking_id: string;
  method: PaymentMethod;
  transaction_id?: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  gateway_response?: Record<string, unknown>;
  paid_at?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Wrappers ────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
