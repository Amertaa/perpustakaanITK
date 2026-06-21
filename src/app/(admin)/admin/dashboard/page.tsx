'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { DashboardStatSkeleton } from '@/components/ui/Skeleton';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { AdminDashboardStats, Booking } from '@/types';

interface AdminDashData {
  stats: AdminDashboardStats;
  recentBookings: Booking[];
}

const statCards = (stats: AdminDashboardStats) => [
  { label: 'Total Buku', value: stats.totalBooks, icon: '📚', color: 'bg-blue-600', href: '/admin/books' },
  { label: 'Booking Pending', value: stats.pendingBookings, icon: '⏳', color: 'bg-yellow-500', href: '/admin/bookings' },
  { label: 'Sedang Dipinjam', value: stats.activeBorrowings, icon: '📖', color: 'bg-green-600', href: '/admin/borrowings' },
  { label: 'Terlambat', value: stats.overdueBooks, icon: '⚠️', color: 'bg-red-600', href: '/admin/overdue' },
  { label: 'Eksemplar Tersedia', value: stats.availableCopies, icon: '✅', color: 'bg-teal-600', href: '/admin/books' },
  { label: 'Total Mahasiswa', value: stats.totalStudents, icon: '👥', color: 'bg-purple-600', href: '/admin/students' },
  { label: 'Kembali Hari Ini', value: stats.returnedToday, icon: '↩️', color: 'bg-indigo-600', href: '/admin/returns' },
  { label: 'Denda Belum Bayar', value: formatCurrency(stats.totalFines), icon: '💰', color: 'bg-orange-600', href: '/admin/reports' },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard Admin</h1>
        <p className="text-sm text-slate-500">Perpustakaan Institut Teknologi Kalimantan</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <DashboardStatSkeleton count={8} />
      ) : data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards(data.stats).map((s, i) => (
            <Link key={i} href={s.href}>
              <Card hover className="!p-4">
                <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3`}>
                  {s.icon}
                </div>
                <p className="text-lg font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      ) : null}

      {/* Booking Pending */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">Booking Menunggu Persetujuan</h2>
          <Link href="/admin/bookings" className="text-xs text-primary-700 font-semibold">Lihat semua</Link>
        </div>
        {data?.recentBookings && data.recentBookings.length > 0 ? (
          <div className="space-y-3">
            {data.recentBookings.map((booking) => (
              <Link key={booking.id} href={`/admin/bookings/${booking.id}`}>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="text-xl">📋</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {booking.bookCopy?.book?.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(booking as unknown as { student?: { nim: string; name: string } }).student?.nim} — {(booking as unknown as { student?: { nim: string; name: string } }).student?.name}
                    </p>
                    <p className="text-xs text-slate-400">{formatDateTime(booking.bookingDate)}</p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-6">Tidak ada booking pending</p>
        )}
      </Card>

      {/* Aksi Cepat */}
      <Card>
        <h2 className="font-bold text-slate-800 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { href: '/admin/books/new', icon: '➕', label: 'Tambah Buku' },
            { href: '/admin/bookings', icon: '✅', label: 'Proses Booking' },
            { href: '/admin/borrowings', icon: '📖', label: 'Catat Pinjam' },
            { href: '/admin/returns', icon: '↩️', label: 'Catat Kembali' },
          ].map(({ href, icon, label }) => (
            <Link key={href} href={href}>
              <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-primary-50 hover:border-primary-200 border border-transparent transition-colors">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-medium text-slate-600 text-center">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
