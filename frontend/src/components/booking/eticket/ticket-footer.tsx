interface TicketFooterProps {
  issuedAt: string;
}

export default function TicketFooter({ issuedAt }: TicketFooterProps) {
  return (
    <footer className="flex flex-col gap-4 border-t border-slate-100 px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          TravelApp E-ticket System
        </p>
        <p className="mt-1 text-[10px] text-slate-300">
          Issued at {issuedAt} by Precision Concierge Systems.
        </p>
      </div>

      <div className="text-left sm:text-right">
        <p className="text-[10px] font-bold uppercase text-slate-500">
          Cam on quy khach da su dung dich vu cua chung toi
        </p>
        <p className="text-[10px] italic text-slate-400">
          Thank you for choosing our premium travel services.
        </p>
      </div>
    </footer>
  );
}
