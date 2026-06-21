'use client';
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Borrowing } from '@/types';

export default function AdminReturnsPage() {
  const { toast } = useToast();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [returnModal, setReturnModal] = useState<Borrowing | null>(null);
  const [returnForm, setReturnForm] = useState({ condition: 'Baik', notes: '' });
  const [processing, setProcessing] = useState(false);

  const fetchActive = async () => {
    setLoading(true);
    const res = await fetch('/api/borrowings?status=ACTIVE&limit=50');
    const data = await res.json();
    if (data.success) setBorrowings(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchActive(); }, []);

  const handleReturn = async () => {
    if (!returnModal) return;
    setProcessing(true);
    const res = await fetch(`/api/borrowings/${returnModal.id}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnForm),
    });
    const data = await res.json();
    if (data.success) {
      const { daysLate, fineAmount } = data.data;
      const msg = daysLate > 0
        ? `Pengembalian dicatat! Denda: ${formatCurrency(fineAmount)}`
        : 'Pengembalian berhasil dicatat!';
      toast(msg, daysLate > 0 ? 'warning' : 'success');
      setReturnModal(null);
      fetchActive();
    } else {
      toast(data.message || 'Gagal mencatat pengembalian', 'error');
    }
    setProcessing(false);
  };

  const filtered = borrowings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.student?.name?.toLowerCase().includes(q) ||
      b.student?.nim?.toLowerCase().includes(q) ||
      b.bookCopy?.book?.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Pengembalian Buku</h1>
        <p className="text-sm text-slate-500">{borrowings.length} buku sedang dipinjam</p>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <Input
            placeholder="Cari mahasiswa atau judul buku..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                {['Mahasiswa', 'Buku / Eks.', 'Batas Kembali', 'Keterlambatan', 'Aksi'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton cols={5} count={5} />
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-400 py-12 text-sm">Tidak ada data</td></tr>
              ) : (
                filtered.map((b) => {
                  const daysLate = (b as Borrowing & { daysLate?: number }).daysLate || 0;
                  return (
                    <tr key={b.id} className={`border-b border-slate-100 hover:bg-slate-50 ${daysLate > 0 ? 'bg-red-50/50' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold">{b.student?.name}</p>
                        <p className="text-xs text-slate-500">{b.student?.nim}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm line-clamp-1">{b.bookCopy?.book?.title}</p>
                        <p className="text-xs text-slate-500">Eks. #{b.bookCopy?.copyNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: daysLate > 0 ? '#dc2626' : '#374151' }}>
                        {formatDate(b.dueDate)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-red-600">
                        {daysLate > 0 ? `${daysLate} hari (${formatCurrency(daysLate * 1000)})` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="success" onClick={() => setReturnModal(b)}>
                          ↩ Catat Kembali
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={!!returnModal}
        onClose={() => setReturnModal(null)}
        title="Catat Pengembalian Buku"
        footer={
          <>
            <Button variant="outline" onClick={() => setReturnModal(null)}>Batal</Button>
            <Button variant="success" loading={processing} onClick={handleReturn}>Konfirmasi Kembali</Button>
          </>
        }
      >
        {returnModal && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Buku yang dikembalikan</p>
              <p className="text-sm font-bold">{returnModal.bookCopy?.book?.title}</p>
              <p className="text-xs text-slate-500">Eks. #{returnModal.bookCopy?.copyNumber} | {returnModal.student?.name}</p>
            </div>
            {(returnModal as Borrowing & { daysLate?: number }).daysLate! > 0 && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm font-bold text-red-700">
                  Terlambat {(returnModal as Borrowing & { daysLate?: number }).daysLate} hari
                </p>
                <p className="text-xs text-red-600">
                  Denda: {formatCurrency((returnModal as Borrowing & { daysLate?: number }).daysLate! * 1000)}
                </p>
              </div>
            )}
            <Select
              label="Kondisi Buku Saat Dikembalikan"
              value={returnForm.condition}
              onChange={(e) => setReturnForm((p) => ({ ...p, condition: e.target.value }))}
              options={[
                { value: 'Baik', label: 'Baik' },
                { value: 'Cukup Baik', label: 'Cukup Baik' },
                { value: 'Rusak Ringan', label: 'Rusak Ringan' },
                { value: 'Rusak Berat', label: 'Rusak Berat' },
              ]}
            />
            <Textarea label="Catatan" placeholder="Catatan kondisi atau keterangan lain..."
              value={returnForm.notes} onChange={(e) => setReturnForm((p) => ({ ...p, notes: e.target.value }))} />
          </div>
        )}
      </Modal>
    </div>
  );
}
