# Backend Mobile Setup Instructions

## Problem Diagnosis

The error `Foreign key constraint violated on pets_ownerId_fkey` means:
- The user ID from the JWT token doesn't exist in the database
- OR there's a database connection issue

## Step-by-Step Fix

### 1. Create `.env` file

```bash
cd backend-mobile
cp env.example .env
```

### 2. Edit `.env` file with these values:

```env
# Database Configuration
MOBILE_DATABASE_URL="postgresql://postgres:dogaspetiscute123@spoodle-database.cdae4aoagblz.us-east-2.rds.amazonaws.com:5432/spoodle-database?schema=public&sslmode=require"

# Server Configuration
PORT=3002
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Email Configuration (Resend)
RESEND_API_KEY=re_7ctz113w_KxinfthUT66rNRDEaqNEq1LQ

# App Configuration
MOBILE_APP_VERSION=1.0.0
FRONTEND_URL=http://localhost:19006
```

### 3. Run the debug script to check database

```bash
cd backend-mobile
npx tsx debug-user.ts
```

This will show you:
- If the database connection works
- Which users exist in the database
- If the user from the JWT token exists
- How many pets are in the database

### 4. If the user doesn't exist, register a new one

```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "password": "password123",
    "phone": "+1234567890"
  }'
```

### 5. Login and get a fresh token

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 6. Use the new token to create a pet

```bash
curl -X POST http://localhost:3002/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Buddy",
    "species": "Dog",
    "breed": "Golden Retriever"
  }'
```

## Common Issues

### Issue 1: TLS Certificate Error
**Error**: `Error opening a TLS connection: bad certificate format`
**Fix**: Change `sslmode=require` to `sslmode=prefer` or `sslmode=disable` in the database URL

### Issue 2: User doesn't exist
**Error**: `Foreign key constraint violated on pets_ownerId_fkey`
**Fix**: Register a new user or use an existing user's token

### Issue 3: Backend not starting
**Error**: `EADDRINUSE: address already in use`
**Fix**: Kill existing processes:
```bash
pkill -f "tsx.*src/index.ts"
```

## Quick Test

Run this to test everything:

```bash
# 1. Start backend
cd backend-mobile && npx tsx src/index.ts &

# 2. Wait 3 seconds
sleep 3

# 3. Test health endpoint
curl http://localhost:3002/health

# 4. Register a user
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","lastName":"User","password":"password123"}'

# 5. Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

