'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/shared/TopBar';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handleLogout = async () => {
    if (!confirm('Yakin ingin keluar?')) return;
    setLogoutLoading(true);
    await logout();
    router.replace('/login');
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmNew) {
      toast('Konfirmasi password tidak cocok', 'error');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast('Password baru minimal 6 karakter', 'error');
      return;
    }
    setPwLoading(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      toast('Password berhasil diubah!', 'success');
      setShowPasswordModal(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } else {
      toast(data.message || 'Gagal mengubah password', 'error');
    }
    setPwLoading(false);
  };

  return (
    <>
      <TopBar title="Profil Saya" />
      <div className="px-4 py-4 space-y-4">
        {/* Avatar & Info */}
        <Card className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary-700 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl font-bold text-white">{getInitials(user?.name || 'U')}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">{user?.name}</h2>
          <p className="text-sm text-primary-700 font-semibold">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
            Mahasiswa
          </span>
        </Card>

        {/* Menu */}
        <Card padding="none">
          {[
            { icon: '🔔', label: 'Notifikasi', href: '/notifications' },
            { icon: '📚', label: 'Riwayat Peminjaman', href: '/history' },
          ].map(({ icon, label, href }) => (
            <a key={href} href={href} className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
              <span className="text-xl">{icon}</span>
              <span className="flex-1 text-sm font-medium text-slate-700">{label}</span>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors"
          >
            <span className="text-xl">🔐</span>
            <span className="flex-1 text-left text-sm font-medium text-slate-700">Ubah Password</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Card>

        {/* Info Aplikasi */}
        <Card>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tentang Aplikasi</h3>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <p className="text-sm font-bold text-slate-800">Perpustakaan ITK</p>
              <p className="text-xs text-slate-500">Institut Teknologi Kalimantan</p>
              <p className="text-xs text-slate-400">Versi 1.0.0</p>
            </div>
          </div>
        </Card>

        <Button variant="danger" fullWidth size="lg" loading={logoutLoading} onClick={handleLogout}>
          🚪 Keluar
        </Button>
      </div>

      {/* Modal Ganti Password */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Ubah Password"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Batal</Button>
            <Button onClick={handleChangePassword} loading={pwLoading}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Password Lama"
            type="password"
            placeholder="••••••••"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
          />
          <Input
            label="Password Baru"
            type="password"
            placeholder="Min. 6 karakter"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
          />
          <Input
            label="Konfirmasi Password Baru"
            type="password"
            placeholder="Ulangi password baru"
            value={pwForm.confirmNew}
            onChange={(e) => setPwForm((p) => ({ ...p, confirmNew: e.target.value }))}
          />
        </div>
      </Modal>
    </>
  );
}
