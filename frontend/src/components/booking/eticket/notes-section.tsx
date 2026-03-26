import { Info } from 'lucide-react';
import type { TicketViewModel } from './ticket-view-model';

interface NotesSectionProps {
  notes: TicketViewModel['notes'];
}

export default function NotesSection({ notes }: NotesSectionProps) {
  return (
    <section className="rounded-2xl border border-[#E2BFB2]/50 bg-gradient-to-r from-[#FFDBCE]/30 to-[#F1F3FF] p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <Info className="h-5 w-5 text-[#A33900]" />
        <h5 className="text-xs font-black uppercase tracking-wide text-[#141B2B]">
          Thong Tin Can Luu Y / Important Notes
        </h5>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 sm:gap-x-8">
        {notes.map((note, index) => (
          <li key={`${note}-${index}`} className="flex gap-2 text-[11px] text-[#5A4138]">
            <span className="font-bold text-[#A33900]">•</span>
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
