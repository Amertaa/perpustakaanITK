import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';
import { notifyBookingRejected } from '@/lib/notifications';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== 'ADMIN') return errorResponse('Forbidden', 403);

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { bookCopy: { include: { book: true } } },
    });
    if (!booking) return errorResponse('Booking tidak ditemukan', 404);
    if (booking.status !== 'PENDING') return errorResponse('Booking sudah diproses', 400);

    const { adminNotes } = await req.json().catch(() => ({ adminNotes: '' }));

    const [updated] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: params.id },
        data: { status: 'REJECTED', adminNotes: adminNotes || null },
      }),
      prisma.bookCopy.update({
        where: { id: booking.bookCopyId },
        data: { status: 'AVAILABLE' },
      }),
    ]);

    await notifyBookingRejected(
      booking.studentId,
      booking.bookCopy.book.title,
      adminNotes || 'Tidak ada keterangan',
      booking.id
    );

    return successResponse(updated, 'Booking berhasil ditolak');
  } catch {
    return errorResponse('Gagal menolak booking', 500);
  }
}
