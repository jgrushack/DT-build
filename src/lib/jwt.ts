import { SignJWT, jwtVerify } from 'jose';

export interface JWTPayload {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  isSubscribed: boolean;
  tiers: string[];
  authProvider?: 'patreon' | 'audius';
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as unknown as JWTPayload;
}
