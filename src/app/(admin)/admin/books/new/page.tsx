'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { BookCategory } from '@/types';

export default function NewBookPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    isbn: '', title: '', author: '', publisher: '', year: '',
    categoryId: '', description: '', coverUrl: '', pages: '',
    language: 'Indonesia', location: '', totalCopies: '1',
  });

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => { if (d.success) setCategories(d.data); });
  }, []);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.categoryId) {
      toast('Judul, penulis, dan kategori wajib diisi', 'error');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast('Buku berhasil ditambahkan!', 'success');
      router.push('/admin/books');
    } else {
      toast(data.message || 'Gagal menambahkan buku', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-800">Tambah Buku Baru</h1>
        <p className="text-sm text-slate-500">Isi data buku dan jumlah eksemplar</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="space-y-4">
          <h2 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Informasi Buku</h2>
          <Input label="Judul Buku" placeholder="Masukkan judul buku" value={form.title}
            onChange={(e) => set('title', e.target.value)} required />
          <Input label="Penulis" placeholder="Nama penulis" value={form.author}
            onChange={(e) => set('author', e.target.value)} required />
          <Select
            label="Kategori"
            value={form.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="-- Pilih Kategori --"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="ISBN" placeholder="9780000000000" value={form.isbn}
              onChange={(e) => set('isbn', e.target.value)} />
            <Input label="Penerbit" placeholder="Nama penerbit" value={form.publisher}
              onChange={(e) => set('publisher', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tahun Terbit" type="number" placeholder="2024" value={form.year}
              onChange={(e) => set('year', e.target.value)} />
            <Input label="Jumlah Halaman" type="number" placeholder="300" value={form.pages}
              onChange={(e) => set('pages', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Bahasa"
              value={form.language}
              onChange={(e) => set('language', e.target.value)}
              options={[{ value: 'Indonesia', label: 'Indonesia' }, { value: 'Inggris', label: 'Inggris' }, { value: 'Lainnya', label: 'Lainnya' }]}
            />
            <Input label="Lokasi Rak" placeholder="Rak A-01" value={form.location}
              onChange={(e) => set('location', e.target.value)} />
          </div>
          <Input label="URL Cover (opsional)" placeholder="https://..." value={form.coverUrl}
            onChange={(e) => set('coverUrl', e.target.value)} />
          <Textarea label="Deskripsi" placeholder="Deskripsi singkat tentang buku..." value={form.description}
            onChange={(e) => set('description', e.target.value)} />

          <div className="pt-2 border-t border-slate-100">
            <Input
              label="Jumlah Eksemplar"
              type="number"
              min="1"
              max="20"
              value={form.totalCopies}
              onChange={(e) => set('totalCopies', e.target.value)}
              hint="Sistem akan otomatis membuat eksemplar sejumlah ini"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" loading={loading}>Simpan Buku</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
