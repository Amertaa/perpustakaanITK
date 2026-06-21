'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import type { Book, BookCategory } from '@/types';

export default function AdminBooksPage() {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const limit = 10;

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (categoryId) params.set('categoryId', categoryId);
    const res = await fetch(`/api/books?${params}`);
    const data = await res.json();
    if (data.success) { setBooks(data.data); setTotal(data.meta?.total || 0); }
    setLoading(false);
  }, [search, categoryId, page]);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => { if (d.success) setCategories(d.data); });
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchBooks, 300);
    return () => clearTimeout(t);
  }, [fetchBooks]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/books/${deleteId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      toast('Buku berhasil dihapus', 'success');
      fetchBooks();
    } else {
      toast(data.message || 'Gagal menghapus buku', 'error');
    }
    setDeleteId(null);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Buku</h1>
          <p className="text-sm text-slate-500">{total} buku terdaftar</p>
        </div>
        <Link href="/admin/books/new">
          <Button size="sm">➕ Tambah Buku</Button>
        </Link>
      </div>

      <Card>
        <div className="flex gap-2 flex-col sm:flex-row mb-4">
          <Input
            placeholder="Cari judul, penulis, ISBN..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <Select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Semua Kategori"
            className="sm:w-48"
          />
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200">
                {['Judul / Penulis', 'Kategori', 'ISBN', 'Eksemplar', 'Tersedia', 'Aksi'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 py-2 px-2 first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton cols={6} count={5} />
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 text-sm py-12">
                    Tidak ada buku ditemukan
                  </td>
                </tr>
              ) : (
                books.map((book) => {
                  const avail = book.copies?.filter((c) => c.status === 'AVAILABLE').length || 0;
                  return (
                    <tr key={book.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2 pl-0">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">{book.title}</p>
                        <p className="text-xs text-slate-500">{book.author}</p>
                      </td>
                      <td className="py-3 px-2">
                        {book.category && (
                          <Badge color="blue" size="sm">{book.category.name}</Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 text-xs text-slate-500">{book.isbn || '-'}</td>
                      <td className="py-3 px-2 text-sm font-semibold text-slate-700">{book.totalCopies}</td>
                      <td className="py-3 px-2">
                        <Badge color={avail > 0 ? 'green' : 'red'} size="sm">{avail}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <Link href={`/admin/books/${book.id}/edit`}>
                            <Button variant="outline" size="sm">Edit</Button>
                          </Link>
                          <Button variant="danger" size="sm" onClick={() => setDeleteId(book.id)}>Hapus</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40">←</button>
            <span className="text-sm text-slate-600">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40">→</button>
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Buku"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Yakin ingin menghapus buku ini? Semua eksemplarnya juga akan dihapus.</p>
      </Modal>
    </div>
  );
}
