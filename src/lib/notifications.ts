import prisma from './db';
import type { NotificationType } from '@/types';

interface CreateNotificationParams {
  studentId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      studentId: params.studentId,
      title: params.title,
      message: params.message,
      type: params.type,
      relatedId: params.relatedId,
    },
  });
}

export async function notifyBookingApproved(studentId: string, bookTitle: string, bookingId: string) {
  return createNotification({
    studentId,
    title: 'Booking Disetujui! 🎉',
    message: `Booking kamu untuk buku "${bookTitle}" telah disetujui. Segera ambil buku di perpustakaan dalam 48 jam.`,
    type: 'BOOKING_APPROVED',
    relatedId: bookingId,
  });
}

export async function notifyBookingRejected(studentId: string, bookTitle: string, reason: string, bookingId: string) {
  return createNotification({
    studentId,
    title: 'Booking Ditolak',
    message: `Booking kamu untuk buku "${bookTitle}" ditolak. Alasan: ${reason || 'Tidak ada keterangan'}`,
    type: 'BOOKING_REJECTED',
    relatedId: bookingId,
  });
}

export async function notifyBorrowingReminder(studentId: string, bookTitle: string, daysLeft: number, borrowingId: string) {
  return createNotification({
    studentId,
    title: `Reminder: Pengembalian ${daysLeft} Hari Lagi`,
    message: `Jangan lupa kembalikan buku "${bookTitle}" dalam ${daysLeft} hari (${daysLeft === 1 ? 'besok' : `${daysLeft} hari lagi`}).`,
    type: 'BORROWING_REMINDER',
    relatedId: borrowingId,
  });
}

export async function notifyBorrowingOverdue(studentId: string, bookTitle: string, daysLate: number, fine: number, borrowingId: string) {
  return createNotification({
    studentId,
    title: '⚠️ Buku Terlambat Dikembalikan',
    message: `Buku "${bookTitle}" sudah terlambat ${daysLate} hari. Denda yang dikenakan: Rp ${fine.toLocaleString('id-ID')}. Segera kembalikan ke perpustakaan.`,
    type: 'BORROWING_OVERDUE',
    relatedId: borrowingId,
  });
}

export async function notifyReturnConfirmed(studentId: string, bookTitle: string, borrowingId: string) {
  return createNotification({
    studentId,
    title: 'Pengembalian Dikonfirmasi ✅',
    message: `Pengembalian buku "${bookTitle}" telah dikonfirmasi. Terima kasih!`,
    type: 'RETURN_CONFIRMED',
    relatedId: borrowingId,
  });
}

export async function notifyFineIssued(studentId: string, amount: number, borrowingId: string) {
  return createNotification({
    studentId,
    title: 'Denda Keterlambatan',
    message: `Kamu dikenakan denda keterlambatan sebesar Rp ${amount.toLocaleString('id-ID')}. Silakan bayar di perpustakaan.`,
    type: 'FINE_ISSUED',
    relatedId: borrowingId,
  });
}
