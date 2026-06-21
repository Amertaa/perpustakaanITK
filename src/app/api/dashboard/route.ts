import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    if (authUser.role === 'MAHASISWA') {
      const now = new Date();
      const [activeBookings, activeBorrowings, totalHistory, unreadNotifications, fines] = await Promise.all([
        prisma.booking.count({
          where: { studentId: authUser.studentId!, status: { in: ['PENDING', 'APPROVED'] } },
        }),
        prisma.borrowing.count({
          where: { studentId: authUser.studentId!, status: 'ACTIVE' },
        }),
        prisma.borrowing.count({
          where: { studentId: authUser.studentId!, status: 'RETURNED' },
        }),
        prisma.notification.count({
          where: { studentId: authUser.studentId!, isRead: false },
        }),
        prisma.fine.findMany({
          where: { borrowing: { studentId: authUser.studentId! }, status: 'UNPAID' },
        }),
      ]);

      const overdueBooks = await prisma.borrowing.count({
        where: { studentId: authUser.studentId!, status: 'ACTIVE', dueDate: { lt: now } },
      });

      const recentBorrowings = await prisma.borrowing.findMany({
        where: { studentId: authUser.studentId! },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { bookCopy: { include: { book: { include: { category: true } } } } },
      });

      return successResponse({
        stats: {
          activeBookings,
          activeBorrowings,
          totalHistory,
          unreadNotifications,
          overdueBooks,
          unpaidFines: fines.reduce((sum, f) => sum + f.amount, 0),
        },
        recentBorrowings,
      });
    }

    // ADMIN dashboard
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalBooks, totalCopies, availableCopies,
      totalStudents, pendingBookings, activeBorrowings,
      overdueBooks, returnedToday, fines,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.bookCopy.count(),
      prisma.bookCopy.count({ where: { status: 'AVAILABLE' } }),
      prisma.student.count({ where: { isActive: true } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.borrowing.count({ where: { status: 'ACTIVE' } }),
      prisma.borrowing.count({ where: { status: 'ACTIVE', dueDate: { lt: now } } }),
      prisma.return.count({ where: { returnDate: { gte: todayStart } } }),
      prisma.fine.aggregate({ where: { status: 'UNPAID' }, _sum: { amount: true } }),
    ]);

    const recentBookings = await prisma.booking.findMany({
      where: { status: 'PENDING' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { nim: true, name: true } },
        bookCopy: { include: { book: true } },
      },
    });

    return successResponse({
      stats: {
        totalBooks, totalCopies, availableCopies,
        totalStudents, pendingBookings, activeBorrowings,
        overdueBooks, returnedToday,
        totalFines: fines._sum.amount || 0,
      },
      recentBookings,
    });
  } catch (error) {
    console.error('[DASHBOARD]', error);
    return errorResponse('Gagal mengambil data dashboard', 500);
  }
}
