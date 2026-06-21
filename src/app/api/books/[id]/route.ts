import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        copies: { orderBy: { copyNumber: 'asc' } },
      },
    });
    if (!book) return errorResponse('Buku tidak ditemukan', 404);

    const availableCopies = book.copies.filter((c) => c.status === 'AVAILABLE').length;
    return successResponse({ ...book, availableCopies });
  } catch {
    return errorResponse('Gagal mengambil detail buku', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== 'ADMIN') return errorResponse('Forbidden', 403);

    const body = await req.json();
    const { isbn, title, author, publisher, year, categoryId, description, coverUrl, pages, language, location } = body;

    const book = await prisma.book.update({
      where: { id: params.id },
      data: {
        isbn: isbn || null,
        title,
        author,
        publisher: publisher || null,
        year: year ? parseInt(year) : null,
        categoryId,
        description: description || null,
        coverUrl: coverUrl || null,
        pages: pages ? parseInt(pages) : null,
        language: language || 'Indonesia',
        location: location || null,
      },
      include: { category: true },
    });

    return successResponse(book, 'Buku berhasil diupdate');
  } catch {
    return errorResponse('Gagal mengupdate buku', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== 'ADMIN') return errorResponse('Forbidden', 403);

    const activeBorrowings = await prisma.borrowing.count({
      where: { bookCopy: { bookId: params.id }, status: 'ACTIVE' },
    });
    if (activeBorrowings > 0) {
      return errorResponse('Tidak bisa menghapus buku yang sedang dipinjam', 400);
    }

    await prisma.book.delete({ where: { id: params.id } });
    return successResponse(null, 'Buku berhasil dihapus');
  } catch {
    return errorResponse('Gagal menghapus buku', 500);
  }
}
