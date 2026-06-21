'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TopBar from '@/components/shared/TopBar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import { CopyStatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { truncate } from '@/lib/utils';
import type { Book, BookCopy } from '@/types';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetch(`/api/books/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setBook(d.data); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!selectedCopy) return;
    setBooking(true);
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookCopyId: selectedCopy.id, notes }),
    });
    const data = await res.json();
    if (data.success) {
      toast('Booking berhasil! Menunggu persetujuan admin.', 'success');
      setShowModal(false);
      fetch(`/api/books/${id}`).then((r) => r.json()).then((d) => { if (d.success) setBook(d.data); });
    } else {
      toast(data.message || 'Booking gagal', 'error');
    }
    setBooking(false);
  };

  if (loading) {
    return (
      <>
        <TopBar title="Detail Buku" showBack />
        <div className="p-4 space-y-4">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20" />
        </div>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <TopBar title="Detail Buku" showBack />
        <div className="p-6 text-center text-slate-500">Buku tidak ditemukan</div>
      </>
    );
  }

  const availableCopies = book.copies?.filter((c) => c.status === 'AVAILABLE') || [];

  return (
    <>
      <TopBar title="Detail Buku" showBack />

      <div className="px-4 py-4 space-y-4">
        {/* Cover & Info Utama */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="h-52 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="h-full object-contain" />
            ) : (
              <span className="text-8xl">📖</span>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h1 className="text-lg font-bold text-slate-800 leading-tight flex-1">{book.title}</h1>
              <Badge color={availableCopies.length > 0 ? 'green' : 'red'}>
                {availableCopies.length > 0 ? `${availableCopies.length} Tersedia` : 'Habis'}
              </Badge>
            </div>
            <p className="text-sm text-primary-700 font-semibold">{book.author}</p>
            {book.category && (
              <Badge color="blue" className="mt-2">{book.category.name}</Badge>
            )}
          </div>
        </div>

        {/* Info Detail */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4">
          <h2 className="text-sm font-bold text-slate-700 mb-3">Informasi Buku</h2>
          <div className="space-y-2">
            {[
              { label: 'Penerbit', value: book.publisher },
              { label: 'Tahun', value: book.year },
              { label: 'Halaman', value: book.pages ? `${book.pages} halaman` : null },
              { label: 'Bahasa', value: book.language },
              { label: 'ISBN', value: book.isbn },
              { label: 'Lokasi', value: book.location },
            ].filter((i) => i.value).map(({ label, value }) => (
              <div key={label} className="flex gap-2">
                <span className="text-xs text-slate-500 w-20 flex-shrink-0">{label}</span>
                <span className="text-xs text-slate-700 font-medium">: {value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deskripsi */}
        {book.description && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4">
            <h2 className="text-sm font-bold text-slate-700 mb-2">Deskripsi</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{book.description}</p>
          </div>
        )}

        {/* Eksemplar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4">
          <h2 className="text-sm font-bold text-slate-700 mb-3">
            Ketersediaan Eksemplar ({book.copies?.length || 0} total)
          </h2>
          <div className="space-y-2">
            {book.copies?.map((copy) => (
              <div
                key={copy.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  copy.status === 'AVAILABLE' && selectedCopy?.id === copy.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-100 bg-slate-50'
                }`}
                onClick={() => copy.status === 'AVAILABLE' && setSelectedCopy(copy)}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">Eks. #{copy.copyNumber}</p>
                  <p className="text-xs text-slate-500">Kondisi: {copy.condition || 'Baik'}</p>
                </div>
                <CopyStatusBadge status={copy.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Tombol Booking */}
        {user?.role === 'MAHASISWA' && (
          <Button
            fullWidth
            size="lg"
            disabled={availableCopies.length === 0}
            onClick={() => setShowModal(true)}
          >
            {availableCopies.length > 0 ? '📋 Booking Buku Ini' : '❌ Buku Tidak Tersedia'}
          </Button>
        )}
      </div>

      {/* Modal Konfirmasi Booking */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Konfirmasi Booking"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
            <Button onClick={handleBook} loading={booking} disabled={!selectedCopy}>
              Booking Sekarang
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">Buku</p>
            <p className="text-sm font-bold text-slate-800">{book.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{book.author}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Pilih Eksemplar</p>
            <div className="space-y-2">
              {availableCopies.map((copy) => (
                <button
                  key={copy.id}
                  onClick={() => setSelectedCopy(copy)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                    selectedCopy?.id === copy.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <p className="text-sm font-semibold">Eksemplar #{copy.copyNumber}</p>
                  <p className="text-xs text-slate-500">Kondisi: {copy.condition}</p>
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Catatan (opsional)"
            placeholder="Tambahkan catatan untuk admin..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-xs text-yellow-800">
              ⚠️ Booking berlaku 48 jam. Segera ambil buku di perpustakaan setelah disetujui admin.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
