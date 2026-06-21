import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nim, name, email, password, confirmPassword, phone, faculty, major, year } = body;

    if (!nim || !name || !email || !password) {
      return errorResponse('NIM, nama, email, dan password wajib diisi', 400);
    }

    if (password !== confirmPassword) {
      return errorResponse('Konfirmasi password tidak cocok', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password minimal 6 karakter', 400);
    }

    const normalizedEmail = email.toLowerCase();

    const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingEmail) {
      return errorResponse('Email sudah terdaftar', 409);
    }

    const existingNIM = await prisma.student.findUnique({ where: { nim } });
    if (existingNIM) {
      return errorResponse('NIM sudah terdaftar', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: 'MAHASISWA',
        student: {
          create: {
            nim,
            name,
            phone: phone || null,
            faculty: faculty || null,
            major: major || null,
            year: year ? parseInt(year) : null,
          },
        },
      },
      include: { student: true },
    });

    return successResponse(
      {
        id: user.id,
        email: user.email,
        nim: user.student?.nim,
        name: user.student?.name,
      },
      'Registrasi berhasil! Silakan login.',
      201
    );
  } catch (error) {
    console.error('[AUTH REGISTER ERROR]', error);
    return errorResponse('Terjadi kesalahan server', 500);
  }
}
