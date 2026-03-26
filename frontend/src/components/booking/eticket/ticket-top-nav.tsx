import { Download, Loader2, Printer } from 'lucide-react';

interface TicketTopNavProps {
  bookingCode: string;
  onDownload?: () => void;
  isDownloading?: boolean;
}

export default function TicketTopNav({
  bookingCode,
  onDownload,
  isDownloading = false,
}: TicketTopNavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/30 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="font-ticket-headline text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
          The Kinetic Editorial
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <button className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600">
            My Trips
          </button>
          <button className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
            Boarding Pass
          </button>
          <button className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
            Wallet
          </button>
          <button className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
            Support
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Print ticket"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.print();
              }
            }}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Printer className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Download ticket"
            onClick={onDownload}
            disabled={!onDownload || isDownloading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#A33900] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#8F3000] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isDownloading ? 'Generating...' : 'Download'}
            </span>
          </button>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFDBCE] text-[11px] font-bold text-[#A33900]">
            {bookingCode.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
