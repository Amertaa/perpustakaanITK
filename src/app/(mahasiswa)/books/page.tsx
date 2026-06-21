'use client';
import { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/shared/TopBar';
import BookCard from '@/components/shared/BookCard';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { BookCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import type { Book, BookCategory } from '@/types';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (categoryId) params.set('categoryId', categoryId);
    const res = await fetch(`/api/books?${params}`);
    const data = await res.json();
    if (data.success) {
      setBooks(data.data);
      setTotal(data.meta?.total || 0);
    }
    setLoading(false);
  }, [search, categoryId, page]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategories(d.data); });
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchBooks, 300);
    return () => clearTimeout(t);
  }, [fetchBooks]);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <TopBar title="Katalog Buku" />
      <div className="px-4 py-4 space-y-4">
        {/* Search & Filter */}
        <div className="space-y-2">
          <Input
            placeholder="Cari judul, penulis, ISBN..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button
              onClick={() => { setCategoryId(''); setPage(1); }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                !categoryId ? 'bg-primary-700 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategoryId(cat.id); setPage(1); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  categoryId === cat.id ? 'bg-primary-700 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Info total */}
        {!loading && (
          <p className="text-xs text-slate-500">
            {total} buku ditemukan{search ? ` untuk "${search}"` : ''}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <BookCardSkeleton key={i} />)}
          </div>
        ) : books.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Buku tidak ditemukan"
            description="Coba kata kunci atau kategori yang berbeda"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {books.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40"
            >
              ←
            </button>
            <span className="text-sm text-slate-600">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40"
            >
              →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
