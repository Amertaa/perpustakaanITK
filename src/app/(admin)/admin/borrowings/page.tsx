'use client';
import { useEffect, useState, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import { BorrowingStatusBadge } from '@/components/shared/StatusBadge';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Borrowing, Booking, Student, BookCopy } from '@/types';

export default function AdminBorrowingsPage() {
  const { toast } = useToast();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ACTIVE');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ studentId: '', bookCopyId: '', bookingId: '', notes: '' });
  const [addLoading, setAddLoading] = useState(false);
  const limit = 10;

  const fetchBorrowings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter) params.set('status', filter);
    const res = await fetch(`/api/borrowings?${params}`);
    const data = await res.json();
    if (data.success) { setBorrowings(data.data); setTotal(data.meta?.total || 0); }
    setLoading(false);
  }, [filter, page]);

  useEffect(() => {
    fetchBorrowings();
    fetch('/api/bookings?status=APPROVED&limit=50')
      .then((r) => r.json())
      .then((d) => { if (d.success) setBookings(d.data); });
  }, [fetchBorrowings]);

  const handleAddBorrowing = async () => {
    if (!addForm.bookingId) { toast('Pilih booking terlebih dahulu', 'error'); return; }
    const booking = bookings.find((b) => b.id === addForm.bookingId);
    if (!booking) return;
    setAddLoading(true);
    const res = await fetch('/api/borrowings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: booking.studentId,
        bookCopyId: booking.bookCopyId,
        bookingId: booking.id,
        notes: addForm.notes,
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast('Peminjaman berhasil dicatat!', 'success');
      setAddModal(false);
      setAddForm({ studentId: '', bookCopyId: '', bookingId: '', notes: '' });
      fetchBorrowings();
    } else {
      toast(data.message || 'Gagal mencatat peminjaman', 'error');
    }
    setAddLoading(false);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Peminjaman</h1>
          <p className="text-sm text-slate-500">{total} data</p>
        </div>
        <Button size="sm" onClick={() => setAddModal(true)}>+ Catat Pinjam</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[{ label: 'Aktif', value: 'ACTIVE' }, { label: 'Dikembalikan', value: 'RETURNED' }, { label: 'Semua', value: '' }].map(({ label, value }) => (
          <button key={value} onClick={() => { setFilter(value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === value ? 'bg-primary-700 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >{label}</button>
        ))}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-200">
                {['Mahasiswa', 'Buku', 'Tgl Pinjam', 'Batas Kembali', 'Status', 'Denda', 'Aksi'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton cols={7} count={5} />
              ) : borrowings.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-slate-400 py-12 text-sm">Tidak ada data peminjaman</td></tr>
              ) : (
                borrowings.map((b) => {
                  const daysLate = (b as Borrowing & { daysLate?: number }).daysLate || 0;
                  const fine = daysLate * 1000;
                  return (
                    <tr key={b.id} className={`border-b border-slate-100 hover:bg-slate-50 ${daysLate > 0 ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold">{b.student?.name}</p>
                        <p className="text-xs text-slate-500">{b.student?.nim}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 max-w-[200px]">
                        <p className="line-clamp-1">{b.bookCopy?.book?.title}</p>
                        <p className="text-xs text-slate-500">#{b.bookCopy?.copyNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(b.borrowDate)}</td>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: daysLate > 0 ? '#dc2626' : '#374151' }}>
                        {formatDate(b.dueDate)}
                        {daysLate > 0 && <span className="block text-red-500">+{daysLate} hari</span>}
                      </td>
                      <td className="px-4 py-3"><BorrowingStatusBadge status={b.status} /></td>
                      <td className="px-4 py-3 text-xs font-semibold text-red-600">
                        {fine > 0 ? formatCurrency(fine) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {b.status === 'ACTIVE' && (
                          <Button size="sm" variant="success" onClick={() => window.location.href = `/admin/returns`}>
                            ↩ Kembalikan
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
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

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Catat Peminjaman Baru"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddModal(false)}>Batal</Button>
            <Button loading={addLoading} onClick={handleAddBorrowing}>Catat Peminjaman</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Pilih booking yang sudah disetujui untuk dicatat sebagai peminjaman.</p>
          <Select
            label="Pilih Booking Disetujui"
            value={addForm.bookingId}
            onChange={(e) => setAddForm((p) => ({ ...p, bookingId: e.target.value }))}
            options={bookings.map((b) => ({
              value: b.id,
              label: `${(b as unknown as { student?: { nim: string } }).student?.nim} — ${b.bookCopy?.book?.title?.substring(0, 30)}`,
            }))}
            placeholder="-- Pilih Booking --"
            required
          />
          <Textarea label="Catatan (opsional)" placeholder="Catatan peminjaman..." value={addForm.notes}
            onChange={(e) => setAddForm((p) => ({ ...p, notes: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
