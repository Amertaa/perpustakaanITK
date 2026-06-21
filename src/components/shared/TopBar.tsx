'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export default function TopBar({ title, showBack, rightAction, className }: TopBarProps) {
  const router = useRouter();
  return (
    <header className={cn('sticky top-0 z-30 bg-white border-b border-slate-100 safe-area-pt', className)}>
      <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="flex-1 text-base font-bold text-slate-800 truncate">{title}</h1>
        {rightAction}
      </div>
    </header>
  );
}

export function DashboardTopBar({
  name,
  notifCount,
}: {
  name: string;
  notifCount?: number;
}) {
  return (
    <header className="sticky top-0 z-30 bg-primary-700 safe-area-pt">
      <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
        <div className="flex-1">
          <p className="text-xs text-primary-200">Selamat datang,</p>
          <p className="text-sm font-bold text-white truncate">{name}</p>
        </div>
        <Link href="/notifications" className="relative p-2">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notifCount && notifCount > 0 ? (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
