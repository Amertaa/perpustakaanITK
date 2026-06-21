import { type ClassValue, clsx } from 'clsx';
import { format, formatDistance, differenceInDays, isAfter, isBefore } from 'date-fns';
import { id } from 'date-fns/locale';
import type { BookingStatus, BorrowingStatus, CopyStatus, FineStatus } from '@/types';

// ============================================================
// CLASSNAMES
// ============================================================

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ============================================================
// DATE & TIME
// ============================================================

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return format(new Date(date), 'dd MMMM yyyy', { locale: id });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: id });
}

export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return formatDistance(new Date(date), new Date(), { locale: id, addSuffix: true });
}

export function getDaysLate(dueDate: string | Date): number {
  const due = new Date(dueDate);
  const now = new Date();
  if (isAfter(now, due)) {
    return differenceInDays(now, due);
  }
  return 0;
}

export function getDaysRemaining(dueDate: string | Date): number {
  const due = new Date(dueDate);
  const now = new Date();
  if (isBefore(now, due)) {
    return differenceInDays(due, now);
  }
  return 0;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isOverdue(dueDate: string | Date): boolean {
  return isAfter(new Date(), new Date(dueDate));
}

export function isExpiringSoon(dueDate: string | Date, daysThreshold = 3): boolean {
  const remaining = getDaysRemaining(dueDate);
  return remaining >= 0 && remaining <= daysThreshold;
}

// ============================================================
// STATUS LABELS & COLORS
// ============================================================

export const BookingStatusLabel: Record<BookingStatus, string> = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  CANCELLED: 'Dibatalkan',
  COMPLETED: 'Selesai',
};

export const BookingStatusColor: Record<BookingStatus, string> = {
  PENDING: 'yellow',
  APPROVED: 'green',
  REJECTED: 'red',
  CANCELLED: 'gray',
  COMPLETED: 'blue',
};

export const BorrowingStatusLabel: Record<BorrowingStatus, string> = {
  ACTIVE: 'Dipinjam',
  RETURNED: 'Dikembalikan',
  OVERDUE: 'Terlambat',
  LOST: 'Hilang',
};

export const BorrowingStatusColor: Record<BorrowingStatus, string> = {
  ACTIVE: 'blue',
  RETURNED: 'green',
  OVERDUE: 'red',
  LOST: 'gray',
};

export const CopyStatusLabel: Record<CopyStatus, string> = {
  AVAILABLE: 'Tersedia',
  BOOKED: 'Dipesan',
  BORROWED: 'Dipinjam',
  DAMAGED: 'Rusak',
  LOST: 'Hilang',
};

export const CopyStatusColor: Record<CopyStatus, string> = {
  AVAILABLE: 'green',
  BOOKED: 'yellow',
  BORROWED: 'blue',
  DAMAGED: 'orange',
  LOST: 'red',
};

export const FineStatusLabel: Record<FineStatus, string> = {
  UNPAID: 'Belum Bayar',
  PAID: 'Sudah Bayar',
  WAIVED: 'Dibebaskan',
};

export const FineStatusColor: Record<FineStatus, string> = {
  UNPAID: 'red',
  PAID: 'green',
  WAIVED: 'blue',
};

// ============================================================
// CURRENCY
// ============================================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function calculateFine(daysLate: number): number {
  const finePerDay = parseInt(process.env.FINE_PER_DAY || '1000');
  return daysLate * finePerDay;
}

// ============================================================
// API HELPERS
// ============================================================

export function successResponse<T>(data: T, message = 'Berhasil', status = 200) {
  return Response.json({ success: true, message, data }, { status });
}

export function errorResponse(message: string, status = 400, error?: string) {
  return Response.json({ success: false, message, error }, { status });
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Berhasil'
) {
  return Response.json({
    success: true,
    message,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// ============================================================
// STRING HELPERS
// ============================================================

export function truncate(str: string, length = 80): string {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function generateCopyNumber(count: number): string {
  return count.toString().padStart(3, '0');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// ============================================================
// VALIDATION
// ============================================================

export function isValidNIM(nim: string): boolean {
  return /^\d{8,12}$/.test(nim);
}

export function isValidISBN(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, '');
  return cleaned.length === 10 || cleaned.length === 13;
}

// ============================================================
// PAGINATION
// ============================================================

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
