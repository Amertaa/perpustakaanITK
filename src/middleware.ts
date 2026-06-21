import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/register', '/offline', '/_next', '/api/auth/login', '/api/auth/register', '/icons', '/manifest.json', '/sw', '/workbox'];
const ADMIN_PATHS = ['/admin'];
const MAHASISWA_PATHS = ['/dashboard', '/books', '/bookings', '/borrowings', '/history', '/profile', '/notifications'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic || pathname === '/') return NextResponse.next();

  const token = req.cookies.get('perpus_itk_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('perpus_itk_token');
    return res;
  }

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isMahasiswaPath = MAHASISWA_PATHS.some((p) => pathname.startsWith(p));

  if (isAdminPath && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  if (isMahasiswaPath && payload.role !== 'MAHASISWA') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|screenshots).*)'],
};
