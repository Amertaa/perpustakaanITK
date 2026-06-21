import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse, addDays } from '@/lib/utils';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    const borrowing = await prisma.borrowing.findUnique({ where: { id: params.id } });
    if (!borrowing) return errorResponse('Data peminjaman tidak ditemukan', 404);

    if (authUser.role === 'MAHASISWA' && borrowing.studentId !== authUser.studentId) {
      return errorResponse('Forbidden', 403);
    }
    if (borrowing.status !== 'ACTIVE') return errorResponse('Hanya peminjaman aktif yang bisa diperpanjang', 400);
    if (borrowing.extensionCount >= borrowing.maxExtensions) {
      return errorResponse(`Batas perpanjangan sudah tercapai (${borrowing.maxExtensions}x)`, 400);
    }
    if (new Date() > borrowing.dueDate) {
      return errorResponse('Buku sudah melewati batas waktu, tidak bisa diperpanjang', 400);
    }

    const extDays = parseInt(process.env.EXTENSION_DURATION_DAYS || '7');
    const newDueDate = addDays(borrowing.dueDate, extDays);

    const updated = await prisma.borrowing.update({
      where: { id: params.id },
      data: { dueDate: newDueDate, extensionCount: borrowing.extensionCount + 1 },
    });

    return successResponse(updated, `Peminjaman berhasil diperpanjang ${extDays} hari`);
  } catch {
    return errorResponse('Gagal memperpanjang peminjaman', 500);
  }
}
