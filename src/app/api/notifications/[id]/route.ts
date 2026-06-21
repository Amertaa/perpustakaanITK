import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    if (params.id === 'read-all') {
      await prisma.notification.updateMany({
        where: { studentId: authUser.studentId!, isRead: false },
        data: { isRead: true },
      });
      return successResponse(null, 'Semua notifikasi ditandai sudah dibaca');
    }

    const notification = await prisma.notification.findUnique({ where: { id: params.id } });
    if (!notification) return errorResponse('Notifikasi tidak ditemukan', 404);
    if (notification.studentId !== authUser.studentId) return errorResponse('Forbidden', 403);

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true },
    });
    return successResponse(updated, 'Notifikasi ditandai sudah dibaca');
  } catch {
    return errorResponse('Gagal mengupdate notifikasi', 500);
  }
}
