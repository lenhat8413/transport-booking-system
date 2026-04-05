import { BadgeCheck, HelpCircle, PlaneTakeoff, Wallet2 } from 'lucide-react';

export default function TicketMobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-4 gap-2">
        <button className="flex flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-semibold text-brand-700">
          <PlaneTakeoff className="h-4 w-4" />
          My Trips
        </button>
        <button className="flex flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium text-slate-400">
          <BadgeCheck className="h-4 w-4" />
          Boarding
        </button>
        <button className="flex flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium text-slate-400">
          <Wallet2 className="h-4 w-4" />
          Wallet
        </button>
        <button className="flex flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium text-slate-400">
          <HelpCircle className="h-4 w-4" />
          Support
        </button>
      </div>
    </nav>
  );
}
