import { create } from 'zustand';
import type { BookingDetails, VoucherResult, PaymentMethod } from '@/types';

interface BookingFlowState {
  // Core data
  bookingId: string | null;
  bookingData: BookingDetails | null;
  voucherResult: VoucherResult | null;
  paymentMethod: PaymentMethod | null;

  // Actions
  setBookingId: (id: string) => void;
  setBookingData: (data: BookingDetails) => void;
  setVoucherResult: (result: VoucherResult | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  reset: () => void;
}

const initialState = {
  bookingId: null,
  bookingData: null,
  voucherResult: null,
  paymentMethod: null,
};

export const useBookingStore = create<BookingFlowState>((set) => ({
  ...initialState,

  setBookingId: (id) => set({ bookingId: id }),
  setBookingData: (data) => set({ bookingData: data }),
  setVoucherResult: (result) => set({ voucherResult: result }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  reset: () => set(initialState),
}));
