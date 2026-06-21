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

    if (authUser.role === 'MAHASISWA') {
      where.studentId = authUser.studentId;
    }
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { id: true, nim: true, name: true, faculty: true } },
          bookCopy: {
            include: { book: { include: { category: true } } },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return paginatedResponse(bookings, total, page, limit);
  } catch (error) {
    console.error('[BOOKINGS GET]', error);
    return errorResponse('Gagal mengambil data booking', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== 'MAHASISWA') return errorResponse('Forbidden', 403);

    const { bookCopyId, notes } = await req.json();
    if (!bookCopyId) return errorResponse('ID eksemplar buku wajib diisi', 400);

    const maxBorrow = parseInt(process.env.MAX_BORROW_BOOKS || '3');
    const activeCount = await prisma.booking.count({
      where: {
        studentId: authUser.studentId!,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });
    if (activeCount >= maxBorrow) {
      return errorResponse(`Kamu sudah memiliki ${activeCount} booking aktif. Maksimal ${maxBorrow} booking.`, 400);
    }

    const copy = await prisma.bookCopy.findUnique({ where: { id: bookCopyId } });
    if (!copy) return errorResponse('Eksemplar buku tidak ditemukan', 404);
    if (copy.status !== 'AVAILABLE') return errorResponse('Eksemplar buku tidak tersedia', 400);

    const existingBooking = await prisma.booking.findFirst({
      where: {
        studentId: authUser.studentId!,
        bookCopyId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });
    if (existingBooking) return errorResponse('Kamu sudah memiliki booking untuk eksemplar ini', 400);

    const expiryHours = parseInt(process.env.BOOKING_EXPIRY_HOURS || '48');
    const expiryDate = addDays(new Date(), Math.ceil(expiryHours / 24));

    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          studentId: authUser.studentId!,
          bookCopyId,
          expiryDate,
          notes: notes || null,
        },
        include: {
          bookCopy: { include: { book: { include: { category: true } } } },
        },
      }),
      prisma.bookCopy.update({
        where: { id: bookCopyId },
        data: { status: 'BOOKED' },
      }),
    ]);

    return successResponse(booking, 'Booking berhasil dibuat! Menunggu persetujuan admin.', 201);
  } catch (error) {
    console.error('[BOOKINGS POST]', error);
    return errorResponse('Gagal membuat booking', 500);
  }
}
