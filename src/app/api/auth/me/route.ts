import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { student: true, admin: true },
    });

    if (!user) return errorResponse('User tidak ditemukan', 404);

    return successResponse({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.student?.name || user.admin?.name,
      student: user.student,
      admin: user.admin,
    });
  } catch {
    return errorResponse('Terjadi kesalahan server', 500);
  }
}
