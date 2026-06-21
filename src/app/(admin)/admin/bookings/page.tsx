'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';

const FILTERS = [
  { label: 'Semua', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Disetujui', value: 'APPROVED' },
  { label: 'Ditolak', value: 'REJECTED' },
  { label: 'Selesai', value: 'COMPLETED' },
];

export default function AdminBookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject'; id: string } | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const limit = 10;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter) params.set('status', filter);
    const res = await fetch(`/api/bookings?${params}`);
    const data = await res.json();
    if (data.success) { setBookings(data.data); setTotal(data.meta?.total || 0); }
    setLoading(false);
  }, [filter, page]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleAction = async () => {
    if (!actionModal) return;
    setProcessing(true);
    const url = `/api/bookings/${actionModal.id}/${actionModal.type}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes }),
    });
    const data = await res.json();
    if (data.success) {
      toast(`Booking berhasil ${actionModal.type === 'approve' ? 'disetujui' : 'ditolak'}!`, 'success');
      setActionModal(null);
      setAdminNotes('');
      fetchBookings();
    } else {
      toast(data.message || 'Gagal memproses booking', 'error');
    }
    setProcessing(false);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Manajemen Booking</h1>
        <p className="text-sm text-slate-500">{total} booking</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => { setFilter(value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === value ? 'bg-primary-700 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200">
                {['Mahasiswa', 'Buku', 'Eks.', 'Tanggal Booking', 'Status', 'Aksi'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-3 first:pl-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton cols={6} count={5} />
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 text-sm py-12">
                    Tidak ada data booking
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {(booking as unknown as { student?: { name: string } }).student?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(booking as unknown as { student?: { nim: string } }).student?.nim}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-700 line-clamp-1">
                        {booking.bookCopy?.book?.title}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">#{booking.bookCopy?.copyNumber}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(booking.bookingDate)}</td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={booking.status as BookingStatus} />
                    </td>
                    <td className="px-4 py-3">
                      {booking.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="success" onClick={() => setActionModal({ type: 'approve', id: booking.id })}>
                            ✅
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => setActionModal({ type: 'reject', id: booking.id })}>
                            ❌
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-slate-100">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40">←</button>
            <span className="text-sm text-slate-600">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40">→</button>
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!actionModal}
        onClose={() => { setActionModal(null); setAdminNotes(''); }}
        title={actionModal?.type === 'approve' ? 'Setujui Booking' : 'Tolak Booking'}
        footer={
          <>
            <Button variant="outline" onClick={() => setActionModal(null)}>Batal</Button>
            <Button
              variant={actionModal?.type === 'approve' ? 'success' : 'danger'}
              loading={processing}
              onClick={handleAction}
            >
              {actionModal?.type === 'approve' ? 'Setujui' : 'Tolak'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            {actionModal?.type === 'approve'
              ? 'Mahasiswa akan diberitahu bahwa bookingnya disetujui dan dapat mengambil buku.'
              : 'Mahasiswa akan diberitahu bahwa bookingnya ditolak dan eksemplar akan dikembalikan.'}
          </p>
          <Textarea
            label={`Catatan untuk mahasiswa ${actionModal?.type === 'reject' ? '(wajib)' : '(opsional)'}`}
            placeholder={actionModal?.type === 'reject' ? 'Alasan penolakan...' : 'Catatan tambahan...'}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
