import { NextRequest, NextResponse } from 'next/server';
import { verifyKiloToken, generateKiloToken, isTokenExpired } from '../../../../../lib/jwt-utils';

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
    if (!isTokenExpired(decodedToken)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Token is not expired yet.' },
        { status: 400 }
      );
    }
    
    // Generate a new token with the same user ID and environment
    const newToken = generateKiloToken(decodedToken.kiloUserId, decodedToken.env);
    
    // Return the new token
    return NextResponse.json({
      token: newToken,
      kiloUserId: decodedToken.kiloUserId,
      env: decodedToken.env,
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}