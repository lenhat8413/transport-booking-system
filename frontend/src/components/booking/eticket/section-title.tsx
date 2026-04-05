interface SectionTitleProps {
  title: string;
}

export default function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <h3 className="font-ticket-headline whitespace-nowrap text-sm font-black uppercase tracking-wide text-[#141B2B]">
        {title}
      </h3>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}
