# Spoodle Mobile Backend

A dedicated Express.js API server for the Spoodle mobile application, completely separate from the web backend.

## Overview

This backend provides API endpoints specifically designed for mobile app consumption, running on port 3002. It handles pet management, document storage, AI chatbot integration, and user authentication for the mobile platform.

## Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Pet Management**: Full CRUD operations for pet profiles
- **Document Management**: File upload/download for medical documents
- **AI Chatbot**: OpenAI GPT-3.5-turbo integration for pet care advice
- **Dashboard**: User analytics and task tracking
- **Bug Reporting**: Comprehensive bug report system with email notifications
- **Database**: PostgreSQL with Prisma ORM

## Quick Start

### Prerequisites

- Node.js >= 22.0.0
- PostgreSQL database
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
   - Database connection string
   - JWT secrets
   - API keys for external services

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3002`

## API Endpoints

- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/pets` - Get user's pets
- `POST /api/pets` - Create new pet
- `GET /api/documents` - Get user's documents
- `POST /api/documents/upload` - Upload document
- `GET /api/dashboard` - Dashboard data
- `POST /api/chatbot/chat` - AI chatbot
- `POST /api/bug-report` - Submit bug report

## Project Structure

```
backend-mobile/
├── src/                    # Main application code
│   ├── routes/            # API route handlers
│   ├── middleware/        # Authentication & validation
│   ├── services/          # External service integrations
│   └── lib/              # Database connection
├── prisma/               # Database schema
├── scripts/              # Utility scripts
│   ├── debug/           # Debugging scripts (dev only)
│   └── test/            # Testing scripts
├── uploads/             # File upload storage
├── dist/               # Compiled JavaScript
└── package.json
```

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

The backend uses PostgreSQL with Prisma ORM. Database setup scripts are available in `scripts/debug/` for development purposes.

## Security

- Helmet for security headers
- CORS configured for mobile app origins
- Input validation with Zod schemas
- File type restrictions for uploads
- SSL database connections

## External Services

- **OpenAI**: AI chatbot functionality
- **Resend**: Email notifications for bug reports
- **AWS RDS**: PostgreSQL database hosting

## Environment Variables

See `env.example` for required environment variables including:
- Database connection string
- JWT secrets
- OpenAI API key
- Resend API key
- File upload settings

## License

Private - Spoodle Mobile Backend
