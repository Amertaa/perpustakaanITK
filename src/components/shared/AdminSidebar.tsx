'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: '📊',
  },
  {
    href: '/admin/books',
    label: 'Manajemen Buku',
    icon: '📚',
  },
  {
    href: '/admin/categories',
    label: 'Kategori',
    icon: '🏷️',
  },
  {
    href: '/admin/bookings',
    label: 'Booking',
    icon: '📋',
  },
  {
    href: '/admin/borrowings',
    label: 'Peminjaman',
    icon: '🔄',
  },
  {
    href: '/admin/returns',
    label: 'Pengembalian',
    icon: '↩️',
  },
  {
    href: '/admin/overdue',
    label: 'Keterlambatan',
    icon: '⚠️',
  },
  {
    href: '/admin/students',
    label: 'Data Mahasiswa',
    icon: '👥',
  },
  {
    href: '/admin/reports',
    label: 'Laporan',
    icon: '📈',
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-primary-900 text-white fixed left-0 top-0 bottom-0 z-40">
      <div className="p-5 border-b border-primary-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div>
            <p className="font-bold text-sm">Perpustakaan</p>
            <p className="text-xs text-primary-300">Institut Teknologi Kalimantan</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5',
                active
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-200 hover:bg-primary-800 hover:text-white'
              )}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-primary-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-primary-800 hover:text-red-200 transition-all"
        >
          <span>🚪</span>
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const mainItems = navItems.slice(0, 5);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-primary-900 border-t border-primary-800 md:hidden">
      <div className="flex items-center">
        {mainItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2',
                active ? 'text-white' : 'text-primary-400'
              )}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-[10px] font-medium">{label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
