# Railway Deployment Checklist ✓

Use this checklist to ensure a smooth deployment to Railway.

## Pre-Deployment Checklist

### Repository Setup
- [ ] All code is committed to GitHub
- [ ] No sensitive data in repository (check for `.env` files)
- [ ] `backend-mobile/prisma/` folder is committed
- [ ] `backend-mobile/prisma/migrations/` folder is committed
- [ ] `package.json` has all required dependencies
- [ ] `.gitignore` excludes `node_modules/`, `.env`, and `dist/`

### Configuration Files
- [ ] `backend-mobile/railway.toml` exists
- [ ] `backend-mobile/nixpacks.toml` exists
- [ ] `backend-mobile/.railwayignore` exists
- [ ] `backend-mobile/Procfile` exists

### API Keys & Secrets
- [ ] Have Resend API key ready
- [ ] Have OpenAI API key ready
- [ ] Generated secure JWT secrets (using `generate-secrets.js`)
- [ ] Secrets are NOT in repository

## Railway Setup Checklist

### Create Railway Project
- [ ] Logged into Railway account
- [ ] Created new project or using existing project
- [ ] Project name is set (e.g., "Spoodle")

### Add PostgreSQL Database
- [ ] Clicked "+ New" → "Database" → "Add PostgreSQL"
- [ ] PostgreSQL service is running (green indicator)
- [ ] Copied `DATABASE_URL` from Variables tab (for reference)

### Connect GitHub Repository
- [ ] Clicked "+ New" → "GitHub Repo"
- [ ] Selected correct repository (`Spoodle`)
- [ ] Set root directory to: `backend-mobile`
- [ ] GitHub integration is connected

## Environment Variables Checklist

In Railway Dashboard → Your Service → "Variables" tab, set:

### Required Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=3002`
- [ ] `MOBILE_DATABASE_URL=${{Postgres.DATABASE_URL}}`
- [ ] `JWT_SECRET=<your-generated-secret>`
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `REFRESH_TOKEN_SECRET=<your-generated-secret>`
- [ ] `REFRESH_TOKEN_EXPIRES_IN=30d`

### Upload Configuration
- [ ] `UPLOAD_DIR=./uploads`
- [ ] `MAX_FILE_SIZE=10485760`
- [ ] `ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,doc,docx`

### CORS Configuration
- [ ] `FRONTEND_URL=*` (update after deployment)
- [ ] `MOBILE_URL=*` (update after deployment)

### Rate Limiting
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=100`

### API Keys
- [ ] `RESEND_API_KEY=<your-resend-key>`
- [ ] `OPENAI_API_KEY=<your-openai-key>`

### Verify
- [ ] All variables saved successfully
- [ ] No typos in variable names
- [ ] Secrets are strong and secure

## Deployment Checklist

### Push to GitHub
- [ ] Committed all deployment configuration files
- [ ] Pushed to main branch:
  ```bash
  git add .
  git commit -m "Add Railway deployment configuration"
  git push origin main
  ```

### Monitor Deployment
- [ ] Railway detected the push
- [ ] Build started automatically
- [ ] Build phase completed successfully
- [ ] Deploy phase started
- [ ] Application is running

### Check Build Logs
- [ ] `npm ci` completed
- [ ] `npx prisma generate` completed
- [ ] `npm run build` completed
- [ ] TypeScript compiled without errors

### Check Deploy Logs
- [ ] `npx prisma migrate deploy` completed
- [ ] Database migrations applied successfully
- [ ] Server started successfully
- [ ] Port binding successful
- [ ] No error messages

## Testing Checklist

### Get Railway URL
- [ ] Found deployment URL (e.g., `https://your-service.railway.app`)
- [ ] Copied URL for testing

### Test Endpoints
- [ ] Health check works:
  ```bash
  curl https://your-service.railway.app/health
  ```
  Expected: `{"status":"ok",...}`

- [ ] API info endpoint works:
  ```bash
  curl https://your-service.railway.app/api
  ```
  Expected: List of available endpoints

