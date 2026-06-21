'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardTopBar } from '@/components/shared/TopBar';
import Card from '@/components/ui/Card';
import { DashboardStatSkeleton } from '@/components/ui/Skeleton';
import { BorrowingStatusBadge } from '@/components/shared/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatCurrency, getDaysRemaining, isExpiringSoon } from '@/lib/utils';
import type { MahasiswaDashboardStats, Borrowing } from '@/types';

interface DashboardData {
  stats: MahasiswaDashboardStats;
  recentBorrowings: Borrowing[];
}

const statCards = (stats: MahasiswaDashboardStats) => [
  { label: 'Booking Aktif', value: stats.activeBookings, icon: '📋', color: 'from-blue-500 to-blue-600', href: '/bookings' },
  { label: 'Sedang Dipinjam', value: stats.activeBorrowings, icon: '📖', color: 'from-green-500 to-green-600', href: '/borrowings' },
  { label: 'Buku Terlambat', value: stats.overdueBooks, icon: '⚠️', color: 'from-red-500 to-red-600', href: '/borrowings' },
  { label: 'Riwayat', value: stats.totalHistory, icon: '🗂️', color: 'from-purple-500 to-purple-600', href: '/history' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <DashboardTopBar
        name={user?.name || 'Mahasiswa'}
        notifCount={data?.stats.unreadNotifications}
      />

      <div className="px-4 py-4 space-y-5">
        {/* Peringatan denda */}
        {data?.stats.unpaidFines ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-bold text-red-700">Ada Denda Belum Dibayar</p>
              <p className="text-xs text-red-600">
                Denda: {formatCurrency(data.stats.unpaidFines)} — Bayar di perpustakaan
              </p>
            </div>
          </div>
        ) : null}

        {/* Stats */}
        {loading ? (
          <DashboardStatSkeleton count={4} />
        ) : data ? (
          <div className="grid grid-cols-2 gap-3">
            {statCards(data.stats).map((s) => (
              <Link key={s.href + s.label} href={s.href}>
                <div className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white`}>
                  <span className="text-2xl">{s.icon}</span>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-white/80 mt-0.5">{s.label}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        {/* Aksi Cepat */}
        <Card>
          <h2 className="text-sm font-bold text-slate-700 mb-3">Aksi Cepat</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { href: '/books', icon: '🔍', label: 'Cari Buku' },
              { href: '/bookings', icon: '📋', label: 'Booking Saya' },
              { href: '/history', icon: '📅', label: 'Riwayat' },
            ].map(({ href, icon, label }) => (
              <Link key={href} href={href}>
                <div className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-xs font-medium text-slate-600">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Peminjaman Aktif */}
        {data?.recentBorrowings && data.recentBorrowings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-700">Peminjaman Aktif</h2>
              <Link href="/borrowings" className="text-xs text-primary-700 font-semibold">Lihat semua</Link>
            </div>
            <div className="space-y-3">
              {data.recentBorrowings.slice(0, 3).map((b) => {
                const daysLeft = getDaysRemaining(b.dueDate);
                const expiring = isExpiringSoon(b.dueDate);
                return (
                  <Link key={b.id} href={`/borrowings`}>
                    <Card className="hover:shadow-card-hover transition-shadow" hover>
                      <div className="flex gap-3 items-start">
                        <div className="w-10 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">📖</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {b.bookCopy?.book?.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Kembali: {formatDate(b.dueDate)}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <BorrowingStatusBadge status={b.status} />
                            {b.status === 'ACTIVE' && (
                              <span className={`text-xs font-medium ${expiring ? 'text-red-600' : 'text-slate-500'}`}>
                                {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Hari ini!'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Banner Info */}
        {!data?.recentBorrowings?.length && !loading && (
          <Card className="bg-gradient-to-br from-primary-700 to-primary-800 text-white border-0">
            <div className="flex items-center gap-4">
              <span className="text-4xl">📚</span>
              <div>
                <p className="font-bold text-base">Mulai Meminjam Buku!</p>
                <p className="text-xs text-primary-200 mt-0.5">
                  Cari buku favorit kamu dan lakukan booking sekarang.
                </p>
                <Link href="/books" className="mt-2 inline-block bg-white text-primary-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                  Jelajahi Buku →
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
