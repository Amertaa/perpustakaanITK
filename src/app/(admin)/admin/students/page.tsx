'use client';
import { useEffect, useState, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { getInitials } from '@/lib/utils';
import type { Student } from '@/types';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<(Student & { _count: { borrowings: number; bookings: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    if (data.success) { setStudents(data.data); setTotal(data.meta?.total || 0); }
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300);
    return () => clearTimeout(t);
  }, [fetchStudents]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Data Mahasiswa</h1>
        <p className="text-sm text-slate-500">{total} mahasiswa terdaftar</p>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <Input
            placeholder="Cari nama atau NIM..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200">
                {['Mahasiswa', 'NIM', 'Fakultas / Prodi', 'Total Pinjam', 'No. HP'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton cols={5} count={8} />
              ) : students.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-400 py-12 text-sm">Tidak ada mahasiswa</td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-white">{getInitials(s.name)}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{s.nim}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-700">{s.faculty || '-'}</p>
                      <p className="text-xs text-slate-500">{s.major || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">{s._count.borrowings}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{s.phone || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40">←</button>
            <span className="text-sm">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40">→</button>
          </div>
        )}
      </Card>
    </div>
  );
}
