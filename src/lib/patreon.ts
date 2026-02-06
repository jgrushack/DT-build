const PATREON_API_BASE = 'https://www.patreon.com/api/oauth2/v2';
const PATREON_AUTH_URL = 'https://www.patreon.com/oauth2/authorize';
const PATREON_TOKEN_URL = 'https://www.patreon.com/api/oauth2/token';

interface PatreonTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface PatreonIdentityResponse {
  data: {
    id: string;
    attributes: {
      email: string;
      full_name: string;
      image_url: string;
    };
  };
  included?: Array<{
    type: string;
    id: string;
    attributes: {
      campaign_lifetime_support_cents: number;
      currently_entitled_amount_cents: number;
      patron_status: string;
    };
    relationships?: {
      currently_entitled_tiers?: {
        data: Array<{ id: string; type: string }>;
      };
    };
  }>;
}

export interface PatreonUser {
  id: string;
  email: string;
  fullName: string;
  imageUrl: string;
  isPatron: boolean;
  currentlyEntitledTiers: string[];
}

export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.PATREON_CLIENT_ID || '',
    redirect_uri: process.env.PATREON_REDIRECT_URI || '',
    scope: 'identity identity[email] identity.memberships',
  });

  return `${PATREON_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<PatreonTokenResponse> {
  const response = await fetch(PATREON_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: process.env.PATREON_CLIENT_ID || '',
      client_secret: process.env.PATREON_CLIENT_SECRET || '',
      redirect_uri: process.env.PATREON_REDIRECT_URI || '',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  return response.json();
}

export async function getPatreonUser(accessToken: string): Promise<PatreonUser> {
  const params = new URLSearchParams({
    'fields[user]': 'email,full_name,image_url',
    'fields[member]': 'patron_status,currently_entitled_amount_cents',
    include: 'memberships,memberships.currently_entitled_tiers',
  });

  const response = await fetch(`${PATREON_API_BASE}/identity?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get user: ${error}`);
  }

  const data: PatreonIdentityResponse = await response.json();

  const memberships = data.included?.filter(item => item.type === 'member') || [];
  const isPatron = memberships.some(
    membership => membership.attributes.patron_status === 'active_patron'
  );

  const entitledTiers = memberships.flatMap(
    membership => membership.relationships?.currently_entitled_tiers?.data?.map(t => t.id) || []
  );

  return {
    id: data.data.id,
    email: data.data.attributes.email,
    fullName: data.data.attributes.full_name,
    imageUrl: data.data.attributes.image_url,
    isPatron,
    currentlyEntitledTiers: entitledTiers,
  };
}

export async function verifyDevinTownsendSubscription(
  accessToken: string
): Promise<{ isSubscribed: boolean; user: PatreonUser | null }> {
  try {
    const user = await getPatreonUser(accessToken);
    return { isSubscribed: user.isPatron, user };
  } catch {
    return { isSubscribed: false, user: null };
  }
}
