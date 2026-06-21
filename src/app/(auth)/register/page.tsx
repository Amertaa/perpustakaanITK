'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const FACULTIES = [
  'Fakultas Teknologi Industri',
  'Fakultas Ilmu Alam dan Teknologi Rekayasa',
  'Fakultas Teknik Kelautan dan Kebumian',
];
const MAJORS: Record<string, string[]> = {
  'Fakultas Teknologi Industri': ['Teknik Informatika', 'Teknik Industri', 'Teknik Kimia', 'Teknik Material dan Metalurgi'],
  'Fakultas Ilmu Alam dan Teknologi Rekayasa': ['Fisika', 'Matematika', 'Teknik Lingkungan'],
  'Fakultas Teknik Kelautan dan Kebumian': ['Teknik Sipil', 'Teknik Geologi', 'Teknik Kelautan'],
};

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nim: '', name: '', email: '', password: '', confirmPassword: '',
    phone: '', faculty: '', major: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.nim || !/^\d{8,12}$/.test(form.nim)) e.nim = 'NIM harus 8-12 digit angka';
    if (!form.name || form.name.length < 3) e.name = 'Nama minimal 3 karakter';
    if (!form.email) e.email = 'Email wajib diisi';
    if (!form.password || form.password.length < 6) e.password = 'Password minimal 6 karakter';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Password tidak cocok';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast(data.message || 'Registrasi gagal', 'error');
        return;
      }
      toast('Registrasi berhasil! Silakan login.', 'success');
      router.push('/login');
    } catch {
      toast('Koneksi gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const majors = form.faculty ? MAJORS[form.faculty] || [] : [];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-1">Daftar Akun</h2>
      <p className="text-sm text-slate-500 mb-6">Buat akun untuk mulai meminjam buku</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="NIM"
            placeholder="04231047"
            value={form.nim}
            onChange={(e) => set('nim', e.target.value)}
            error={errors.nim}
            required
          />
          <Input
            label="Nama Lengkap"
            placeholder="Nama kamu"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={errors.name}
            required
            className="col-span-1"
          />
        </div>
        <Input
          label="Email Kampus"
          type="email"
          placeholder="nim@student.itk.ac.id"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="No. HP (opsional)"
          type="tel"
          placeholder="08xxxxxxxxxx"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
        />
        <Select
          label="Fakultas (opsional)"
          value={form.faculty}
          onChange={(e) => { set('faculty', e.target.value); set('major', ''); }}
          options={FACULTIES.map((f) => ({ value: f, label: f }))}
          placeholder="-- Pilih Fakultas --"
        />
        {form.faculty && (
          <Select
            label="Program Studi"
            value={form.major}
            onChange={(e) => set('major', e.target.value)}
            options={majors.map((m) => ({ value: m, label: m }))}
            placeholder="-- Pilih Prodi --"
          />
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Password"
            type="password"
            placeholder="Min. 6 karakter"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            error={errors.password}
            required
          />
          <Input
            label="Konfirmasi Password"
            type="password"
            placeholder="Ulangi password"
            value={form.confirmPassword}
            onChange={(e) => set('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            required
          />
        </div>
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Daftar Sekarang
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-primary-700 font-semibold">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
