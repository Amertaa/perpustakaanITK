'use client';
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Borrowing } from '@/types';

interface ReportSummary {
  totalBorrowings: number;
  totalReturned: number;
  totalOverdue: number;
  totalFines: number;
  byCategory: { name: string; color: string | null; totalBooks: number; totalBorrowings: number }[];
}

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'borrowings'>('summary');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    setLoading(true);
    const params = new URLSearchParams({ type: activeTab, startDate, endDate });
    const res = await fetch(`/api/reports?${params}`);
    const data = await res.json();
    if (data.success) {
      if (activeTab === 'summary') setSummary(data.data);
      else setBorrowings(data.data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, [activeTab, startDate, endDate]);

  const exportCSV = () => {
    const rows = [
      ['No', 'NIM', 'Nama', 'Judul Buku', 'Tgl Pinjam', 'Batas Kembali', 'Tgl Kembali', 'Status'],
      ...borrowings.map((b, i) => [
        i + 1,
        b.student?.nim,
        b.student?.name,
        b.bookCopy?.book?.title,
        formatDate(b.borrowDate),
        formatDate(b.dueDate),
        b.returnDate ? formatDate(b.returnDate) : '-',
        b.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-peminjaman-${startDate}-${endDate}.csv`;
    a.click();
    toast('Laporan berhasil diexport!', 'success');
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Laporan Peminjaman</h1>
          <p className="text-sm text-slate-500">Rekap data peminjaman</p>
        </div>
        {activeTab === 'borrowings' && (
          <Button size="sm" variant="secondary" onClick={exportCSV}>📥 Export CSV</Button>
        )}
      </div>

      {/* Filter Tanggal */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <Input label="Dari Tanggal" type="date" value={startDate}
            onChange={(e) => setStartDate(e.target.value)} className="sm:w-40" />
          <Input label="Sampai Tanggal" type="date" value={endDate}
            onChange={(e) => setEndDate(e.target.value)} className="sm:w-40" />
          <Button onClick={fetchReport} loading={loading}>Filter</Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ label: 'Ringkasan', value: 'summary' }, { label: 'Detail Peminjaman', value: 'borrowings' }].map(({ label, value }) => (
          <button key={value} onClick={() => setActiveTab(value as 'summary' | 'borrowings')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === value ? 'bg-primary-700 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >{label}</button>
        ))}
      </div>

      {activeTab === 'summary' && summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Peminjaman', value: summary.totalBorrowings, color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Sudah Dikembalikan', value: summary.totalReturned, color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Masih Terlambat', value: summary.totalOverdue, color: 'text-red-700', bg: 'bg-red-50' },
              { label: 'Total Denda', value: formatCurrency(summary.totalFines), color: 'text-orange-700', bg: 'bg-orange-50' },
            ].map(({ label, value, color, bg }) => (
              <Card key={label} className={`!p-4 ${bg}`}>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-600 mt-1">{label}</p>
              </Card>
            ))}
          </div>

          {/* Per Kategori */}
          <Card>
            <h2 className="font-bold text-slate-800 mb-4">Peminjaman per Kategori</h2>
            <div className="space-y-2">
              {summary.byCategory
                .sort((a, b) => b.totalBorrowings - a.totalBorrowings)
                .map((cat) => {
                  const max = Math.max(...summary.byCategory.map((c) => c.totalBorrowings), 1);
                  return (
                    <div key={cat.name} className="flex items-center gap-3">
                      <span className="text-xs text-slate-600 w-32 truncate">{cat.name}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(cat.totalBorrowings / max) * 100}%`,
                            backgroundColor: cat.color || '#3b82f6',
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-8 text-right">{cat.totalBorrowings}</span>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'borrowings' && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200">
                  {['No', 'Mahasiswa', 'Buku', 'Tgl Pinjam', 'Batas Kembali', 'Tgl Kembali', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : borrowings.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-slate-400 py-12">Tidak ada data</td></tr>
                ) : (
                  borrowings.map((b, i) => (
                    <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-500">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold">{b.student?.name}</p>
                        <p className="text-xs text-slate-500">{b.student?.nim}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 max-w-[180px] line-clamp-1">
                        {b.bookCopy?.book?.title}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(b.borrowDate)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(b.dueDate)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {b.returnDate ? formatDate(b.returnDate) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          b.status === 'RETURNED' ? 'bg-green-100 text-green-700' :
                          b.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{b.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
