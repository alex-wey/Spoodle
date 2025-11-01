# Spoodle Backend API

A comprehensive backend API for the Spoodle pet management application, built with Node.js, Express, and TypeScript. Designed for both pet owners and veterinary clinics to manage pets, appointments, medical records, and tasks.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with refresh tokens and secure password hashing
- 🐾 **Pet Management**: Complete CRUD operations for pets with owner information
- 📅 **Appointment Scheduling**: Book and manage veterinary appointments with conflict detection
- 📋 **Task Management**: Create and track pet care tasks with recurring options
- 📄 **Medical Records**: Upload and manage pet medical documents with multiple file types
- 🔍 **Search Functionality**: Global search across pets, appointments, tasks, and medical records
- 🔔 **Notifications**: Notification system for reminders and updates
- 📁 **File Upload**: Secure file upload with type and size validation
- 🛡️ **Security**: Rate limiting, input validation, Helmet security headers, and CORS protection
- 🏥 **Clinic Management**: Support for multiple clinics and veterinary profiles
- 👥 **Multi-user Support**: Separate routes for pet owners and veterinary staff

## Tech Stack

- **Runtime**: Node.js (>=22.0.0)
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT with bcryptjs for password hashing
- **File Upload**: Multer with configurable limits
- **Validation**: Joi schema validation
- **Database**: Local JSON files (development) / Prisma ORM with PostgreSQL (production-ready)
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Morgan HTTP request logger

## Quick Start

### Prerequisites

- Node.js >= 22.0.0
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   REFRESH_TOKEN_EXPIRES_IN=30d
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## Architecture Overview

The Spoodle backend is built with a modular, scalable architecture:

- **Express.js Server**: RESTful API with comprehensive error handling
- **TypeScript**: Type-safe codebase with full type definitions
- **Dual Database Support**: JSON files for development, PostgreSQL for production
- **Middleware Stack**: Authentication, validation, rate limiting, and security
- **Modular Routes**: Separated concerns for each entity type
- **Service Layer**: Business logic abstraction for auth and other services
- **CRUD Abstraction**: Generic database operations for easy maintenance

### Key Design Decisions

1. **Flexible Database Layer**: Switch between JSON files and PostgreSQL without code changes
2. **JWT Authentication**: Stateless authentication with refresh token support
3. **Comprehensive Validation**: Joi schemas for all inputs to prevent invalid data
4. **Owner-based Access Control**: Users can only access their own data
5. **Separate Vet Routes**: Dedicated endpoints for veterinary staff with different permissions
6. **File Upload Support**: Secure medical record file uploads with validation
7. **Consistent API Responses**: Standardized response format across all endpoints

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user profile
- `POST /logout` - Logout user

### Pets (`/api/pets`)

**Pet Owner Routes (Auth Required):**
- `GET /` - Get all user's pets
- `GET /:id` - Get specific pet (owned by user)
- `POST /` - Create new pet
- `PUT /:id` - Update pet
- `DELETE /:id` - Delete pet
- `GET /:id/records` - Get pet's medical records
- `GET /:id/tasks` - Get pet's tasks

**Veterinary Staff Routes (Optional Auth):**
- `GET /all` - Get all pets with owner information
- `GET /:id/details` - Get pet details with owner information
- `GET /:id/medical-records` - Get pet's medical records (for vets)

### Appointments (`/api/appointments`)
All routes require authentication.

- `GET /` - Get all appointments for authenticated user
- `GET /schedule?startDate=<date>&endDate=<date>` - Get appointments by date range
- `GET /:id` - Get specific appointment
- `POST /` - Create new appointment (with conflict detection)
- `PUT /:id` - Update appointment
- `PATCH /:id/cancel` - Cancel appointment (pending/confirmed only)
- `DELETE /:id` - Delete appointment

### Tasks (`/api/tasks`)
All routes require authentication.

- `GET /` - Get all tasks for authenticated user
- `GET /pet/:petId` - Get tasks for specific pet
- `GET /:id` - Get specific task
- `POST /` - Create new task (supports recurring tasks)
- `PUT /:id` - Update task
- `PATCH /:id/complete` - Mark task as completed
- `PATCH /:id/uncomplete` - Mark task as incomplete
- `DELETE /:id` - Delete task

### Medical Records (`/api/medical-records`)
All routes require authentication.

- `GET /` - Get all medical records for authenticated user
- `GET /pet/:petId` - Get records for specific pet
- `GET /:id` - Get specific record
- `POST /upload` - Upload single medical record file
- `POST /upload-multiple` - Upload multiple medical record files
- `PUT /:id` - Update record metadata
- `DELETE /:id` - Delete record and associated file

### Search (`/api/search`)
All routes require authentication. Search is scoped to the authenticated user's data.

- `GET /?q=<query>` - Global search across all entities (pets, appointments, tasks, records)
- `GET /pets?q=<query>` - Search pets by name or breed
- `GET /appointments?q=<query>` - Search appointments by type or notes
- `GET /tasks?q=<query>` - Search tasks by title or description
- `GET /records?q=<query>` - Search medical records by description or file name

