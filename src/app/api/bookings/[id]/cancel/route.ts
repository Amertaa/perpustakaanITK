import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    const booking = await prisma.booking.findUnique({ where: { id: params.id } });
    if (!booking) return errorResponse('Booking tidak ditemukan', 404);

    if (authUser.role === 'MAHASISWA' && booking.studentId !== authUser.studentId) {
      return errorResponse('Forbidden', 403);
    }
    if (!['PENDING', 'APPROVED'].includes(booking.status)) {
      return errorResponse('Booking tidak bisa dibatalkan', 400);
    }

    const [updated] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
      }),
      prisma.bookCopy.update({
        where: { id: booking.bookCopyId },
        data: { status: 'AVAILABLE' },
      }),
    ]);

    return successResponse(updated, 'Booking berhasil dibatalkan');
  } catch {
    return errorResponse('Gagal membatalkan booking', 500);
  }
}