### Test Database Connection
- [ ] Health check shows database is connected
- [ ] No database connection errors in logs
- [ ] Can query database (if you have a test endpoint)

### Test Authentication (Optional)
- [ ] Can register new user
- [ ] Can login with user
- [ ] JWT token is returned
- [ ] Protected endpoints work with token

## Mobile App Update Checklist

### Update Environment Variables
- [ ] Created/updated `frontend/mobile/.env`
- [ ] Set `EXPO_PUBLIC_API_URL=https://your-service.railway.app`
- [ ] Saved file

### Test Mobile App
- [ ] Mobile app connects to Railway backend
- [ ] Can register/login
- [ ] Can fetch data
- [ ] Can upload files (if applicable)
- [ ] No CORS errors

## Production Configuration Checklist

### Security
- [ ] Updated CORS origins to specific domains (not `*`)
- [ ] JWT secrets are strong (32+ characters)
- [ ] API keys are production keys with proper limits
- [ ] SSL/HTTPS is working (Railway provides automatically)
- [ ] Rate limiting is enabled and configured

### Update CORS (After Testing)
In Railway Variables:
- [ ] `FRONTEND_URL=https://your-actual-frontend.com`
- [ ] `MOBILE_URL=https://your-mobile-app-domain.com`

Or update in code (`backend-mobile/src/index.ts`):
- [ ] Added production URLs to CORS origins array
- [ ] Removed localhost URLs from production CORS
- [ ] Committed and pushed changes

### Database
- [ ] Database backups configured in Railway
- [ ] Database backup frequency set (daily recommended)
- [ ] Tested database backup/restore (optional but recommended)

### Monitoring
- [ ] Railway usage alerts configured
- [ ] Error logging/monitoring set up (optional)
- [ ] Uptime monitoring set up (optional)

## Post-Deployment Checklist

### Documentation
- [ ] Updated README with production URL
- [ ] Documented deployment process for team
- [ ] Saved Railway credentials securely

### Access & Permissions
- [ ] Team members have Railway access (if applicable)
- [ ] GitHub repository access is configured
- [ ] API keys are documented securely

### Monitoring Setup
- [ ] Checked Railway usage dashboard
- [ ] Reviewed deployment logs for warnings
- [ ] Set up alerts for errors/downtime (optional)

### Performance
- [ ] Tested app performance under load (optional)
- [ ] Verified response times are acceptable
- [ ] No memory leaks or crashes

## Rollback Plan Checklist

### Know How to Rollback
- [ ] Know how to redeploy previous version:
  - Railway Dashboard → Deployments → Previous deployment → "Redeploy"
- [ ] Have backup of database (if needed)
- [ ] Can restore previous configuration quickly

### Emergency Contacts
- [ ] Railway status page bookmarked: https://status.railway.app/
- [ ] Railway support contact saved
- [ ] Team members know who to contact for issues

## Success Verification ✓

Your deployment is successful when:
- [✓] Build completes without errors
- [✓] Deploy completes without errors
- [✓] Health check returns 200 OK
- [✓] API endpoints respond correctly
- [✓] Mobile app connects successfully
- [✓] Authentication works
- [✓] Database queries work
- [✓] No errors in Railway logs

---

## 🎉 Congratulations!

If all items are checked, your Spoodle backend is successfully deployed to Railway!

### Useful Commands for Ongoing Maintenance

```bash
# View logs
railway logs

# Restart service
railway restart

# Run database migrations
railway run npx prisma migrate deploy

# Connect to database
railway connect postgres

# Check variables
railway variables
```

### Next Steps
1. Monitor your app for the first 24 hours
2. Set up error tracking (Sentry, LogRocket, etc.)
3. Configure staging environment (optional)
4. Set up CI/CD pipeline (optional - GitHub Actions file included)
5. Plan for scaling if needed

---

**Need help?** Check `RAILWAY_DEPLOYMENT.md` for detailed troubleshooting.

