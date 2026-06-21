import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import type { JWTPayload, AuthUser } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

const COOKIE_NAME = 'perpus_itk_token';
const TOKEN_EXPIRY = '7d';

// ============================================================
// TOKEN OPERATIONS
// ============================================================

export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ============================================================
// COOKIE OPERATIONS
// ============================================================

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

// ============================================================
// AUTH USER
// ============================================================

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getTokenFromCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    name: payload.name,
    studentId: payload.studentId,
    adminId: payload.adminId,
  };
}

export async function getAuthUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    name: payload.name,
    studentId: payload.studentId,
    adminId: payload.adminId,
  };
}

// ============================================================
// ROLE GUARDS
// ============================================================

export function requireAuth(user: AuthUser | null) {
  if (!user) throw new Error('Unauthorized: Silakan login terlebih dahulu');
  return user;
}

export function requireAdmin(user: AuthUser | null) {
  const authed = requireAuth(user);
  if (authed.role !== 'ADMIN') throw new Error('Forbidden: Akses hanya untuk Admin');
  return authed;
}

export function requireMahasiswa(user: AuthUser | null) {
  const authed = requireAuth(user);
  if (authed.role !== 'MAHASISWA') throw new Error('Forbidden: Akses hanya untuk Mahasiswa');
  return authed;
}
