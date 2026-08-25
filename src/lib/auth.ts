import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User, UserRole } from '@/types';
import { readDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'japan_preorder_super_secret_key_2026';
const AUTH_COOKIE_NAME = 'jp_shop_auth_token';

export interface TokenPayload {
  userId: string;
  username: string;
  role: UserRole;
  fullName: string;
}

export function signToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const db = readDb();
  const user = db.users.find((u) => u.id === payload.userId);
  return user || null;
}

export { AUTH_COOKIE_NAME };
