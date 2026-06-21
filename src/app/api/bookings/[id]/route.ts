import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        bookCopy: { include: { book: { include: { category: true } } } },
        borrowing: true,
      },
    });
    if (!booking) return errorResponse('Booking tidak ditemukan', 404);

    if (authUser.role === 'MAHASISWA' && booking.studentId !== authUser.studentId) {
      return errorResponse('Forbidden', 403);
    }

    return successResponse(booking);
  } catch {
    return errorResponse('Gagal mengambil detail booking', 500);
  }
}
