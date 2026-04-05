import { Download, Loader2, Verified } from 'lucide-react';
import type { TicketViewModel } from './ticket-view-model';

interface TicketHeroProps {
  data: TicketViewModel;
  showActions?: boolean;
  onDownload?: () => void;
  isDownloading?: boolean;
}

export default function TicketHero({
  data,
  showActions = false,
  onDownload,
  isDownloading = false,
}: TicketHeroProps) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
      <div className="rounded-2xl border border-brand-100/70 bg-gradient-to-br from-brand-50 via-white to-[#F1F3FF] p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="font-ticket-headline text-2xl font-extrabold tracking-tight text-brand-700 sm:text-3xl">
            TravelApp
          </h1>
          <span className="h-4 w-px bg-brand-100" />
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
            Premium Experience
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-slate-600">
          Premium booking and itinerary systems
        </p>

        <div className="mt-8">
          <span className="inline-flex rounded-full border border-brand-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-brand-700">
            Official Document
          </span>
          <h2 className="font-ticket-headline mt-3 text-2xl font-extrabold leading-tight text-[#141B2B] sm:text-3xl">
            VE DIEN TU / E-TICKET
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Xac nhan lich trinh va thong tin dat cho. Vui long giu ma dat cho de check-in nhanh hon.
          </p>
        </div>

        {showActions ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onDownload}
              disabled={!onDownload || isDownloading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isDownloading ? 'Generating PDF...' : 'Download E-ticket'}
            </button>
            <button
              type="button"
              className="rounded-xl border border-brand-100 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-brand-50"
            >
              Manage Booking
            </button>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[#E9EDFF] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
            Booking Code / Ma dat cho
          </p>
          <h3 className="font-ticket-headline mt-1 text-3xl font-extrabold text-brand-700">
            {data.bookingCode}
          </h3>
        </div>

        <div className="space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">Date / Ngay dat:</span>
            <span className="text-[#141B2B]">{data.bookingDate}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">Status / Trang thai:</span>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${data.statusSuccess
                  ? 'bg-[#00873a]/10 text-[#006b2c]'
                  : 'bg-brand-100 text-brand-700'
                }`}
            >
              {data.statusLabel}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">Type / Hinh thuc:</span>
            <span className="text-[#141B2B]">{data.ticketTypeLabel}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-[10px] text-slate-400">Issued at: {data.issuedAt}</p>
            <Verified className="h-4 w-4 text-slate-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
