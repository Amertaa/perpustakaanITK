// ============================================================
// TYPE DEFINITIONS - Perpustakaan ITK
// ============================================================

export type UserRole = 'MAHASISWA' | 'ADMIN';

export type CopyStatus = 'AVAILABLE' | 'BOOKED' | 'BORROWED' | 'DAMAGED' | 'LOST';

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export type BorrowingStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST';

export type FineStatus = 'UNPAID' | 'PAID' | 'WAIVED';

export type NotificationType =
  | 'BOOKING_APPROVED'
  | 'BOOKING_REJECTED'
  | 'BORROWING_REMINDER'
  | 'BORROWING_OVERDUE'
  | 'EXTENSION_APPROVED'
  | 'EXTENSION_REJECTED'
  | 'RETURN_CONFIRMED'
  | 'FINE_ISSUED'
  | 'GENERAL';

// ============================================================
// AUTH
// ============================================================

export interface JWTPayload {
  sub: string;       // userId
  email: string;
  role: UserRole;
  studentId?: string;
  adminId?: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  studentId?: string;
  adminId?: string;
}

// ============================================================
// USER & STUDENT
// ============================================================

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  userId: string;
  nim: string;
  name: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
  faculty?: string | null;
  major?: string | null;
  year?: number | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  userId: string;
  name: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// BOOKS
// ============================================================

export interface BookCategory {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { books: number };
}

export interface Book {
  id: string;
  isbn?: string | null;
  title: string;
  author: string;
  publisher?: string | null;
  year?: number | null;
  categoryId: string;
  description?: string | null;
  coverUrl?: string | null;
  pages?: number | null;
  language?: string | null;
  location?: string | null;
  totalCopies: number;
  createdAt: string;
  updatedAt: string;
  category?: BookCategory;
  copies?: BookCopy[];
  availableCopies?: number;
}

export interface BookCopy {
  id: string;
  bookId: string;
  copyNumber: string;
  status: CopyStatus;
  condition?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  book?: Book;
}

// ============================================================
// BOOKING
// ============================================================

export interface Booking {
  id: string;
  studentId: string;
  bookCopyId: string;
  status: BookingStatus;
  bookingDate: string;
  expiryDate: string;
  notes?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  bookCopy?: BookCopy & { book?: Book };
  borrowing?: Borrowing | null;
}

// ============================================================
// BORROWING
// ============================================================

export interface Borrowing {
  id: string;
  studentId: string;
  bookCopyId: string;
  bookingId?: string | null;
  status: BorrowingStatus;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  extensionCount: number;
  maxExtensions: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  bookCopy?: BookCopy & { book?: Book };
  booking?: Booking | null;
  fines?: Fine[];
  returnRecord?: Return | null;
  daysLate?: number;
}

// ============================================================
// RETURN & FINE
// ============================================================

export interface Return {
  id: string;
  borrowingId: string;
  returnDate: string;
  condition?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface Fine {
  id: string;
  borrowingId: string;
  amount: number;
  daysLate: number;
  reason: string;
  status: FineStatus;
  paidDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  borrowing?: Borrowing;
}

// ============================================================
// NOTIFICATION
// ============================================================

export interface Notification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedId?: string | null;
  createdAt: string;
}

// ============================================================
// API RESPONSE
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export interface MahasiswaDashboardStats {
  activeBookings: number;
  activeBorrowings: number;
  totalHistory: number;
  unreadNotifications: number;
  overdueBooks: number;
  unpaidFines: number;
}

export interface AdminDashboardStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  totalStudents: number;
  pendingBookings: number;
  activeBorrowings: number;
  overdueBooks: number;
  totalFines: number;
  returnedToday: number;
}

// ============================================================
// FORM TYPES
// ============================================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  nim: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  faculty?: string;
  major?: string;
}

export interface BookForm {
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  year?: number;
  categoryId: string;
  description?: string;
  coverUrl?: string;
  pages?: number;
  language?: string;
  location?: string;
  totalCopies: number;
}

export interface BookingForm {
  bookCopyId: string;
  notes?: string;
}

export interface ExtendBorrowingForm {
  borrowingId: string;
  reason?: string;
}
