# Add Your S3 Credentials to Backend

## Step 1: Add Credentials to `.env` File

**Open the file:** `Spoodle/backend-mobile/.env`

Add these lines at the end of your existing `.env` file:

```env
# AWS S3 Configuration
USE_S3=true
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=PASTE_YOUR_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=PASTE_YOUR_SECRET_ACCESS_KEY_HERE
S3_BUCKET_NAME=your-bucket-name
```

## Step 2: Replace with Your Actual Values

Replace:
- `PASTE_YOUR_ACCESS_KEY_ID_HERE` → Your **Access Key ID** from AWS IAM (looks like: `AKIAIOSFODNN7EXAMPLE`)
- `PASTE_YOUR_SECRET_ACCESS_KEY_HERE` → Your **Secret Access Key** from AWS IAM
- `spoodle-medical-records` → Your actual S3 bucket name 
- `us-east-2` → Your bucket's AWS region (if different)

## Step 3: Example of Complete `.env` File

```env
# Server Configuration
PORT=3002
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres:dogaspetiscute123@spoodle-database.cdae4aoagblz.us-east-2.rds.amazonaws.com:5432/spoodle-database?schema=public"

# Clerk Authentication Configuration
CLERK_SECRET_KEY=sk_test_vgmVghUesSDCpXwJKMQK5wdMMbVbbEuTe72jJkOx0I
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_aW50ZXJuYWwtaGVycmluZy00MS5jbGVyay5hY2NvdW50cy5kZXYk

# AWS S3 Configuration
USE_S3=true
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_NAME=spoodle-documents
```

## Step 4: Restart Backend

After saving the `.env` file, your backend should automatically restart (it's running with `tsx watch`).

**Look for this message:**
```
✅ S3 configured: spoodle-documents
```

Instead of:
```
📁 Using local file storage
```

## Step 5: Test!

1. Open your app at http://localhost:8081
2. Log in
3. Go to a pet
4. Try uploading a document
5. It should now upload to S3! 🎉

## Need Help?

If you see errors, check:
- [ ] Credentials are correct (no extra spaces)
- [ ] Bucket name matches exactly
- [ ] AWS region matches your bucket's region
- [ ] Backend restarted after adding credentials



