# Railway Deployment Guide for Spoodle

This guide will help you deploy the Spoodle mobile backend to Railway.

## Prerequisites

- ✅ Railway account (you have this)
- ✅ Railway project created (you have this)
- ✅ GitHub repository with your code
- Railway CLI (optional but recommended)

## Step-by-Step Deployment Instructions

### 1. Set Up PostgreSQL Database on Railway

1. **Add PostgreSQL to your Railway project:**
   - Go to your Railway project dashboard
   - Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
   - Railway will automatically provision a PostgreSQL database

2. **Get Database Connection String:**
   - Click on your PostgreSQL service
   - Go to the **"Variables"** tab
   - Copy the `DATABASE_URL` value (it should look like: `postgresql://postgres:...@...railway.app:5432/railway`)

### 2. Connect Your GitHub Repository

1. **Link your repository:**
   - In your Railway project, click **"+ New"** → **"GitHub Repo"**
   - Select your `Spoodle` repository
   - Railway will detect your project structure

2. **Configure the service:**
   - Railway should detect the Node.js project
   - If it asks for a root directory, specify: `backend-mobile`

### 3. Configure Environment Variables

In your Railway project dashboard, click on your backend service → **"Variables"** tab, and add these variables:

```bash
# Required Variables
NODE_ENV=production
PORT=3002
MOBILE_DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Configuration
JWT_SECRET=<generate-a-secure-random-string-here>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=<generate-another-secure-random-string-here>
REFRESH_TOKEN_EXPIRES_IN=30d

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,doc,docx

# CORS Configuration (update after deployment)
FRONTEND_URL=https://your-frontend-domain.com
MOBILE_URL=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Resend) - IMPORTANT: Replace with your key
RESEND_API_KEY=<your-resend-api-key>

# OpenAI Configuration - IMPORTANT: Replace with your key
OPENAI_API_KEY=<your-openai-api-key>
```

**Important Notes:**
- Replace `<generate-a-secure-random-string-here>` with actual secure random strings (at least 32 characters)
- The `${{Postgres.DATABASE_URL}}` syntax will automatically use your Railway PostgreSQL connection string
- Replace `RESEND_API_KEY` with your actual Resend API key
- Replace `OPENAI_API_KEY` with your actual OpenAI API key

### 4. Configure Build Settings

Railway should automatically detect your project, but if needed:

1. **Root Directory:** `backend-mobile`
2. **Build Command:** `npm install && npx prisma generate && npm run build`
3. **Start Command:** `npx prisma migrate deploy && npm start`

These are configured in the `railway.toml` and `nixpacks.toml` files already created.

### 5. Deploy

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

2. **Railway will automatically deploy:**
   - Railway watches your GitHub repository
   - When you push changes, it automatically triggers a new deployment
   - You can monitor the deployment in the Railway dashboard

3. **Check deployment logs:**
   - In Railway dashboard, click on your service
   - Go to the **"Deployments"** tab
   - Click on the latest deployment to view logs

### 6. Verify Deployment

Once deployed, Railway will provide you with a public URL (e.g., `https://your-service.railway.app`).

Test your deployment:

1. **Health check:**
   ```bash
   curl https://your-service.railway.app/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-23T...",
     "service": "Spoodle Mobile API",
     "version": "1.0.0",
     "environment": "production"
   }
   ```

2. **API endpoints:**
   ```bash
   curl https://your-service.railway.app/api
   ```

### 7. Update Mobile App Configuration

Update your mobile app's API endpoint to use the Railway URL:

In `frontend/mobile/app/lib/api.ts` (or wherever your API base URL is configured):

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-service.railway.app';
```

Add to your `.env` file in the mobile app:
```bash
EXPO_PUBLIC_API_URL=https://your-service.railway.app
```

### 8. Configure CORS for Production

After deployment, update the CORS configuration in Railway environment variables:

```bash
FRONTEND_URL=https://your-actual-frontend-domain.com
MOBILE_URL=https://your-mobile-app-domain.com
```

Also, you may need to update the CORS origins in `backend-mobile/src/index.ts` to include your production URLs.

## Alternative: Deploy Using Railway CLI

If you prefer using the Railway CLI:

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Link to your project:**
   ```bash
   cd backend-mobile
   railway link
   ```

4. **Set environment variables:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-secret-here
   # ... add all other variables
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Verify `MOBILE_DATABASE_URL` is set correctly in Railway variables
2. Check that PostgreSQL service is running
3. Ensure Prisma migrations ran successfully:
   ```bash
   # Check deployment logs for "prisma migrate deploy" output
   ```

### Build Failures

If build fails:

1. Check that Node.js version is 22+ (configured in `nixpacks.toml`)
2. Verify all dependencies are in `package.json`
3. Check build logs in Railway dashboard

### Application Crashes

If the application crashes on startup:

1. Check deployment logs for error messages
2. Verify all required environment variables are set
3. Ensure database migrations completed successfully
4. Check that `PORT` is set (Railway assigns this automatically)

### Prisma Issues

If Prisma fails to generate or migrate:

1. Ensure `prisma` is in `devDependencies` and `@prisma/client` is in `dependencies`
2. Verify `prisma/schema.prisma` is committed to git
3. Check that migrations folder is committed to git

## Monitoring and Maintenance

### View Logs
```bash
# Using Railway CLI
railway logs

# Or in Railway dashboard: Service → Deployments → View Logs
```

### Restart Service
```bash
# Using Railway CLI
railway restart

# Or in Railway dashboard: Service → Settings → Restart
```

### Run Migrations Manually
```bash
# Using Railway CLI
railway run npx prisma migrate deploy
```

### Access Database
```bash
# Using Railway CLI
railway connect postgres
```

## Production Checklist

Before going live:

- [ ] All environment variables are set with production values
- [ ] JWT secrets are strong and secure (not development values)
- [ ] Database backups are configured in Railway
- [ ] CORS origins are properly configured for production domains
- [ ] API keys (OpenAI, Resend) are production keys with proper limits
- [ ] Mobile app is pointing to production API URL
- [ ] SSL/HTTPS is enabled (Railway provides this automatically)
- [ ] Error logging/monitoring is set up
- [ ] Rate limiting is properly configured
- [ ] File upload limits are appropriate for production

## Cost Considerations

Railway pricing:
- **Starter Plan:** $5/month for the first project (includes $5 credits)
- **Pay-as-you-go:** ~$0.000231/GB-hour for usage beyond credits
- PostgreSQL database is included but counts toward usage

To optimize costs:
- Monitor your usage in Railway dashboard
- Set up usage alerts
- Consider using Railway's sleep mode for non-production environments

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Prisma with Railway](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)

## Support

If you encounter issues:
1. Check Railway status page: https://status.railway.app/
2. Railway Discord community: https://discord.gg/railway
3. Railway documentation: https://docs.railway.app/

---

**Need help?** The deployment logs in Railway dashboard are your best friend for troubleshooting! 🚀

