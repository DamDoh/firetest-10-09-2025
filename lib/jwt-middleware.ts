import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';
import { verifyKiloToken, isTokenExpired } from './jwt-utils';

/**
 * Middleware function to verify JWT tokens in API routes
 * @param req The Next.js request object
 * @param event The Next.js fetch event
 * @returns NextResponse object or null if the request should continue
 */
export function jwtMiddleware(req: NextRequest, event: NextFetchEvent): NextResponse | null {
  // Skip middleware for OPTIONS requests (preflight requests)
  if (req.method === 'OPTIONS') {
    return null;
  }
  
  // Extract the token from the Authorization header
  const authHeader = req.headers.get('authorization');
  
  // If there's no authorization header, return 401
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Bearer token not found.' },
      { status: 401 }
    );
  }
  
  // Extract the token from the header
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // Verify the token
  const decodedToken = verifyKiloToken(token);
  
  // If token verification fails, return 401
  if (!decodedToken) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid token.' },
      { status: 401 }
    );
  }
  
  // Check if the token is expired
  if (isTokenExpired(decodedToken)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Token expired.' },
      { status: 401 }
    );
  }
  
  // Add the decoded token to the request headers for use in API routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-kilo-user-id', decodedToken.kiloUserId);
  requestHeaders.set('x-kilo-env', decodedToken.env);
  
  // Continue with the request
  return null;
}

/**
 * Higher-order function to wrap API route handlers with JWT authentication
 * @param handler The API route handler function
 * @returns A wrapped handler function that includes JWT authentication
 */
export function withKiloAuth(
  handler: (req: NextRequest, event: NextFetchEvent) => Promise<NextResponse>
) {
  return async (req: NextRequest, event: NextFetchEvent) => {
    // Run the JWT middleware
    const middlewareResponse = jwtMiddleware(req, event);
    
    // If middleware returned a response, return it (authentication failed)
    if (middlewareResponse) {
      return middlewareResponse;
    }
    
    // If authentication passed, run the handler
    return handler(req, event);
  };
}