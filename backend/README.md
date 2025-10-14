# Spoodle Backend API

A comprehensive backend API for the Spoodle pet management application, built with Node.js, Express, and TypeScript.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with refresh tokens
- 🐾 **Pet Management**: Complete CRUD operations for pets
- 📅 **Appointment Scheduling**: Book and manage veterinary appointments
- 📋 **Task Management**: Create and track pet care tasks
- 📄 **Medical Records**: Upload and manage pet medical documents
- 🔍 **Search Functionality**: Search across pets, appointments, tasks, and records
- 🔔 **Notifications**: Real-time notification system
- 📁 **File Upload**: Secure file upload for medical records
- 🛡️ **Security**: Rate limiting, input validation, and CORS protection

## Tech Stack

- **Runtime**: Node.js (>=22.0.0)
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer
- **Validation**: Joi
- **Database**: Local JSON files (easily replaceable with PostgreSQL/MongoDB)

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

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user profile
- `POST /logout` - Logout user

### Pets (`/api/pets`)
- `GET /` - Get all user's pets
- `GET /:id` - Get specific pet
- `POST /` - Create new pet
- `PUT /:id` - Update pet
- `DELETE /:id` - Delete pet
- `GET /:id/records` - Get pet's medical records
- `GET /:id/tasks` - Get pet's tasks

### Appointments (`/api/appointments`)
- `GET /` - Get all appointments
- `GET /schedule` - Get appointments by date range
- `GET /:id` - Get specific appointment
- `POST /` - Create new appointment
- `PUT /:id` - Update appointment
- `PATCH /:id/cancel` - Cancel appointment
- `DELETE /:id` - Delete appointment

### Tasks (`/api/tasks`)
- `GET /` - Get all tasks
- `GET /pet/:petId` - Get tasks for specific pet
- `GET /:id` - Get specific task
- `POST /` - Create new task
- `PUT /:id` - Update task
- `PATCH /:id/complete` - Mark task as completed
- `PATCH /:id/uncomplete` - Mark task as incomplete
- `DELETE /:id` - Delete task

### Medical Records (`/api/medical-records`)
- `GET /` - Get all medical records
- `GET /pet/:petId` - Get records for specific pet
- `GET /:id` - Get specific record
- `POST /upload` - Upload single file
- `POST /upload-multiple` - Upload multiple files
- `PUT /:id` - Update record metadata
- `DELETE /:id` - Delete record

### Search (`/api/search`)
- `GET /` - Global search across all entities
- `GET /pets` - Search pets specifically
- `GET /appointments` - Search appointments specifically
- `GET /tasks` - Search tasks specifically
- `GET /records` - Search medical records specifically

### Notifications (`/api/notifications`)
- `GET /` - Get all notifications
- `GET /unread-count` - Get unread notifications count
- `GET /type/:type` - Get notifications by type
- `GET /:id` - Get specific notification
- `PATCH /:id/read` - Mark notification as read
- `PATCH /mark-all-read` - Mark all notifications as read
- `DELETE /:id` - Delete notification

### File Upload (`/uploads`)
- `GET /:filename` - Serve uploaded files

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
  scheduledDuration?: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  appointmentType: 'general_exam' | 'vaccination' | 'dental' | 'surgery' | 'emergency' | 'follow_up';
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
backend/
├── src/
│   ├── database/
│   │   ├── entities/        # TypeScript interfaces
│   │   └── crud/           # Database operations
│   ├── middleware/         # Express middleware
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic
│   └── shared/           # Shared utilities
├── data/                 # Local database files
├── uploads/              # Uploaded files
└── package.json
```

## Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Joi schema validation for all endpoints
- **Authentication**: JWT tokens with secure refresh mechanism
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers middleware
- **File Upload Security**: Type and size restrictions
- **SQL Injection Protection**: Parameterized queries (when using SQL databases)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `7d` |
| `REFRESH_TOKEN_SECRET` | Refresh token secret | Required |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiry | `30d` |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Max file size in bytes | `10485760` (10MB) |
| `ALLOWED_FILE_TYPES` | Allowed file extensions | `pdf,jpg,jpeg,png,doc,docx` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## Database

Currently uses a local JSON file-based database for simplicity. The database layer is abstracted and can be easily replaced with:

- PostgreSQL
- MongoDB
- MySQL
- SQLite

## Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker (Optional)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please open an issue on GitHub or contact the development team.
