import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== 'ADMIN') return errorResponse('Forbidden', 403);

    const { name, description, color } = await req.json();
    const category = await prisma.bookCategory.update({
      where: { id: params.id },
      data: { name, description, color },
    });
    return successResponse(category, 'Kategori berhasil diupdate');
  } catch {
    return errorResponse('Gagal mengupdate kategori', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== 'ADMIN') return errorResponse('Forbidden', 403);

    const booksCount = await prisma.book.count({ where: { categoryId: params.id } });
    if (booksCount > 0) return errorResponse('Kategori masih memiliki buku, tidak bisa dihapus', 400);

    await prisma.bookCategory.delete({ where: { id: params.id } });
    return successResponse(null, 'Kategori berhasil dihapus');
  } catch {
    return errorResponse('Gagal menghapus kategori', 500);
  }
}
