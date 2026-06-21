import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== 'MAHASISWA') return errorResponse('Forbidden', 403);

    const { name, phone, address, faculty, major } = await req.json();

    const updated = await prisma.student.update({
      where: { id: authUser.studentId! },
      data: { name, phone, address, faculty, major },
    });

    return successResponse(updated, 'Profil berhasil diupdate');
  } catch {
    return errorResponse('Gagal mengupdate profil', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) return errorResponse('Password lama dan baru wajib diisi', 400);
    if (newPassword.length < 6) return errorResponse('Password baru minimal 6 karakter', 400);

    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) return errorResponse('User tidak ditemukan', 404);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return errorResponse('Password lama salah', 401);

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: authUser.id }, data: { password: hashed } });

    return successResponse(null, 'Password berhasil diubah');
  } catch {
    return errorResponse('Gagal mengubah password', 500);
  }
}
