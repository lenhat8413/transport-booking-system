import SectionTitle from './section-title';
import type { TicketViewModel } from './ticket-view-model';

interface PassengerSectionProps {
  data: TicketViewModel;
}

export default function PassengerSection({ data }: PassengerSectionProps) {
  return (
    <section>
      <SectionTitle title="Thong Tin Hanh Khach / Passenger Info" />

      <div className="overflow-hidden rounded-2xl border border-[#E9EDFF] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[620px] w-full border-collapse text-left">
            <thead>
              <tr className="bg-brand-50/70">
                <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-brand-700 sm:px-6">
                  Hanh Khach / Name
                </th>
                <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-brand-700 sm:px-6">
                  Loai / Type
                </th>
                <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-brand-700 sm:px-6">
                  CCCD / Passport
                </th>
              </tr>
            </thead>
            <tbody>
              {data.passengerRows.map((passenger, index) => (
                <tr key={passenger.key} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="px-4 py-4 text-sm font-extrabold text-[#141B2B] sm:px-6">
                    {passenger.name}
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-600 sm:px-6">
                    {passenger.type}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs font-bold text-[#141B2B] sm:px-6">
                    {passenger.document}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
