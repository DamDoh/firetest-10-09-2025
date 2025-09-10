import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// Define the structure of our custom JWT payload
interface KiloJwtPayload {
  env: string;
  kiloUserId: string;
  apiTokenPepper: string | null;
  version: number;
  iat: number;
  exp: number;
}

// Secret key for signing/verifying tokens
// In production, this should be stored securely in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development';

/**
 * Verifies a JWT token and returns the decoded payload
 * @param token The JWT token to verify
 * @returns The decoded payload or null if verification fails
 */
export function verifyKiloToken(token: string): KiloJwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as KiloJwtPayload;
    
    // Additional validation for our custom token structure
    if (!decoded.env || !decoded.kiloUserId || !decoded.version) {
      console.error('Invalid token structure');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Decodes a JWT token without verifying its signature
 * @param token The JWT token to decode
 * @returns The decoded payload or null if decoding fails
 */
export function decodeKiloToken(token: string): KiloJwtPayload | null {
  try {
    const decoded = jwt.decode(token) as KiloJwtPayload;
    
    // Basic validation for our custom token structure
    if (!decoded.env || !decoded.kiloUserId || !decoded.version) {
      console.error('Invalid token structure');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token decoding failed:', error);
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 * @param payload The decoded JWT payload
 * @returns True if the token is expired, false otherwise
 */
export function isTokenExpired(payload: KiloJwtPayload): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Extracts and verifies a JWT token from an HTTP request
 * @param req The Next.js request object
 * @returns The decoded payload or null if verification fails
 */
export function getKiloTokenFromRequest(req: NextRequest): KiloJwtPayload | null {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  return verifyKiloToken(token);
}

/**
 * Generates a new JWT token for a user
 * @param kiloUserId The user's ID in the Kilo system
 * @param env The environment (e.g., 'production', 'staging')
 * @param expiresIn The time until the token expires (e.g., '1h', '7d')
 * @returns The generated JWT token
 */
export function generateKiloToken(
  kiloUserId: string,
  env: string = 'production',
  expiresIn: string = '7d'
): string {
  const payload: KiloJwtPayload = {
    env,
    kiloUserId,
    apiTokenPepper: null,
    version: 3,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (expiresIn === '7d' ? 7 * 24 * 60 * 60 : 60 * 60), // Default to 7 days
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}