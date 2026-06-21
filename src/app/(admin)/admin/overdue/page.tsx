'use client';
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Borrowing } from '@/types';

export default function AdminOverduePage() {
  const [overdue, setOverdue] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports?type=overdue')
      .then((r) => r.json())
      .then((d) => { if (d.success) setOverdue(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const totalFine = overdue.reduce((sum, b) => {
    const days = Math.floor((new Date().getTime() - new Date(b.dueDate).getTime()) / (1000 * 60 * 60 * 24));
    return sum + days * 1000;
  }, 0);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Buku Terlambat</h1>
        <p className="text-sm text-slate-500">
          {overdue.length} buku terlambat | Estimasi denda: {formatCurrency(totalFine)}
        </p>
      </div>

      {overdue.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Card className="!p-4 bg-red-50 border-red-200">
            <p className="text-2xl font-bold text-red-700">{overdue.length}</p>
            <p className="text-xs text-red-600">Buku Terlambat</p>
          </Card>
          <Card className="!p-4 bg-orange-50 border-orange-200">
            <p className="text-2xl font-bold text-orange-700">{formatCurrency(totalFine)}</p>
            <p className="text-xs text-orange-600">Total Estimasi Denda</p>
          </Card>
        </div>
      )}

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200">
                {['Mahasiswa', 'Buku', 'Batas Kembali', 'Terlambat', 'Denda', 'Kontak'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton cols={6} count={5} />
              ) : overdue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <span className="text-4xl">🎉</span>
                    <p className="text-sm text-slate-500 mt-2">Tidak ada buku yang terlambat!</p>
                  </td>
                </tr>
              ) : (
                overdue.map((b) => {
                  const daysLate = Math.floor((new Date().getTime() - new Date(b.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                  const fine = daysLate * 1000;
                  return (
                    <tr key={b.id} className="border-b border-slate-100 hover:bg-red-50/50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold">{b.student?.name}</p>
                        <p className="text-xs text-slate-500">{b.student?.nim}</p>
                      </td>
                      <td className="px-4 py-3 text-sm line-clamp-1 max-w-[180px]">
                        {b.bookCopy?.book?.title}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-red-600">{formatDate(b.dueDate)}</td>
                      <td className="px-4 py-3">
                        <Badge color="red">{daysLate} hari</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-red-700">{formatCurrency(fine)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{b.student?.phone || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
