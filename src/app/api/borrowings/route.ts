import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams, addDays } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (authUser.role === 'MAHASISWA') where.studentId = authUser.studentId;
    if (status) where.status = status;

    const [borrowings, total] = await Promise.all([
      prisma.borrowing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { id: true, nim: true, name: true, faculty: true } },
          bookCopy: { include: { book: { include: { category: true } } } },
          fines: true,
          returnRecord: true,
        },
      }),
      prisma.borrowing.count({ where }),
    ]);

    const now = new Date();
    const enriched = borrowings.map((b) => {
      const daysLate = b.status === 'ACTIVE' && b.dueDate < now
        ? Math.floor((now.getTime() - b.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      return { ...b, daysLate };
    });

    return paginatedResponse(enriched, total, page, limit);
  } catch {
    return errorResponse('Gagal mengambil data peminjaman', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== 'ADMIN') return errorResponse('Forbidden', 403);

    const { studentId, bookCopyId, bookingId, notes } = await req.json();
    if (!studentId || !bookCopyId) return errorResponse('studentId dan bookCopyId wajib diisi', 400);

    const copy = await prisma.bookCopy.findUnique({ where: { id: bookCopyId } });
    if (!copy) return errorResponse('Eksemplar buku tidak ditemukan', 404);
    if (copy.status !== 'AVAILABLE' && copy.status !== 'BOOKED') {
      return errorResponse('Eksemplar buku tidak bisa dipinjam (status: ' + copy.status + ')', 400);
    }

    const borrowDays = parseInt(process.env.BORROW_DURATION_DAYS || '14');
    const dueDate = addDays(new Date(), borrowDays);

    const [borrowing] = await prisma.$transaction([
      prisma.borrowing.create({
        data: {
          studentId,
          bookCopyId,
          bookingId: bookingId || null,
          dueDate,
          notes: notes || null,
        },
        include: {
          student: { select: { id: true, nim: true, name: true } },
          bookCopy: { include: { book: true } },
        },
      }),
      prisma.bookCopy.update({ where: { id: bookCopyId }, data: { status: 'BORROWED' } }),
      ...(bookingId ? [prisma.booking.update({ where: { id: bookingId }, data: { status: 'COMPLETED' } })] : []),
    ]);

    return successResponse(borrowing, 'Peminjaman berhasil dicatat', 201);
  } catch (error) {
    console.error('[BORROWINGS POST]', error);
    return errorResponse('Gagal mencatat peminjaman', 500);
  }
}
