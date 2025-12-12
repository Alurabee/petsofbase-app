import { createClient, Errors } from '@farcaster/quick-auth';

const domain = process.env.VITE_APP_DOMAIN || 'localhost:3000';
const client = createClient();

export interface VerifiedUser {
  fid: number;
}

/**
 * Verify a Quick Auth JWT token and return the user's FID
 * @param token - JWT token from Quick Auth
 * @returns User's FID if valid
 * @throws InvalidTokenError if token is invalid or expired
 */
export async function verifyQuickAuthToken(token: string): Promise<VerifiedUser> {
  try {
    const payload = await client.verifyJwt({ token, domain });
    
    return {
      fid: payload.sub,
    };
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      throw new Error('Invalid or expired authentication token');
    }
    throw e;
  }
}

/**
 * Extract and verify JWT token from Authorization header
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns User's FID if valid
 * @throws Error if header is missing or token is invalid
 */
export async function verifyAuthHeader(authHeader: string | null): Promise<VerifiedUser> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.split(' ')[1];
  return verifyQuickAuthToken(token);
}
