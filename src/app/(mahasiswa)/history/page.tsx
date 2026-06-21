'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/shared/TopBar';
import Card from '@/components/ui/Card';
import { BorrowingStatusBadge } from '@/components/shared/StatusBadge';
import { FineStatusBadge } from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Borrowing } from '@/types';

export default function HistoryPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchHistory = async () => {
    setLoading(true);
    const res = await fetch(`/api/borrowings?status=RETURNED&page=${page}&limit=${limit}`);
    const data = await res.json();
    if (data.success) {
      setBorrowings(data.data);
      setTotal(data.meta?.total || 0);
    }
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <TopBar title="Riwayat Peminjaman" />
      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : borrowings.length === 0 ? (
          <EmptyState
            icon="🗂️"
            title="Belum ada riwayat"
            description="Riwayat peminjaman kamu akan muncul di sini"
          />
        ) : (
          <>
            <p className="text-xs text-slate-500">{total} total peminjaman</p>
            <div className="space-y-3">
              {borrowings.map((b) => {
                const hasFine = b.fines && b.fines.length > 0;
                const totalFine = b.fines?.reduce((sum, f) => sum + f.amount, 0) || 0;
                return (
                  <Card key={b.id}>
                    <div className="flex gap-3 items-start mb-3">
                      <div className="w-10 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">📚</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {b.bookCopy?.book?.title}
                        </p>
                        <p className="text-xs text-slate-500">{b.bookCopy?.book?.author}</p>
                        <BorrowingStatusBadge status={b.status} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2">
                      <div>
                        <p className="text-slate-500">Dipinjam</p>
                        <p className="font-semibold">{formatDate(b.borrowDate)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Dikembalikan</p>
                        <p className="font-semibold">{b.returnDate ? formatDate(b.returnDate) : '-'}</p>
                      </div>
                      {hasFine && (
                        <div className="col-span-2 mt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Denda</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-red-600">{formatCurrency(totalFine)}</span>
                              {b.fines![0] && <FineStatusBadge status={b.fines![0].status} />}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40">←</button>
                <span className="text-sm text-slate-600">{page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40">→</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
