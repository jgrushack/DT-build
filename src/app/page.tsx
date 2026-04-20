import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import FeverDream from '@/components/landing/FeverDream';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  let tokenValid = false;
  if (token) {
    try {
      await jwtVerify(token, getSecret());
      tokenValid = true;
    } catch {
      // Invalid/expired — render fever dream
    }
  }

  if (tokenValid) redirect('/dreampeace');
  return <FeverDream />;
}
