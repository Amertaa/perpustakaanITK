import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { signToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email dan password wajib diisi', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        student: true,
        admin: true,
      },
    });

    if (!user) {
      return errorResponse('Email atau password salah', 401);
    }

    if (!user.isActive) {
      return errorResponse('Akun kamu dinonaktifkan. Hubungi admin perpustakaan.', 403);
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return errorResponse('Email atau password salah', 401);
    }

    const name = user.student?.name || user.admin?.name || 'User';
    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name,
      studentId: user.student?.id,
      adminId: user.admin?.id,
    });

    await setAuthCookie(token);

    return successResponse(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name,
          studentId: user.student?.id,
          adminId: user.admin?.id,
          nim: user.student?.nim,
        },
      },
      'Login berhasil'
    );
  } catch (error) {
    console.error('[AUTH LOGIN ERROR]', error);
    return errorResponse('Terjadi kesalahan server', 500);
  }
}
