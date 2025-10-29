# Complete AWS S3 Setup Guide for Spoodle

## Step 1: Create AWS Account (if you don't have one)

1. Go to https://aws.amazon.com
2. Click **Create an AWS Account**
3. Follow the signup process (requires credit card, but S3 free tier is generous)
4. Complete email verification

## Step 2: Create S3 Bucket

### 2.1 Navigate to S3
1. Sign in to AWS Console: https://console.aws.amazon.com
2. In the search bar at the top, type "S3" and click on **S3** service
3. You should see the S3 dashboard

### 2.2 Create the Bucket
1. Click the **Create bucket** button (orange button, top right)
2. **Bucket name**: Enter `spoodle-documents` (must be globally unique)
   - If taken, try: `spoodle-documents-[your-name]` or `spoodle-[your-name]-docs`
3. **AWS Region**: Select `us-east-2` (Ohio) or your preferred region
4. **Object Ownership**: Select **ACLs disabled** (recommended)
5. **Block Public Access settings**: Keep ALL boxes checked (default - safest)
6. **Bucket Versioning**: **Disable** (for now)
7. **Tags**: Skip (optional)
8. **Default encryption**: Select **Enable**
   - Select **Amazon S3 managed keys (SSE-S3)**
9. **Bucket Key**: **Enable**
10. Click **Create bucket** at the bottom

### 2.3 Verify Bucket Creation
- You should see your bucket in the S3 dashboard
- Click on the bucket name to see its contents (will be empty initially)

## Step 3: Create IAM User for Programmatic Access

### 3.1 Navigate to IAM
1. In AWS Console search bar, type "IAM" and click on it
2. You're now in the Identity and Access Management console

### 3.2 Create User
1. Click **Users** in the left sidebar
2. Click **Create user** button
3. **User name**: Enter `spoodle-s3-user`
4. Select **Provide user access to the AWS Management Console** - **NO** (unchecked)
5. Select **Access key - Programmatic access** - **YES** (checked)
6. Click **Next**

### 3.3 Set Permissions
1. Under **Set permissions**, select **Attach policies directly**
2. In the search box, type: `S3`
3. Find and check **AmazonS3FullAccess**
4. Click **Next**

### 3.4 Review and Create
1. Review the settings
2. Click **Create user**

### 3.5 IMPORTANT: Save Credentials
You'll see a page with:
- **Access key ID**: e.g., `AKIAIOSFODNN7EXAMPLE`
- **Secret access key**: e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

⚠️ **CRITICAL**: Click **Download .csv** and save it somewhere safe!
- You can only see the secret key ONCE
- If you lose it, you'll need to create a new user

Alternatively, copy both values:
1. Copy the **Access key ID**
2. Click **Show** next to Secret access key
3. Copy the **Secret access key**

## Step 4: Configure Your Backend

### 4.1 Open Your `.env` File
Navigate to: `Spoodle/backend-mobile/.env`

If the file doesn't exist:
```bash
cd Spoodle/backend-mobile
cp env.example .env
```

### 4.2 Add S3 Configuration
Open the `.env` file and add these lines at the bottom:

```env
# AWS S3 Configuration
USE_S3=true
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=PASTE_YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=PASTE_YOUR_SECRET_KEY_HERE
S3_BUCKET_NAME=spoodle-documents
```

Replace:
- `PASTE_YOUR_ACCESS_KEY_HERE` → Your Access key ID from Step 3.5
- `PASTE_YOUR_SECRET_KEY_HERE` → Your Secret access key from Step 3.5
- `spoodle-documents` → Your actual bucket name from Step 2.2
- `us-east-2` → Your bucket's region from Step 2.2

### 4.3 Example `.env` File
```env
PORT=3002
NODE_ENV=development
DATABASE_URL="postgresql://postgres:dogaspetiscute123@spoodle-database.cdae4aoagblz.us-east-2.rds.amazonaws.com:5432/spoodle-database?schema=public"
CLERK_SECRET_KEY=sk_test_vgmVghUesSDCpXwJKMQK5wdMMbVbbEuTe72jJkOx0I
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_aW50ZXJuYWwtaGVycmluZy00MS5jbGVyay5hY2NvdW50cy5kZXYk

# AWS S3 Configuration
USE_S3=true
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_NAME=spoodle-documents
```

## Step 5: Test the Setup

### 5.1 Restart Backend
```bash
cd Spoodle/backend-mobile
npm run dev
```

### 5.2 Look for Success Message
You should see:
```
✅ S3 configured: spoodle-documents
```

Instead of:
```
📁 Using local file storage
```

### 5.3 Test Document Upload
1. Open your app at http://localhost:8081
2. Navigate to a pet
3. Try uploading a document
4. Check the backend logs for S3 upload confirmation

## Troubleshooting

### Error: "Access Denied"
**Solution**: 
- Double-check your Access Key ID and Secret Key in `.env`
- Verify the IAM user has S3 permissions
- Make sure there are no extra spaces in your `.env` file

### Error: "Bucket does not exist"
**Solution**:
- Verify bucket name is correct in `.env`
- Check AWS region matches your bucket's region
- Go to S3 console and confirm bucket exists

### Error: "Invalid credentials"
**Solution**:
- Re-copy the credentials from IAM
- Make sure you copied the full Secret Access Key
- Create new IAM user if credentials were lost

### Still Using Local Storage
**Solution**:
- Verify `USE_S3=true` in `.env`
- Make sure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set
- Restart the backend after changing `.env`

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Never commit credentials to Git
- [ ] IAM user has only S3 permissions (not admin)
- [ ] S3 bucket has Block Public Access enabled
- [ ] Bucket encryption is enabled

## Cost Considerations

**AWS S3 Free Tier** (first 12 months):
- 5 GB storage
- 20,000 GET requests
- 2,000 PUT requests

**Estimated monthly cost** (after free tier):
- Storage: $0.023 per GB (very cheap)
- Requests: Minimal cost (thousands of requests = pennies)

## Next Steps

Once S3 is working:
1. Document uploads will go directly to S3
2. Database stores the S3 URL (not local file path)
3. Files are automatically encrypted
4. Much more scalable than local storage

## Need Help?

If you get stuck:
1. Check the backend logs for detailed error messages
2. Verify each step was completed correctly
3. Ensure your AWS account billing is set up
4. Try the test upload to see specific error messages

