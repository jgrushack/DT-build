import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function getAuthedUserId(): Promise<string | null> {
    const store = await cookies();
    const token = store.get('auth_token')?.value;
    if (!token) return null;
    try {
        const payload = await verifyToken(token);
        return payload.userId;
    } catch {
        return null;
    }
}
