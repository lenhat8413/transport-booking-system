import {
  ArrowRight,
  Armchair,
  CheckCircle2,
  Clock3,
  Luggage,
  Plane,
} from 'lucide-react';
import SectionTitle from './section-title';
import type { TicketViewModel } from './ticket-view-model';

interface ItinerarySectionProps {
  data: TicketViewModel;
}

export default function ItinerarySection({ data }: ItinerarySectionProps) {
  return (
    <section>
      <SectionTitle title="Thong Tin Chuyen Di / Itinerary" />

      <div className="overflow-hidden rounded-2xl border border-[#E9EDFF] bg-white shadow-sm">
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[120px_1fr_auto_1fr_210px] lg:items-center">
          <div className="text-center">
            <Plane className="mx-auto mb-2 h-5 w-5 text-brand-600" />
            <p className="text-[10px] font-bold uppercase text-slate-400">Flight</p>
            <p className="font-ticket-headline mt-1 text-base font-extrabold text-[#141B2B]">
              {data.routeCode}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <h4 className="font-ticket-headline text-3xl font-black leading-none text-[#141B2B]">
              {data.departureCode}
            </h4>
            <p className="mt-1 text-xs font-bold text-slate-500">{data.departureCity}</p>
            <p className="mt-1 text-xs text-slate-400">{data.departureStation}</p>
            <p className="mt-2 text-sm font-extrabold text-brand-600">{data.departureTime}</p>
            <p className="text-[10px] text-slate-400">{data.departureDate}</p>
          </div>

          <div className="flex flex-col items-center justify-center px-2">
            <div className="flex w-full items-center gap-1 opacity-30">
              <div className="h-1 flex-1 rounded-full bg-brand-600" />
              <ArrowRight className="h-4 w-4 text-brand-600" />
            </div>
            <span className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              {data.durationText}
            </span>
          </div>

          <div className="text-left">
            <h4 className="font-ticket-headline text-3xl font-black leading-none text-[#141B2B]">
              {data.arrivalCode}
            </h4>
            <p className="mt-1 text-xs font-bold text-slate-500">{data.arrivalCity}</p>
            <p className="mt-1 text-xs text-slate-400">{data.arrivalStation}</p>
            <p className="mt-2 text-sm font-extrabold text-brand-600">{data.arrivalTime}</p>
            <p className="text-[10px] text-slate-400">{data.arrivalDate}</p>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#141B2B]">
              <Armchair className="h-4 w-4 text-slate-400" />
              Seat: {data.seatNumber}
            </div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#141B2B]">
              <Luggage className="h-4 w-4 text-slate-400" />
              {data.baggageText}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-[#00873a]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#006b2c]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirmed
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] text-slate-400">
              <Clock3 className="h-3.5 w-3.5" />
              Ready to board
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-dashed border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:flex-row sm:items-center sm:px-8">
          <p>
            Passenger:
            <span className="ml-1 text-[#141B2B]">{data.primaryPassenger}</span>
          </p>
          <p>
            Route:
            <span className="ml-1 text-[#141B2B]">{data.routeText}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
