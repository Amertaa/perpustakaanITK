'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import { BookingStatusBadge, CopyStatusBadge } from '@/components/shared/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatDate } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setBooking(d.data); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async () => {
    if (!actionModal) return;
    setProcessing(true);
    const res = await fetch(`/api/bookings/${id}/${actionModal}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes }),
    });
    const data = await res.json();
    if (data.success) {
      toast(`Booking berhasil ${actionModal === 'approve' ? 'disetujui' : 'ditolak'}!`, 'success');
      router.push('/admin/bookings');
    } else {
      toast(data.message || 'Gagal memproses', 'error');
    }
    setProcessing(false);
  };

  if (loading) return <div className="p-6 text-slate-500 text-center">Memuat...</div>;
  if (!booking) return <div className="p-6 text-slate-500 text-center">Booking tidak ditemukan</div>;

  const student = (booking as unknown as { student?: { name: string; nim: string; faculty?: string; phone?: string } }).student;

  return (
    <div className="p-4 md:p-6 max-w-xl space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Detail Booking</h1>
          <BookingStatusBadge status={booking.status as BookingStatus} />
        </div>
      </div>

      <Card>
        <h2 className="text-sm font-bold text-slate-700 mb-3">Data Mahasiswa</h2>
        <div className="space-y-1 text-sm">
          <div className="flex gap-2"><span className="text-slate-500 w-20">Nama</span><span className="font-medium">{student?.name}</span></div>
          <div className="flex gap-2"><span className="text-slate-500 w-20">NIM</span><span className="font-medium">{student?.nim}</span></div>
          <div className="flex gap-2"><span className="text-slate-500 w-20">Fakultas</span><span className="font-medium">{student?.faculty || '-'}</span></div>
          <div className="flex gap-2"><span className="text-slate-500 w-20">No. HP</span><span className="font-medium">{student?.phone || '-'}</span></div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-bold text-slate-700 mb-3">Data Buku</h2>
        <div className="space-y-1 text-sm">
          <div className="flex gap-2"><span className="text-slate-500 w-20">Judul</span><span className="font-medium">{booking.bookCopy?.book?.title}</span></div>
          <div className="flex gap-2"><span className="text-slate-500 w-20">Penulis</span><span className="font-medium">{booking.bookCopy?.book?.author}</span></div>
          <div className="flex gap-2"><span className="text-slate-500 w-20">Eksemplar</span><span className="font-medium">#{booking.bookCopy?.copyNumber}</span></div>
          <div className="flex gap-2"><span className="text-slate-500 w-20">Status</span>
            {booking.bookCopy && <CopyStatusBadge status={booking.bookCopy.status} />}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-bold text-slate-700 mb-3">Informasi Booking</h2>
        <div className="space-y-1 text-sm">
          <div className="flex gap-2"><span className="text-slate-500 w-28">Tgl Booking</span><span>{formatDateTime(booking.bookingDate)}</span></div>
          <div className="flex gap-2"><span className="text-slate-500 w-28">Kadaluarsa</span><span>{formatDate(booking.expiryDate)}</span></div>
          {booking.notes && <div className="flex gap-2"><span className="text-slate-500 w-28">Catatan</span><span>{booking.notes}</span></div>}
          {booking.adminNotes && <div className="flex gap-2"><span className="text-slate-500 w-28">Catatan Admin</span><span>{booking.adminNotes}</span></div>}
        </div>
      </Card>

      {booking.status === 'PENDING' && (
        <div className="flex gap-3">
          <Button variant="danger" fullWidth onClick={() => setActionModal('reject')}>❌ Tolak</Button>
          <Button variant="success" fullWidth onClick={() => setActionModal('approve')}>✅ Setujui</Button>
        </div>
      )}

      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal === 'approve' ? 'Setujui Booking' : 'Tolak Booking'}
        footer={
          <>
            <Button variant="outline" onClick={() => setActionModal(null)}>Batal</Button>
            <Button variant={actionModal === 'approve' ? 'success' : 'danger'} loading={processing} onClick={handleAction}>
              {actionModal === 'approve' ? 'Setujui' : 'Tolak'}
            </Button>
          </>
        }
      >
        <Textarea
          label={`Catatan untuk mahasiswa ${actionModal === 'reject' ? '(alasan penolakan)' : '(opsional)'}`}
          placeholder={actionModal === 'reject' ? 'Alasan penolakan...' : 'Catatan tambahan...'}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
        />
      </Modal>
    </div>
  );
}
