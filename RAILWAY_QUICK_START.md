# Railway Quick Start Guide 🚀

## Step 1: Add PostgreSQL Database
1. Go to Railway project dashboard
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Done! Railway creates the database automatically

## Step 2: Deploy Backend
1. Click **"+ New"** → **"GitHub Repo"**
2. Select your `Spoodle` repository
3. Set root directory: `backend-mobile`

## Step 3: Set Environment Variables
In Railway dashboard → Your service → **"Variables"** tab:

```bash
NODE_ENV=production
PORT=3002
MOBILE_DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-32-char-random-string>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=<generate-another-32-char-random-string>
REFRESH_TOKEN_EXPIRES_IN=30d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,doc,docx
FRONTEND_URL=*
MOBILE_URL=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RESEND_API_KEY=<your-resend-key>
OPENAI_API_KEY=<your-openai-key>
```

**Generate secure secrets:**
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate REFRESH_TOKEN_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Deploy
1. Commit and push deployment configs to GitHub:
   ```bash
   git add .
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

2. Railway will automatically deploy! 🎉

## Step 5: Test Your Deployment
```bash
# Replace with your Railway URL
curl https://your-service.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Spoodle Mobile API",
  "version": "1.0.0"
}
```

## Step 6: Update Mobile App
Update your mobile app to use the Railway URL:

Create/update `frontend/mobile/.env`:
```bash
EXPO_PUBLIC_API_URL=https://your-service.railway.app
```

## Common Issues & Fixes

### ❌ Build fails
- Check logs in Railway dashboard
- Verify Node.js version is 22+ (configured in nixpacks.toml)

### ❌ Database connection error
- Verify `MOBILE_DATABASE_URL` variable is set to `${{Postgres.DATABASE_URL}}`
- Check PostgreSQL service is running

### ❌ Prisma migration fails
- Ensure `prisma/` folder is committed to git
- Check `prisma/migrations/` folder exists in repository

### ❌ App crashes on startup
- Check all required environment variables are set
- View deployment logs for error messages

## Useful Railway Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project (in backend-mobile directory)
cd backend-mobile
railway link

# View logs
railway logs

# Restart service
railway restart

# Run migrations
railway run npx prisma migrate deploy

# Connect to database
railway connect postgres
```

## What Gets Deployed?

✅ **Included:**
- Source code (`src/`)
- Prisma schema and migrations
- Package dependencies
- Built JavaScript files (generated during deployment)

❌ **Excluded (via .railwayignore):**
- Development files
- Test files
- Local uploads
- Documentation
- IDE configurations
- Temporary scripts

## Monitoring Your App

**View Logs:**
Railway Dashboard → Your Service → "Deployments" → Click latest deployment

**Monitor Usage:**
Railway Dashboard → Project → "Usage" tab

**Database Access:**
Railway Dashboard → PostgreSQL Service → "Data" tab (or use Prisma Studio)

## Production Checklist

Before launching:
- [ ] All environment variables set with production values
- [ ] Strong JWT secrets (not the example ones!)
- [ ] API keys are production keys
- [ ] CORS origins updated for production domains
- [ ] Database backups configured
- [ ] Error monitoring set up
- [ ] Mobile app points to production URL

## Need More Details?

See `RAILWAY_DEPLOYMENT.md` for the complete deployment guide.

---

**That's it!** Your Spoodle backend should now be running on Railway. 🐾

