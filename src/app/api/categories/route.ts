import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET() {
  try {
    const categories = await prisma.bookCategory.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { books: true } } },
    });
    return successResponse(categories);
  } catch {
    return errorResponse('Gagal mengambil kategori', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== 'ADMIN') return errorResponse('Forbidden', 403);

    const { name, description, color } = await req.json();
    if (!name) return errorResponse('Nama kategori wajib diisi', 400);

    const category = await prisma.bookCategory.create({
      data: { name, description: description || null, color: color || '#3b82f6' },
    });
    return successResponse(category, 'Kategori berhasil ditambahkan', 201);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') return errorResponse('Nama kategori sudah ada', 409);
    return errorResponse('Gagal menambahkan kategori', 500);
  }
}
