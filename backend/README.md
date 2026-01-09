# Spoodle Backend API

Express.js API server for the Spoodle pet management platform, serving both mobile and web applications.

## Quick Start

### Prerequisites

- Node.js >= 22.0.0
- PostgreSQL database
- Clerk account for authentication
- OpenAI API key (for chatbot)
- Resend API key (for email notifications)
- AWS credentials (optional, for S3 document storage)
- Cal.com account (for appointment scheduling)
- Tally account (optional, for form integration)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env` file):
```env
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://user:password@localhost:5432/spoodle
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
OPENAI_API_KEY=your_openai_key
RESEND_API_KEY=your_resend_key

# S3 for document storage (required)
USE_S3=true
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=spoodle-documents

# Cal.com for appointment scheduling
CALCOM_API_KEY=your_calcom_api_key
CALCOM_BASE_URL=https://api.cal.com/v1

# Tally for forms (optional)
TALLY_API_KEY=your_tally_api_key
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3002`

## Project Structure

```
backend/
├── src/
│   ├── routes/               # API route handlers
│   │   ├── auth.ts
│   │   ├── pets.ts
│   │   ├── documents.ts
│   │   ├── tasks.ts
│   │   ├── clinics.ts
│   │   ├── chatbot.ts
│   │   ├── settings.ts
│   │   ├── setup.ts
│   │   ├── bug-report.ts
│   │   ├── forms.ts
│   │   ├── appointments.ts
│   │   ├── appointment-invites.ts
│   │   └── webhooks.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts
│   │   └── validation.ts
│   └── utils/              # Utility functions
│       ├── clinicAuth.ts
│       ├── clinicSync.ts
│       ├── userSync.ts
│       ├── staffSync.ts
│       ├── email.ts
│       └── calcom.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── scripts/                # Utility scripts
├── dist/                  # Compiled JavaScript (generated)
└── generated/             # Prisma generated client (generated)
```

## API Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /api` - API documentation

### Authentication
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
- `POST /api/documents` - Upload document (multipart/form-data)
- `GET /api/documents/download/:id` - Download document
- `DELETE /api/documents/:id` - Delete document

### Tasks
- `GET /api/tasks` - Get all tasks (supports `?petId=`, `?startDate=`, `?endDate=`)
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id` - Update task (partial)
- `PATCH /api/tasks/:id/complete` - Mark task as completed
- `DELETE /api/tasks/:id` - Delete task

### Clinics
- `GET /api/clinics` - Get all available clinics (public)
- `GET /api/clinics/by-organization/:organizationId` - Get clinic by Clerk org ID
- `GET /api/clinics/my-clinic` - Get current user's clinic
- `POST /api/clinics/select` - Select clinic during signup
- `POST /api/clinics/switch` - Switch to different clinic
- `POST /api/clinics/staff/verify` - Verify staff clinic access

### Chatbot
- `POST /api/chatbot/chat` - Send message to AI chatbot

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

### Setup
- `POST /api/setup/complete` - Complete initial app setup

### Bug Reports
- `POST /api/bug-report` - Submit bug report (sends email notification)

### Forms
- `GET /api/forms` - Get all forms (filtered by clinic)
- `GET /api/forms/:id` - Get specific form by ID
- `POST /api/forms` - Create new form (link Tally form to system)
- `PUT /api/forms/:id` - Update form (title, description, isActive, etc.)
- `GET /api/forms/:id/submissions` - Get all submissions for a form

### Appointments
- `GET /api/appointments` - Get all appointments (supports `?clinicId=`, `?status=`, `?petId=`, `?staffId=`)
- `GET /api/appointments/:id` - Get specific appointment by ID
- `GET /api/appointments/event-types` - Get all Cal.com event types
- `GET /api/appointments/scheduling-link` - Generate Cal.com scheduling link for booking

### Appointment Invites
- `GET /api/appointment-invites` - Get all appointment invites (supports `?clinicId=`, `?petId=`, `?staffId=`)
- `GET /api/appointment-invites/:id` - Get specific appointment invite by ID
- `POST /api/appointment-invites` - Create appointment invite (generates Cal.com booking link)
- `DELETE /api/appointment-invites/:id` - Cancel appointment invite

### Webhooks
- `POST /api/webhooks/tally` - Tally form submission webhook
- `POST /api/webhooks/calcom` - Cal.com booking events webhook (BOOKING_CREATED, BOOKING_CANCELLED, BOOKING_RESCHEDULED)

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema changes to database
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Features

- **Authentication**: Clerk-based authentication with secure token validation
- **Pet Management**: Full CRUD operations for pet profiles
- **Document Management**: File upload/download with S3 or local storage
- **Task Management**: Create and manage pet care tasks with recurrence support
- **Clinic Management**: Multi-clinic support with organization sync
- **AI Chatbot**: OpenAI GPT-4 integration for pet care advice
- **Settings Management**: User preferences and profile settings
- **Forms Integration**: Tally form integration with submission tracking and webhook handling
- **Appointment Scheduling**: Cal.com integration for appointment booking and management
- **Appointment Invites**: Generate and track appointment invitation links for pet owners
- **Webhooks**: Support for Tally form submissions and Cal.com booking events (creates appointments automatically, cleans up invites)
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Helmet, CORS, input validation, rate limiting

## Deployment

### Railway

The backend is configured for Railway deployment:

1. Set environment variables in Railway dashboard
2. Railway automatically runs `npm install`, `npm run build`, and `npm start`
3. Database migrations run automatically on startup (`prisma migrate deploy`)

### Environment Variables

Required:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (Railway sets this automatically)
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Clerk authentication secret
- `CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `OPENAI_API_KEY` - OpenAI API key
- `RESEND_API_KEY` - Resend email API key
- `USE_S3` - Use S3 for document storage (set to `true`)
- `AWS_REGION` - AWS region for S3
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `S3_BUCKET_NAME` - S3 bucket name
- `CALCOM_API_KEY` - Cal.com API key for appointment scheduling
- `CALCOM_BASE_URL` - Cal.com API base URL (default: https://api.cal.com/v1)

Optional:
- `TALLY_API_KEY` - Tally API key for form integration

## License

Private - Spoodle Backend API
