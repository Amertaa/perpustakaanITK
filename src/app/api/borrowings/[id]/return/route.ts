import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse, calculateFine } from '@/lib/utils';
import { notifyReturnConfirmed, notifyFineIssued } from '@/lib/notifications';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== 'ADMIN') return errorResponse('Forbidden', 403);

    const borrowing = await prisma.borrowing.findUnique({
      where: { id: params.id },
      include: { bookCopy: { include: { book: true } } },
    });
    if (!borrowing) return errorResponse('Data peminjaman tidak ditemukan', 404);
    if (borrowing.status === 'RETURNED') return errorResponse('Buku sudah dikembalikan', 400);

    const { condition, notes } = await req.json().catch(() => ({ condition: 'Baik', notes: '' }));
    const now = new Date();
    const daysLate = borrowing.dueDate < now
      ? Math.floor((now.getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const fineAmount = calculateFine(daysLate);

    const ops: Parameters<typeof prisma.$transaction>[0] = [
      prisma.borrowing.update({
        where: { id: params.id },
        data: { status: 'RETURNED', returnDate: now },
      }),
      prisma.return.create({
        data: { borrowingId: params.id, returnDate: now, condition: condition || 'Baik', notes: notes || null },
      }),
      prisma.bookCopy.update({
        where: { id: borrowing.bookCopyId },
        data: { status: 'AVAILABLE', condition: condition || 'Baik' },
      }),
    ];

    if (daysLate > 0) {
      ops.push(
        prisma.fine.create({
          data: {
            borrowingId: params.id,
            amount: fineAmount,
            daysLate,
            reason: `Terlambat ${daysLate} hari`,
          },
        })
      );
    }

    await prisma.$transaction(ops);

    await notifyReturnConfirmed(borrowing.studentId, borrowing.bookCopy.book.title, params.id);
    if (daysLate > 0) {
      await notifyFineIssued(borrowing.studentId, fineAmount, params.id);
    }

    return successResponse({ daysLate, fineAmount }, 'Pengembalian berhasil dicatat');
  } catch (error) {
    console.error('[RETURN]', error);
    return errorResponse('Gagal mencatat pengembalian', 500);
  }
}
