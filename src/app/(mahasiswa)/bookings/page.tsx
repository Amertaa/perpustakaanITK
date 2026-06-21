'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import TopBar from '@/components/shared/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatDate } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';

const FILTERS: { label: string; value: string }[] = [
  { label: 'Semua', value: '' },
  { label: 'Menunggu', value: 'PENDING' },
  { label: 'Disetujui', value: 'APPROVED' },
  { label: 'Selesai', value: 'COMPLETED' },
  { label: 'Ditolak', value: 'REJECTED' },
];

export default function BookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : '';
    const res = await fetch(`/api/bookings${params}`);
    const data = await res.json();
    if (data.success) setBookings(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const handleCancel = async (id: string) => {
    if (!confirm('Yakin ingin membatalkan booking ini?')) return;
    setCancelling(id);
    const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      toast('Booking berhasil dibatalkan', 'success');
      fetchBookings();
    } else {
      toast(data.message || 'Gagal membatalkan', 'error');
    }
    setCancelling(null);
  };

  return (
    <>
      <TopBar title="Booking Saya" />
      <div className="px-4 py-4 space-y-4">
        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === value ? 'bg-primary-700 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Belum ada booking"
            description="Cari buku dan buat booking sekarang"
            action={
              <Link href="/books">
                <Button>Cari Buku</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Card key={booking.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📖</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {booking.bookCopy?.book?.title}
                    </p>
                    <p className="text-xs text-slate-500">{booking.bookCopy?.book?.author}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Eks. #{booking.bookCopy?.copyNumber}</p>
                  </div>
                  <BookingStatusBadge status={booking.status as BookingStatus} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Booking: {formatDateTime(booking.bookingDate)}</span>
                  <span>Kadaluarsa: {formatDate(booking.expiryDate)}</span>
                </div>
                {booking.adminNotes && (
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-600">Catatan admin: {booking.adminNotes}</p>
                  </div>
                )}
                {['PENDING', 'APPROVED'].includes(booking.status) && (
                  <Button
                    variant="danger"
                    size="sm"
                    fullWidth
                    loading={cancelling === booking.id}
                    onClick={() => handleCancel(booking.id)}
                  >
                    Batalkan Booking
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
