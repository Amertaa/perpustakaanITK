'use client';
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import type { BookCategory } from '@/types';

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: 'add' | 'edit'; data?: BookCategory } | null>(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success) setCategories(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setForm({ name: '', description: '', color: '#3b82f6' });
    setModal({ type: 'add' });
  };
  const openEdit = (cat: BookCategory) => {
    setForm({ name: cat.name, description: cat.description || '', color: cat.color || '#3b82f6' });
    setModal({ type: 'edit', data: cat });
  };

  const handleSave = async () => {
    if (!form.name) { toast('Nama kategori wajib diisi', 'error'); return; }
    setSaving(true);
    const url = modal?.type === 'edit' ? `/api/categories/${modal.data?.id}` : '/api/categories';
    const method = modal?.type === 'edit' ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast(`Kategori berhasil ${modal?.type === 'edit' ? 'diupdate' : 'ditambahkan'}!`, 'success');
      setModal(null);
      fetchCategories();
    } else {
      toast(data.message || 'Gagal menyimpan', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/categories/${deleteId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      toast('Kategori berhasil dihapus', 'success');
      fetchCategories();
    } else {
      toast(data.message || 'Gagal menghapus', 'error');
    }
    setDeleteId(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Kategori</h1>
          <p className="text-sm text-slate-500">{categories.length} kategori</p>
        </div>
        <Button size="sm" onClick={openAdd}>+ Tambah Kategori</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="relative">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0"
                  style={{ backgroundColor: (cat.color || '#3b82f6') + '20' }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{cat.name}</p>
                  <p className="text-xs text-slate-500">{cat._count?.books || 0} buku</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => openEdit(cat)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => setDeleteId(cat.id)}>Hapus</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.type === 'edit' ? 'Edit Kategori' : 'Tambah Kategori'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>Batal</Button>
            <Button loading={saving} onClick={handleSave}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Nama Kategori" placeholder="Teknologi Informasi" value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <Input label="Deskripsi (opsional)" placeholder="Deskripsi singkat kategori"
            value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Warna</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color}
                onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                className="w-10 h-10 rounded-lg cursor-pointer border-0" />
              <span className="text-sm text-slate-500">{form.color}</span>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Kategori"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete}>Hapus</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Kategori hanya bisa dihapus jika tidak memiliki buku.</p>
      </Modal>
    </div>
  );
}
