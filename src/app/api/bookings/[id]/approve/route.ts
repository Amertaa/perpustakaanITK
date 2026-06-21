import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';
import { notifyBookingApproved } from '@/lib/notifications';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== 'ADMIN') return errorResponse('Forbidden', 403);

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { bookCopy: { include: { book: true } }, student: true },
    });
    if (!booking) return errorResponse('Booking tidak ditemukan', 404);
    if (booking.status !== 'PENDING') return errorResponse('Booking sudah diproses sebelumnya', 400);

    const { adminNotes } = await req.json().catch(() => ({ adminNotes: '' }));

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'APPROVED', adminNotes: adminNotes || null },
    });

    await notifyBookingApproved(
      booking.studentId,
      booking.bookCopy.book.title,
      booking.id
    );

    return successResponse(updated, 'Booking berhasil disetujui');
  } catch (error) {
    console.error('[BOOKING APPROVE]', error);
    return errorResponse('Gagal menyetujui booking', 500);
  }
}
