import { NextRequest, NextResponse } from 'next/server';
import { verifyKiloToken, isTokenExpired } from '../../../../../lib/jwt-utils';

export async function POST(req: NextRequest) {
  try {
    // Extract the token from the request body
    const { token } = await req.json();
    
    // If no token provided, return 400
    if (!token) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Token is required.' },
        { status: 400 }
      );
    }
    
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
    
    // Return the decoded token information
    return NextResponse.json({
      valid: true,
      kiloUserId: decodedToken.kiloUserId,
      env: decodedToken.env,
      version: decodedToken.version,
      iat: decodedToken.iat,
      exp: decodedToken.exp,
    });
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}