# JWT Implementation for DamDoh

This directory contains utilities for handling JWT (JSON Web Token) authentication in the DamDoh application. These utilities are designed to work with the custom JWT tokens used in the Kilo system.

## Overview

The JWT implementation provides the following functionality:

1. **Token Verification**: Verify the authenticity and integrity of JWT tokens
2. **Token Decoding**: Decode JWT tokens without verification (for debugging purposes)
3. **Token Generation**: Generate new JWT tokens for users
4. **Middleware**: Protect API routes with JWT authentication
5. **API Endpoints**: Validate and refresh JWT tokens

## Files

- `jwt-utils.ts`: Core utilities for JWT token handling
- `jwt-middleware.ts`: Middleware for protecting API routes with JWT authentication

## Usage

### Token Verification

To verify a JWT token, use the `verifyKiloToken` function:

```typescript
import { verifyKiloToken } from './jwt-utils';

const token = 'your-jwt-token-here';
const decodedToken = verifyKiloToken(token);

if (decodedToken) {
  console.log('Token is valid:', decodedToken);
} else {
  console.log('Token is invalid or expired');
}
```

### Token Decoding

To decode a JWT token without verification (for debugging purposes), use the `decodeKiloToken` function:

```typescript
import { decodeKiloToken } from './jwt-utils';

const token = 'your-jwt-token-here';
const decodedToken = decodeKiloToken(token);

if (decodedToken) {
  console.log('Decoded token:', decodedToken);
} else {
  console.log('Failed to decode token');
}
```

### Token Generation

To generate a new JWT token for a user, use the `generateKiloToken` function:

```typescript
import { generateKiloToken } from './jwt-utils';

const kiloUserId = 'user-id';
const env = 'production';
const expiresIn = '7d'; // 7 days

const token = generateKiloToken(kiloUserId, env, expiresIn);
console.log('Generated token:', token);
```

### Middleware Protection

To protect API routes with JWT authentication, use the `withKiloAuth` higher-order function:

```typescript
import { withKiloAuth } from './jwt-middleware';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withKiloAuth(async (req: NextRequest) => {
  // This code will only run if the user is authenticated
  return NextResponse.json({ message: 'Protected content' });
});
```

### API Endpoints

The following API endpoints are available for JWT token handling:

1. **Token Validation**: `POST /api/auth/validate-token`
   - Validates a JWT token
   - Request body: `{ "token": "your-jwt-token" }`
   - Response: Token information if valid, error if invalid or expired

2. **Token Refresh**: `POST /api/auth/refresh-token`
   - Refreshes an expired JWT token
   - Request body: `{ "token": "your-expired-jwt-token" }`
   - Response: New JWT token if the old one was valid but expired

## Token Structure

The JWT tokens used in this system have the following structure:

```json
{
  "env": "production",
  "kiloUserId": "user-id",
  "apiTokenPepper": null,
  "version": 3,
  "iat": 1757493783,
  "exp": 1915281783
}
```

- `env`: The environment (e.g., "production", "staging")
- `kiloUserId`: The user's ID in the Kilo system
- `apiTokenPepper`: Reserved for future use (currently null)
- `version`: The token version (currently 3)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

## Security Considerations

1. **Secret Key**: The JWT secret key is stored in the `JWT_SECRET` environment variable. In production, this should be a strong, randomly generated secret.
2. **Token Expiration**: Tokens have a default expiration time of 7 days. This can be adjusted as needed.
3. **Token Validation**: Always validate tokens before using the data they contain.
4. **HTTPS**: JWT tokens should only be transmitted over HTTPS to prevent interception.

## Integration with Firebase Authentication

The system is designed to work with both Firebase Authentication and JWT tokens. The `checkAuth` function in `src/firebase/functions/src/utils.ts` can handle both authentication methods:

1. Firebase Authentication tokens are checked first
2. If not found, JWT tokens in the `x-kilo-token` header are checked
3. If neither is found or valid, an authentication error is thrown

This allows for gradual migration from Firebase Authentication to JWT tokens if needed.