### Notifications (`/api/notifications`)
All routes require authentication.

- `GET /` - Get all notifications for authenticated user
- `GET /unread-count` - Get unread notifications count
- `GET /type/:type` - Get notifications by type (task_reminder, appointment_reminder, etc.)
- `GET /:id` - Get specific notification
- `PATCH /:id/read` - Mark notification as read
- `PATCH /mark-all-read` - Mark all notifications as read
- `DELETE /:id` - Delete notification

### File Uploads (`/uploads`)
- `GET /:filename` - Serve uploaded medical record files (static file serving)

## Data Models

### User
```typescript
{
  petOwnerId: string;
  username: string;
  email: string;
  password: string; // hashed
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Pet
```typescript
{
  petId: string;
  ownerId: string;
  name: string;
  breed?: string;
  age?: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  spayedNeutered?: boolean;
  weight?: number;
  allergies?: string[];
  dietaryRestrictions?: string[];
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Appointment
```typescript
{
  appointmentId: string;
  petOwnerId: string;
  petId: string;
  clinicId: string;
  vetId?: string;
  scheduledTime: string;
  scheduledDuration?: number; // in minutes
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  appointmentType: 'general_exam' | 'vaccination' | 'dental' | 'surgery' | 'emergency' | 'follow_up';
  reason?: string;
  notes?: string;
  preVisitForms?: string[];
  attachedRecords?: string[];
  dischargedDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Task
```typescript
{
  taskId: string;
  petId: string;
  ownerId: string;
  type: 'walk' | 'feed' | 'medicate' | 'groom' | 'training' | 'checkup' | 'other';
  title: string;
  description?: string;
  scheduledTime: string;
  completionStatus: boolean;
  completedAt?: string;
  completedBy?: string;
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Medical Record
```typescript
{
  recordId: string;
  petId: string;
  ownerId: string;
  fileType: 'medical_history' | 'vaccination' | 'medication' | 'surgical' | 'diagnostic' | 'blood_work' | 'x_ray';
  fileName: string;
  fileUrl?: string;
  uploadDate: string;
  description?: string;
  clinicId?: string;
  vetId?: string;
}
```

### Clinic
```typescript
{
  clinicId: string;
  name: string;
  address: string;
  phoneNumber?: string;
  email?: string;
  hours?: {
    [key: string]: { open: string; close: string; } | null; // Mon-Sun
  };
  services?: string[];
  staffAccounts?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Notification
```typescript
{
  notificationId: string;
  userId: string;
  type: 'task_reminder' | 'task_overdue' | 'appointment_confirmation' | 
        'appointment_reminder' | 'appointment_update' | 'record_shared' | 
        'friend_request' | 'system_update';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload (uses tsx watch)
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server (from compiled dist/)
- `npm run clean` - Remove dist/ directory
- `npm run type-check` - Run TypeScript type checking without emitting files
- `npm run lint` - Run ESLint on TypeScript files
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without modifying files
- `npm run seed` - Seed database with sample data
- `npm run reset-db` - Delete database and reseed with fresh data
- `npm run show-table` - Display pet table data (debug utility)
- `npm run add-pets` - Add new pets to database (debug utility)

### Project Structure

```
backend/
├── src/
│   ├── services/
│   │   └── api/
│   │       └── src/
│   │           └── index.ts          # Main Express server
│   ├── database/
│   │   ├── entities/
│   │   │   └── index.ts              # TypeScript type definitions
│   │   ├── crud/
│   │   │   └── index.ts              # Database CRUD operations
│   │   └── prisma.ts                 # Prisma client setup (for PostgreSQL)
│   ├── middleware/
│   │   ├── auth.ts                   # JWT authentication
│   │   ├── validation.ts             # Joi validation schemas
│   │   ├── rateLimiting.ts           # Rate limiting config
│   │   └── fileUpload.ts             # Multer file upload config
│   ├── routes/
│   │   ├── auth.ts                   # Authentication endpoints
│   │   ├── pets.ts                   # Pet management endpoints
│   │   ├── appointments.ts           # Appointment endpoints
│   │   ├── tasks.ts                  # Task management endpoints
│   │   ├── medicalRecords.ts         # Medical records endpoints
│   │   ├── search.ts                 # Search endpoints
│   │   ├── notifications.ts          # Notification endpoints
│   │   └── uploads.ts                # File serving endpoints
│   ├── scripts/
│   │   ├── seedData.ts               # Database seeding script
│   │   ├── addNewPets.ts             # Add pets utility
│   │   └── showPetTable.ts           # Display pets utility
│   └── shared/
│       └── utils.ts                  # Shared utility functions
├── data/
│   └── local-db/                     # JSON database files (development)
│       ├── users.json
│       ├── pets.json
│       ├── appointments.json
│       ├── tasks.json
│       ├── medicalRecords.json
│       ├── clinics.json
│       ├── vetProfiles.json
│       └── notifications.json
├── prisma/
│   ├── schema.prisma                 # Prisma schema (PostgreSQL)
│   └── migrations/                   # Database migrations
├── uploads/                          # Uploaded medical record files
├── dist/                             # Compiled JavaScript (production)
├── generated/                        # Generated Prisma client
├── .env                              # Environment variables
├── env.example                       # Example environment config
├── package.json
└── tsconfig.json
```

## Security Features

- **Rate Limiting**: Express-rate-limit with configurable windows and request limits
  - Stricter limits on authentication endpoints
  - Configurable via environment variables
- **Input Validation**: Joi schema validation for all request bodies, params, and queries
- **Authentication**: JWT tokens with bcryptjs password hashing and refresh token mechanism
- **Authorization**: Route-level access control ensuring users can only access their own data
- **CORS Protection**: Configurable cross-origin resource sharing for frontend and mobile apps
- **Helmet**: Security headers middleware for common vulnerabilities
- **File Upload Security**: 
  - File type restrictions (pdf, jpg, jpeg, png, doc, docx)
  - File size limits (configurable, default 10MB)
  - Secure file storage with unique filenames
- **Password Security**: Bcryptjs hashing with salt rounds
- **Environment Variables**: Sensitive configuration stored in .env files

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `JWT_SECRET` | JWT signing secret | **Required** |
| `JWT_EXPIRES_IN` | Access token expiry | `7d` |
| `REFRESH_TOKEN_SECRET` | Refresh token secret | **Required** |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiry | `30d` |
| `DB_TYPE` | Database type (local/postgres) | `local` |
| `DB_DATA_DIR` | Local database directory | `./data/local-db` |
| `DATABASE_URL` | PostgreSQL connection string (for Prisma) | - |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Max file size in bytes | `10485760` (10MB) |
| `ALLOWED_FILE_TYPES` | Allowed file extensions | `pdf,jpg,jpeg,png,doc,docx` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit time window (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Database

The backend supports two database modes:

### Development Mode (Local JSON Files)
- Uses JSON files stored in `data/local-db/`
- Perfect for development and testing
- No external database required
- Easy to inspect and modify data
- Includes seeding scripts for sample data

### Production Mode (PostgreSQL with Prisma)
- Prisma ORM with PostgreSQL support
- Schema defined in `prisma/schema.prisma`
- Includes migrations for version control
- Type-safe database queries
- Supports models: Vet, PetOwner, Pet, Appointment, MedicalRecord

To switch between modes, set the `DB_TYPE` environment variable to `local` or `postgres`.

### Database Seeding

```bash
# Seed the database with sample data
npm run seed

# Reset database and reseed
npm run reset-db
```

The seed script creates sample users, pets, appointments, tasks, clinics, and medical records for testing.

## API Testing

You can test the API using tools like:

- **Postman**: Import endpoints and test interactively
- **cURL**: Command-line testing
- **Thunder Client** (VS Code extension): In-editor API testing
- **Insomnia**: REST API client

### Example API Calls

```bash
# Health check
curl http://localhost:3001/health

# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get pets (requires auth token)
curl http://localhost:3001/api/pets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Deployment

### Production Build

1. **Build the TypeScript code:**
   ```bash
   npm run build
   ```

2. **Set production environment variables:**
   ```bash
   export NODE_ENV=production
   export JWT_SECRET=your-secure-secret
   export REFRESH_TOKEN_SECRET=your-refresh-secret
   export DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

3. **Run database migrations (if using PostgreSQL):**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

### Docker Deployment (Optional)

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist ./dist
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]
```

### Environment Considerations

- Use strong, unique secrets for JWT tokens in production
- Enable HTTPS/TLS for secure communication
- Configure appropriate CORS origins
- Set up proper logging and monitoring
- Use PostgreSQL instead of local JSON files
- Configure rate limiting based on expected traffic
- Set up automated backups for the database

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message"
}
```

### Paginated Response (when applicable)
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "count": 25,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

## Authentication Flow

1. **Register**: `POST /api/auth/register` - Create a new user account
2. **Login**: `POST /api/auth/login` - Receive access token and refresh token
3. **Access Protected Routes**: Include `Authorization: Bearer <token>` header
4. **Refresh Token**: `POST /api/auth/refresh` - Get new access token when expired
5. **Logout**: `POST /api/auth/logout` - Invalidate tokens (client-side)

## Development Tips

- Use `npm run dev` for hot-reload during development
- Check `http://localhost:3001/health` to verify server is running
- Use `npm run seed` to populate database with test data
- Enable detailed error messages by setting `NODE_ENV=development`
- Use `npm run show-table` to inspect pet data during development
- All timestamps are in ISO 8601 format
- UUIDs are used for all entity IDs

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Database Connection Issues
- Verify `.env` file exists and has correct values
- For local JSON: ensure `data/local-db/` directory exists
- For PostgreSQL: verify `DATABASE_URL` is correct

### File Upload Issues
- Check `UPLOAD_DIR` exists and has write permissions
- Verify file size is under `MAX_FILE_SIZE`
- Ensure file type is in `ALLOWED_FILE_TYPES`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and type checking (`npm run lint`, `npm run type-check`)
5. Format code (`npm run format`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please open an issue on the GitHub repository or contact the development team.
