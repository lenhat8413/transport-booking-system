'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ETicketPDF from '@/components/booking/ETicketPDF';
import { getBookingDetails } from '@/lib/api';
import type { BookingDetails } from '@/types';

export default function BookingSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || !booking) return;

    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(image, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`ETicket_${booking.booking_summary.code}.pdf`);
    } catch (downloadError) {
      console.error('Failed to generate PDF:', downloadError);
      alert('Khong the tao file PDF. Vui long thu lai.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    if (!bookingId) return;

    getBookingDetails(bookingId)
      .then((response) => setBooking(response))
      .catch((requestError) => {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Khong the tai thong tin booking.';
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-900">Khong tim thay e-ticket</h2>
        <p className="mt-2 text-sm text-slate-500">
          {error ?? 'Vui long kiem tra lai lien ket booking.'}
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-6 rounded-xl bg-[#A33900] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8F3000]"
        >
          Ve trang chu
        </button>
      </div>
    );
  }

  return (
    <>
      <ETicketPDF
        booking={booking}
        mode="page"
        onDownload={handleDownloadPDF}
        isDownloading={isGeneratingPdf}
      />

      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        <ETicketPDF ref={pdfRef} booking={booking} mode="pdf" />
      </div>
    </>
  );
}
