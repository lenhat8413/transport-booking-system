import { WalletCards } from 'lucide-react';
import SectionTitle from './section-title';
import type { TicketViewModel } from './ticket-view-model';

interface PaymentSectionProps {
  data: TicketViewModel;
}

export default function PaymentSection({ data }: PaymentSectionProps) {
  const qrSource = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data.qrValue)}&format=png`;

  return (
    <section>
      <SectionTitle title="Thong Tin Thanh Toan / Payment" />

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-[#E9EDFF] bg-[#F1F3FF]/60 p-5 sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex rounded-full bg-[#7FFC97] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#005320]">
                Payment successful
              </span>
              <p className="mt-3 text-xs font-medium text-slate-500">
                Total Amount / Tong thanh toan
              </p>
              <h4 className="font-ticket-headline mt-1 text-3xl font-extrabold text-[#141B2B]">
                {data.totalAmount}
              </h4>
            </div>
            <WalletCards className="h-8 w-8 text-brand-600" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400">Status</p>
              <p className="text-xs font-extrabold text-[#141B2B]">{data.paymentStatus}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400">Method</p>
              <p className="text-xs font-extrabold text-[#141B2B]">{data.paymentMethod}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400">Transaction</p>
              <p className="text-xs font-extrabold text-[#141B2B]">{data.transactionCode}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400">Billing Contact</p>
              <p className="text-xs font-extrabold text-[#141B2B]">{data.billingContact}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E9EDFF] bg-white p-6 shadow-sm">
          <img
            src={qrSource}
            alt="QR code for e-ticket verification"
            className="h-36 w-36 rounded-xl border-8 border-slate-50 object-cover shadow-sm"
          />
          <p className="mt-4 text-center text-[9px] font-bold uppercase leading-tight tracking-wider text-slate-400">
            Ma QR xac thuc ve
            <br />
            <span className="text-brand-600">E-ticket Verify</span>
          </p>
        </div>
      </div>
    </section>
  );
}
