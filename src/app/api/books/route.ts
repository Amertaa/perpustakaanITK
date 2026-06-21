import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const year = searchParams.get('year') || '';
    const available = searchParams.get('available') === 'true';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { isbn: { contains: search } },
        { publisher: { contains: search } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (year) where.year = parseInt(year);

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          copies: {
            select: { id: true, status: true, copyNumber: true },
          },
          _count: { select: { copies: true } },
        },
      }),
      prisma.book.count({ where }),
    ]);

    const booksWithAvailability = books.map((book) => {
      const availableCopies = book.copies.filter((c) => c.status === 'AVAILABLE').length;
      return { ...book, availableCopies };
    });

    const filtered = available
      ? booksWithAvailability.filter((b) => b.availableCopies > 0)
      : booksWithAvailability;

    return paginatedResponse(filtered, total, page, limit);
  } catch (error) {
    console.error('[BOOKS GET]', error);
    return errorResponse('Gagal mengambil data buku', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== 'ADMIN') return errorResponse('Forbidden', 403);

    const body = await req.json();
    const { isbn, title, author, publisher, year, categoryId, description, coverUrl, pages, language, location, totalCopies } = body;

    if (!title || !author || !categoryId) {
      return errorResponse('Judul, penulis, dan kategori wajib diisi', 400);
    }

    const copies = Array.from({ length: totalCopies || 1 }, (_, i) => ({
      copyNumber: (i + 1).toString().padStart(3, '0'),
      status: 'AVAILABLE' as const,
      condition: 'Baik',
    }));

    const book = await prisma.book.create({
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
        totalCopies: totalCopies || 1,
        copies: { create: copies },
      },
      include: { category: true, copies: true },
    });

    return successResponse(book, 'Buku berhasil ditambahkan', 201);
  } catch (error) {
    console.error('[BOOKS POST]', error);
    return errorResponse('Gagal menambahkan buku', 500);
  }
}
