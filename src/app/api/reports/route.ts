import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== 'ADMIN') return errorResponse('Forbidden', 403);

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'summary';
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date();

    if (type === 'borrowings') {
      const borrowings = await prisma.borrowing.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: {
          student: { select: { nim: true, name: true, faculty: true, major: true } },
          bookCopy: { include: { book: { include: { category: true } } } },
          fines: true,
          returnRecord: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return successResponse(borrowings);
    }

    if (type === 'overdue') {
      const now = new Date();
      const overdue = await prisma.borrowing.findMany({
        where: { status: 'ACTIVE', dueDate: { lt: now } },
        include: {
          student: { select: { nim: true, name: true, phone: true } },
          bookCopy: { include: { book: true } },
          fines: true,
        },
        orderBy: { dueDate: 'asc' },
      });
      return successResponse(overdue);
    }

    if (type === 'popular') {
      const popular = await prisma.book.findMany({
        include: {
          _count: { select: { copies: true } },
          copies: {
            include: {
              _count: { select: { borrowings: true } },
            },
          },
          category: true,
        },
        orderBy: { copies: { _count: 'desc' } },
        take: 20,
      });
      return successResponse(popular);
    }

    // summary
    const [totalBorrowings, totalReturned, totalOverdue, totalFines, byCategory] = await Promise.all([
      prisma.borrowing.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
      prisma.borrowing.count({ where: { status: 'RETURNED', createdAt: { gte: startDate, lte: endDate } } }),
      prisma.borrowing.count({ where: { status: 'ACTIVE', dueDate: { lt: new Date() } } }),
      prisma.fine.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startDate, lte: endDate } } }),
      prisma.bookCategory.findMany({
        include: {
          books: {
            include: {
              copies: {
                include: { _count: { select: { borrowings: true } } },
              },
            },
          },
        },
      }),
    ]);

    return successResponse({
      totalBorrowings, totalReturned, totalOverdue,
      totalFines: totalFines._sum.amount || 0,
      byCategory: byCategory.map((cat) => ({
        name: cat.name,
        color: cat.color,
        totalBooks: cat.books.length,
        totalBorrowings: cat.books.reduce(
          (sum, b) => sum + b.copies.reduce((s, c) => s + c._count.borrowings, 0), 0
        ),
      })),
    });
  } catch (error) {
    console.error('[REPORTS]', error);
    return errorResponse('Gagal mengambil laporan', 500);
  }
}
