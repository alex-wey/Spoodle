# Spoodle Mobile Backend

A dedicated Express.js API server for the Spoodle mobile application, completely separate from the web backend.

## Overview

This backend provides API endpoints specifically designed for mobile app consumption. It handles pet management, document storage, AI chatbot integration, and user authentication for the mobile platform. Built with environment-aware configuration to seamlessly work in both development (localhost:3002) and production (Railway).

## Features

- **Authentication**: Clerk-based authentication with secure token validation
- **Pet Management**: Full CRUD operations for pet profiles
- **Document Management**: File upload/download for medical documents
- **AI Chatbot**: OpenAI GPT-4 integration for pet care advice
- **Settings Management**: User preferences and profile settings
- **Bug Reporting**: Comprehensive bug report system with email notifications
- **Database**: PostgreSQL with Prisma ORM
- **Environment-Aware**: Automatically adapts CORS and URLs for development/production

## Quick Start

### Prerequisites

- Node.js >= 22.0.0
- PostgreSQL database
- Clerk account for authentication
- OpenAI API key (for chatbot)
- Resend API key (for email notifications)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp env.example .env
```

3. Configure your `.env` file with:
   - `NODE_ENV=development` (or `production` for Railway)
   - `PORT=3002` (Railway will override this in production)
   - `DATABASE_URL` - PostgreSQL connection string
   - `CLERK_SECRET_KEY` - Your Clerk secret key
   - `CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
   - `OPENAI_API_KEY` - OpenAI API key
   - `RESEND_API_KEY` - Resend email API key

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations (if needed):
```bash
npm run prisma:migrate
```

6. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3002`

## API Endpoints

### Health & Info
- `GET /health` - Health check with environment info
- `GET /api` - API documentation and available endpoints

### Authentication (Clerk-based)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `DELETE /api/auth/me` - Delete user account

### Pets
- `GET /api/pets` - Get all user's pets
- `GET /api/pets/:id` - Get specific pet
- `POST /api/pets` - Create new pet
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

### Documents
- `GET /api/documents` - Get all user's documents
- `GET /api/documents/category/:category` - Get documents by category
- `GET /api/documents/pet/:petId/category/:category` - Get documents by pet and category
- `POST /api/documents` - Upload document
- `GET /api/documents/download/:id` - Download document

### Chatbot
- `POST /api/chatbot/chat` - Send message to AI chatbot

### Bug Reports
- `POST /api/bug-report` - Submit bug report (sends email notification)

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

### Setup (Initial Configuration)
- `POST /api/setup/complete` - Complete initial app setup

## Project Structure

```
backend-mobile/
├── src/                    # Main application code
│   ├── index.ts           # Main server with environment-aware config
│   ├── routes/            # API route handlers
│   │   ├── auth.ts       # Clerk authentication routes
│   │   ├── pets.ts       # Pet management routes
│   │   ├── documents.ts  # Document upload/download routes
│   │   ├── chatbot.ts    # AI chatbot routes
│   │   ├── bug-report.ts # Bug reporting routes
│   │   ├── settings.ts   # User settings routes
│   │   └── setup.ts      # Initial setup routes
│   ├── middleware/        # Authentication & validation
│   │   ├── auth.ts       # Clerk token validation
│   │   └── validation.ts # Request validation schemas
│   ├── utils/            # Utility functions
│   └── lib/              # Database connection
├── prisma/               # Database schema and migrations
├── dist/                 # Compiled JavaScript (gitignored)
├── .env                  # Environment variables (gitignored)
├── .railwayignore        # Railway deployment ignore rules
└── package.json
```

**Note**: The `uploads/` directory is not used in production. Use cloud storage (S3, Cloudinary) or Railway volumes for file storage in production environments.

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Database Setup

The backend uses PostgreSQL with Prisma ORM. Make sure to run migrations after setting up your database:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Security

- **Helmet**: Security headers middleware
- **CORS**: Environment-aware CORS configuration
  - Development: Allows localhost origins for Expo dev server
  - Production: Allows all origins (necessary for mobile apps with null/file:// origins)
- **Clerk Authentication**: Secure token-based authentication
- **Input Validation**: Zod schemas for request validation
- **File Type Restrictions**: Configured allowed file types for uploads
- **SSL Database Connections**: Secure database communication

## External Services

- **Clerk**: Authentication and user management
- **OpenAI**: AI chatbot functionality (GPT-4)
- **Resend**: Email notifications for bug reports
- **PostgreSQL**: Database (Railway Postgres in production)

## Environment-Aware Configuration

The server automatically adapts based on `NODE_ENV`:

### Development (`NODE_ENV=development`)
- Runs on `http://localhost:3002`
- CORS allows localhost and Expo dev origins
- Detailed logging and error stack traces
- Database can be local PostgreSQL

