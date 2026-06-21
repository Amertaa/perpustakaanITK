import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    const borrowing = await prisma.borrowing.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        bookCopy: { include: { book: { include: { category: true } } } },
        fines: true,
        returnRecord: true,
        booking: true,
      },
    });
    if (!borrowing) return errorResponse('Data peminjaman tidak ditemukan', 404);

    if (authUser.role === 'MAHASISWA' && borrowing.studentId !== authUser.studentId) {
      return errorResponse('Forbidden', 403);
    }

    const now = new Date();
    const daysLate = borrowing.status === 'ACTIVE' && borrowing.dueDate < now
      ? Math.floor((now.getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return successResponse({ ...borrowing, daysLate });
  } catch {
    return errorResponse('Gagal mengambil detail peminjaman', 500);
  }
}
