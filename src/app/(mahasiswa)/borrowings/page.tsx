'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/shared/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { BorrowingStatusBadge } from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatCurrency, getDaysRemaining, isExpiringSoon } from '@/lib/utils';
import type { Borrowing } from '@/types';

export default function BorrowingsPage() {
  const { toast } = useToast();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState<string | null>(null);

  const fetchBorrowings = async () => {
    setLoading(true);
    const res = await fetch('/api/borrowings?status=ACTIVE');
    const data = await res.json();
    if (data.success) setBorrowings(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchBorrowings(); }, []);

  const handleExtend = async (id: string) => {
    if (!confirm('Perpanjang peminjaman 7 hari?')) return;
    setExtending(id);
    const res = await fetch(`/api/borrowings/${id}/extend`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      toast('Peminjaman berhasil diperpanjang!', 'success');
      fetchBorrowings();
    } else {
      toast(data.message || 'Gagal memperpanjang', 'error');
    }
    setExtending(null);
  };

  return (
    <>
      <TopBar title="Peminjaman Aktif" />
      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        ) : borrowings.length === 0 ? (
          <EmptyState
            icon="📖"
            title="Tidak ada peminjaman aktif"
            description="Kamu tidak sedang meminjam buku apapun saat ini."
          />
        ) : (
          <div className="space-y-3">
            {borrowings.map((b) => {
              const daysLeft = getDaysRemaining(b.dueDate);
              const expiring = isExpiringSoon(b.dueDate);
              const isOverdue = (b as Borrowing & { daysLate?: number }).daysLate! > 0;
              const fine = isOverdue
                ? (b as Borrowing & { daysLate?: number }).daysLate! * parseInt(process.env.NEXT_PUBLIC_FINE_PER_DAY || '1000')
                : 0;

              return (
                <Card key={b.id} className={isOverdue ? 'border-red-200 bg-red-50' : ''}>
                  <div className="flex gap-3 items-start mb-3">
                    <div className="w-10 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📖</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {b.bookCopy?.book?.title}
                      </p>
                      <p className="text-xs text-slate-500">{b.bookCopy?.book?.author}</p>
                      <div className="flex gap-2 mt-1">
                        <BorrowingStatusBadge status={b.status} />
                        {b.extensionCount > 0 && (
                          <Badge color="purple" size="sm">Diperpanjang {b.extensionCount}x</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Tanggal Pinjam</span>
                      <span className="font-medium">{formatDate(b.borrowDate)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Batas Kembali</span>
                      <span className={`font-bold ${isOverdue ? 'text-red-600' : expiring ? 'text-yellow-600' : 'text-slate-700'}`}>
                        {formatDate(b.dueDate)}
                      </span>
                    </div>
                    {isOverdue ? (
                      <div className="flex justify-between text-xs">
                        <span className="text-red-500 font-semibold">Terlambat</span>
                        <span className="text-red-600 font-bold">
                          {(b as Borrowing & { daysLate?: number }).daysLate} hari | Denda: {formatCurrency(fine)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Sisa Waktu</span>
                        <span className={`font-semibold ${expiring ? 'text-yellow-600' : 'text-green-600'}`}>
                          {daysLeft} hari lagi
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {!isOverdue && (
                    <div className="h-1.5 bg-slate-200 rounded-full mb-3">
                      <div
                        className={`h-full rounded-full ${expiring ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.max(0, (daysLeft / 14) * 100)}%` }}
                      />
                    </div>
                  )}

                  {b.extensionCount < b.maxExtensions && !isOverdue && (
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      loading={extending === b.id}
                      onClick={() => handleExtend(b.id)}
                    >
                      Perpanjang 7 Hari ({b.maxExtensions - b.extensionCount}x tersisa)
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
