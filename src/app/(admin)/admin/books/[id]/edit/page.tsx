'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { Book, BookCategory } from '@/types';

export default function EditBookPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    isbn: '', title: '', author: '', publisher: '', year: '',
    categoryId: '', description: '', coverUrl: '', pages: '',
    language: 'Indonesia', location: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch(`/api/books/${id}`).then((r) => r.json()),
    ]).then(([catData, bookData]) => {
      if (catData.success) setCategories(catData.data);
      if (bookData.success) {
        const b: Book = bookData.data;
        setForm({
          isbn: b.isbn || '',
          title: b.title,
          author: b.author,
          publisher: b.publisher || '',
          year: b.year ? String(b.year) : '',
          categoryId: b.categoryId,
          description: b.description || '',
          coverUrl: b.coverUrl || '',
          pages: b.pages ? String(b.pages) : '',
          language: b.language || 'Indonesia',
          location: b.location || '',
        });
      }
    }).finally(() => setFetching(false));
  }, [id]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast('Buku berhasil diupdate!', 'success');
      router.push('/admin/books');
    } else {
      toast(data.message || 'Gagal mengupdate buku', 'error');
    }
    setLoading(false);
  };

  if (fetching) return <div className="p-6 text-center text-slate-500">Memuat data buku...</div>;

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-800">Edit Buku</h1>
        <p className="text-sm text-slate-500">Update informasi buku</p>
      </div>
      <form onSubmit={handleSubmit}>
        <Card className="space-y-4">
          <Input label="Judul Buku" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          <Input label="Penulis" value={form.author} onChange={(e) => set('author', e.target.value)} required />
          <Select label="Kategori" value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="ISBN" value={form.isbn} onChange={(e) => set('isbn', e.target.value)} />
            <Input label="Penerbit" value={form.publisher} onChange={(e) => set('publisher', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tahun" type="number" value={form.year} onChange={(e) => set('year', e.target.value)} />
            <Input label="Halaman" type="number" value={form.pages} onChange={(e) => set('pages', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Bahasa" value={form.language} onChange={(e) => set('language', e.target.value)}
              options={[{ value: 'Indonesia', label: 'Indonesia' }, { value: 'Inggris', label: 'Inggris' }, { value: 'Lainnya', label: 'Lainnya' }]} />
            <Input label="Lokasi Rak" value={form.location} onChange={(e) => set('location', e.target.value)} />
          </div>
          <Input label="URL Cover" value={form.coverUrl} onChange={(e) => set('coverUrl', e.target.value)} />
          <Textarea label="Deskripsi" value={form.description} onChange={(e) => set('description', e.target.value)} />
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" loading={loading}>Update Buku</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