### Production (`NODE_ENV=production`)
- Runs on Railway-assigned domain
- CORS allows all origins (for mobile app compatibility)
- Production-optimized logging
- Uses Railway Postgres database
- Automatic graceful shutdown handling

## Railway Deployment

This backend is configured for Railway deployment:

1. **Environment Variables** (set in Railway dashboard):
   - `NODE_ENV=production`
   - `DATABASE_URL` (auto-set by Railway Postgres)
   - `CLERK_SECRET_KEY`
   - `CLERK_PUBLISHABLE_KEY`
   - `OPENAI_API_KEY`
   - `RESEND_API_KEY`

2. **Automatic Variables** (Railway sets these):
   - `PORT` - Railway assigns the port
   - `RAILWAY_PUBLIC_DOMAIN` - Your app's public URL

3. **Build Process**:
   - Railway runs `npm install`
   - Runs `npm run build` (TypeScript compilation)
   - Starts with `npm start`

4. **Health Check**: `https://your-app.railway.app/health`

## Deployment Strategy & Backwards Compatibility

### The Mobile App Store Challenge

The backend can deploy to Railway instantly, but mobile apps go through unpredictable App Store and Play Store review cycles (1-3 days for iOS, hours to days for Android). This creates a coordination problem: backend changes may go live before users have access to the updated mobile app.

### Core Principle: Backwards Compatibility

Always deploy backend changes that maintain compatibility with existing mobile app versions in production. This ensures users on older app versions continue to work seamlessly while new versions are in review.

**Safe Changes (Deploy Anytime):**
- Adding new optional fields to API responses
- Creating new endpoints that old apps don't call
- Making required fields optional (with sensible defaults)
- Adding new query parameters with default values
- Improving performance or fixing bugs that don't change behavior

**Breaking Changes (Avoid or Coordinate):**
- Removing fields from responses that old apps expect
- Renaming fields or changing their data types
- Making optional fields suddenly required
- Removing or renaming existing endpoints
- Changing authentication requirements

### Recommended Approaches

**API Versioning**: When breaking changes are necessary, introduce versioned endpoints (e.g., `/api/v1/pets` and `/api/v2/pets`). Old mobile apps continue using v1 while new versions use v2. This allows independent deployment of backend improvements.

**Feature Flags**: For major new features, add a configuration endpoint that returns enabled features based on the client's app version. Deploy the backend with features "off," then enable them once the mobile app is approved. This requires no redeployment.

**Minimum Version Enforcement**: Include app version headers in requests and validate them server-side. If a critical security update requires breaking changes, return a "must upgrade" response to force users to update their apps.

### Deployment Workflow

The typical workflow is backend-first: deploy backward-compatible backend changes, submit the mobile app for review, and features become available immediately upon approval. Old app versions continue functioning without interruption.

For monitoring, log the app version from request headers to understand which versions are actively being used in production. This helps determine when it's safe to deprecate old API versions.

### Production vs Development

In development, iterate quickly without worrying about compatibility. In production, treat every deployment as if thousands of users are on versions you deployed weeks ago, because they are. App store reviews and user update behavior mean version fragmentation is inevitable.

The mobile app currently points to the Railway production URL configured in `eas.json`. Any breaking backend changes must coordinate with a new mobile app release cycle.

## Environment Variables

See `env.example` for all required environment variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3002)
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Clerk authentication secret
- `CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `OPENAI_API_KEY` - OpenAI API key
- `RESEND_API_KEY` - Resend email API key

## License

Private - Spoodle Mobile Backend
