# DamDoh Local Development Setup

This guide will help you set up and run the DamDoh project locally with Firebase emulators for backend-in-a-box development.

## Prerequisites

- Node.js (version 18 or higher)
- Docker and Docker Compose
- Firebase CLI (install with `npm install -g firebase-tools`)

## Setup Instructions

### 1. Install Dependencies

First, install the project dependencies:

```bash
npm install
```

This will also automatically build the Firebase functions.

### 2. Environment Configuration

The project uses environment variables for configuration. The `.env` file already contains the necessary variables for local development, including:

- Firebase configuration for the client-side
- JWT_SECRET for local token signing/verification

For production deployments, you should update these values with your actual Firebase project credentials.

### 3. Start Firebase Emulators

To start the Firebase emulators (Firestore, Auth, Functions, etc.), run:

```bash
docker-compose up -d
```

This will start the Firebase emulators in Docker containers. The emulators will be available at:

- Emulator Suite UI: http://localhost:4000
- Firestore Emulator: http://localhost:8080
- Auth Emulator: http://localhost:9099
- Functions Emulator: http://localhost:5001

### 4. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Available Scripts

- `npm run dev` - Starts the Next.js development server
- `npm run build` - Builds the Next.js application for production
- `npm run start` - Starts the production server
- `npm run lint` - Runs ESLint
- `npm run typecheck` - Runs TypeScript type checking
- `npm run firebase:emulators` - Starts Firebase emulators locally (without Docker)
- `npm run firebase:emulators:export` - Exports emulator data to firebase_data directory
- `npm run build-functions` - Builds Firebase functions
- `npm run serve-functions` - Serves Firebase functions locally
- `npm run deploy-functions` - Deploys Firebase functions to your Firebase project

## Authentication

The project uses both Firebase Authentication and JWT tokens for authentication:

1. Firebase Authentication is used for the main authentication flow
2. JWT tokens are used for API authentication in some cases

For local development, the Firebase emulators handle authentication. You can create test users through the Firebase Auth emulator UI at http://localhost:4000/auth.

## Data Persistence

The Firebase emulators are configured to persist data to the `firebase_data` directory. This means your test data will be preserved between emulator restarts.

To clear the data, you can delete the `firebase_data` directory and restart the emulators.

## Troubleshooting

### Firebase Emulator Issues

If you encounter issues with the Firebase emulators:

1. Make sure Docker is running
2. Check that the required ports (4000, 8080, 9099, 5001, 5000) are not being used by other applications
3. Try restarting the Docker containers:

```bash
docker-compose down
docker-compose up -d
```

### Dependency Issues

If you encounter dependency issues:

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. If issues persist, try `npm install --legacy-peer-deps`

## Project Structure

- `src/` - Next.js frontend application
- `firebase/functions/` - Firebase Cloud Functions backend
- `lib/` - Shared utilities (JWT handling, etc.)
- `docker-compose.yml` - Docker configuration for Firebase emulators

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run typecheck` to ensure code quality
4. Submit a pull request
