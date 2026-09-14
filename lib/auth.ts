import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";

export interface AuthUserPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET || "local_dev_secret_key_change_in_production_123456";
const encodedKey = new TextEncoder().encode(JWT_SECRET);
export const AUTH_COOKIE_NAME = "auth_token";

/**
 * Signe un token JWT contenant le payload utilisateur avec jose (HS256)
 */
export async function signJWT(payload: AuthUserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/**
 * Vérifie et décode un token JWT
 */
export async function verifyJWT(token: string): Promise<AuthUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as AuthUserPayload;
  } catch {
    return null;
  }
}

/**
 * Crée le cookie HTTP-only auth_token sécurisé
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });
}

/**
 * Supprime le cookie HTTP-only auth_token
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Récupère l'utilisateur connecté depuis les cookies de la requête courante
 */
export async function getCurrentUser(): Promise<AuthUserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token);
}
