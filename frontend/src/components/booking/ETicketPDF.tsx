import { forwardRef } from 'react';
import type { BookingDetails } from '@/types';
import ItinerarySection from './eticket/itinerary-section';
import NotesSection from './eticket/notes-section';
import PassengerSection from './eticket/passenger-section';
import PaymentSection from './eticket/payment-section';
import TicketFooter from './eticket/ticket-footer';
import TicketHero from './eticket/ticket-hero';
import TicketMobileNav from './eticket/ticket-mobile-nav';
import TicketTopNav from './eticket/ticket-top-nav';
import { buildTicketViewModel } from './eticket/ticket-view-model';

interface ETicketPDFProps {
  booking: BookingDetails;
  mode?: 'page' | 'pdf';
  onDownload?: () => void;
  isDownloading?: boolean;
}

const ETicketPDF = forwardRef<HTMLDivElement, ETicketPDFProps>(
  (
    {
      booking,
      mode = 'pdf',
      onDownload,
      isDownloading = false,
    },
    ref,
  ) => {
    const data = buildTicketViewModel(booking);
    const isPageMode = mode === 'page';

    return (
      <div
        ref={ref}
        className={`font-ticket-body ${
          isPageMode ? 'bg-slate-100 pb-20 pt-20 md:pb-10' : 'bg-transparent'
        }`}
      >
        {isPageMode ? (
          <TicketTopNav
            bookingCode={data.bookingCode}
            onDownload={onDownload}
            isDownloading={isDownloading}
          />
        ) : null}

        <div className={`${isPageMode ? 'mx-auto max-w-6xl px-3 sm:px-4' : 'mx-auto'}`}>
          <main
            className={`relative overflow-hidden border border-[#E2E8F0] bg-white ${
              isPageMode
                ? 'rounded-3xl shadow-[0_25px_55px_rgba(15,23,42,0.16)]'
                : 'rounded-none shadow-none'
            }`}
            style={
              isPageMode
                ? undefined
                : {
                    width: '794px',
                    maxWidth: '100%',
                    minHeight: '1123px',
                  }
            }
          >
            <div className="h-2 w-full bg-gradient-to-r from-brand-400 to-brand-700" />

            <div className="space-y-8 p-4 sm:p-8">
              <TicketHero
                data={data}
                showActions={isPageMode}
                onDownload={onDownload}
                isDownloading={isDownloading}
              />
              <PassengerSection data={data} />
              <ItinerarySection data={data} />
              <PaymentSection data={data} />
              <NotesSection notes={data.notes} />
            </div>

            <TicketFooter issuedAt={data.issuedAt} />
          </main>
        </div>

        {isPageMode ? <TicketMobileNav /> : null}
      </div>
    );
  },
);

ETicketPDF.displayName = 'ETicketPDF';

export default ETicketPDF;
