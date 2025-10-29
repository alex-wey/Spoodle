# Railway S3 Setup Guide

## Step-by-Step Instructions to Configure S3 Uploads on Railway

### 1. Navigate to Your Railway Project
- Go to [Railway Dashboard](https://railway.app)
- Select your **Spoodle** project
- Click on your **backend-mobile** service

### 2. Open Environment Variables
- Click on the **Variables** tab in your service dashboard
- You'll see a list of existing environment variables

### 3. Add/Update Required S3 Environment Variables

Add or update these **5 environment variables**:

#### Variable 1: `USE_S3`
- **Value**: `true`
- **Description**: Enables S3 storage instead of local file storage

#### Variable 2: `AWS_REGION`
- **Value**: `us-east-2` (or your AWS S3 bucket region)
- **Description**: AWS region where your S3 bucket is located
- **Common regions**: `us-east-1`, `us-east-2`, `us-west-1`, `us-west-2`, `eu-west-1`, etc.

#### Variable 3: `AWS_ACCESS_KEY_ID`
- **Value**: Your AWS Access Key ID (from AWS IAM)
- **Description**: AWS access key for S3 authentication
- **Example**: `AKIAIOSFODNN7EXAMPLE`
- **How to get**: AWS Console → IAM → Users → Your User → Security Credentials → Access Keys

#### Variable 4: `AWS_SECRET_ACCESS_KEY`
- **Value**: Your AWS Secret Access Key (from AWS IAM)
- **Description**: AWS secret key for S3 authentication
- **Example**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
- **Important**: Keep this secret! Never commit it to git.

#### Variable 5: `S3_BUCKET_NAME`
- **Value**: `spoodle-medical-records` (or your bucket name)
- **Description**: Name of your S3 bucket where documents will be stored
- **Note**: Make sure this bucket exists in your AWS account

### 4. Verify Your Environment Variables

Your Railway Variables tab should have these S3-related variables:
```
USE_S3=true
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET_NAME=spoodle-medical-records
```

### 5. Redeploy Your Service

After adding the variables:
- Railway will automatically detect the new environment variables
- Your service will automatically redeploy
- Or manually trigger a redeploy by clicking **"Redeploy"** button

### 6. Verify S3 is Working

After deployment, check the logs:
- Go to the **Deployments** tab
- Click on the latest deployment
- Check the logs for: `✅ S3 configured: spoodle-medical-records`

If you see this message, S3 is configured correctly!

---

## Troubleshooting

### Issue: "S3 configured" message doesn't appear
**Solution**: Check that:
- `USE_S3=true` (not `"true"` or `True`)
- All AWS credentials are correct
- The S3 bucket name matches exactly

### Issue: Uploads fail with "Access Denied"
**Solution**: Check your AWS IAM permissions:
- The IAM user needs `s3:PutObject` permission
- The IAM user needs `s3:GetObject` permission
- The IAM user needs `s3:DeleteObject` permission (for deletions)

### Issue: "Bucket not found" error
**Solution**: 
- Verify `S3_BUCKET_NAME` matches your bucket name exactly
- Verify `AWS_REGION` matches the bucket's region
- Ensure the bucket exists in your AWS account

### Issue: Environment variables not saving
**Solution**:
- Make sure you're in the correct service (backend-mobile)
- Check that you're clicking "Save" or the variables auto-save
- Refresh the page and verify they're still there

---

## AWS IAM Permissions Required

Your AWS IAM user needs this policy (or at minimum these permissions):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::spoodle-medical-records/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::spoodle-medical-records"
    }
  ]
}
```

---

## Quick Checklist

- [ ] Opened Railway dashboard
- [ ] Selected backend-mobile service
- [ ] Opened Variables tab
- [ ] Added `USE_S3=true`
- [ ] Added `AWS_REGION=us-east-2` (or your region)
- [ ] Added `AWS_ACCESS_KEY_ID` (your access key)
- [ ] Added `AWS_SECRET_ACCESS_KEY` (your secret key)
- [ ] Added `S3_BUCKET_NAME=spoodle-medical-records`
- [ ] Verified all variables are saved
- [ ] Service redeployed automatically
- [ ] Checked logs for "✅ S3 configured" message

---

## Need Help?

If you encounter issues:
1. Check Railway deployment logs for error messages
2. Verify AWS credentials in AWS Console
3. Test S3 bucket access with AWS CLI or console
4. Ensure IAM user has correct permissions
