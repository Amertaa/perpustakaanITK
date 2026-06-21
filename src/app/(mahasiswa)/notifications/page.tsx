'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/shared/TopBar';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatRelative } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

const notifIcons: Record<string, string> = {
  BOOKING_APPROVED: '✅',
  BOOKING_REJECTED: '❌',
  BORROWING_REMINDER: '⏰',
  BORROWING_OVERDUE: '⚠️',
  EXTENSION_APPROVED: '✅',
  EXTENSION_REJECTED: '❌',
  RETURN_CONFIRMED: '📚',
  FINE_ISSUED: '💰',
  GENERAL: '📢',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetch('/api/notifications');
    const data = await res.json();
    if (data.success) setNotifications(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await fetch('/api/notifications/read-all', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <TopBar
        title={`Notifikasi${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
        rightAction={
          unreadCount > 0 ? (
            <Button variant="ghost" size="sm" loading={markingAll} onClick={markAllRead}>
              Baca semua
            </Button>
          ) : undefined
        }
      />
      <div className="px-4 py-4 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState icon="🔔" title="Belum ada notifikasi" description="Notifikasi akan muncul di sini" />
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={cn(
                'flex gap-3 p-4 rounded-2xl border transition-all cursor-pointer',
                n.isRead
                  ? 'bg-white border-slate-100'
                  : 'bg-primary-50 border-primary-200'
              )}
            >
              <span className="text-2xl flex-shrink-0">{notifIcons[n.type] || '📢'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('text-sm font-bold', n.isRead ? 'text-slate-700' : 'text-primary-800')}>
                    {n.title}
                  </p>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{formatRelative(n.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
