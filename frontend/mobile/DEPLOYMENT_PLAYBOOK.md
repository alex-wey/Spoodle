# 📱 Spoodle Mobile - Deployment Playbook

**From Development to TestFlight & Google Play Store**

Last Updated: November 23, 2025

---

## Key Principles

1. **Builds are manual** - Pushing to GitHub does NOT trigger builds
2. **Always work from** `/Users/alexwey/Desktop/WORK/Spoodle/frontend/mobile`
3. **Build time**: ~10-20 minutes per build

---

## Prerequisites (One-Time Setup)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login
```

**Credentials needed:**
- Apple ID: `abcsoccerski@gmail.com`
- App-specific password from appleid.apple.com

---

## Configuration

**Local `.env` file** (for development):
```bash
EXPO_PUBLIC_API_URL=http://localhost:3002
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_test_key_here
```

**Production** (in `eas.json`):
- API: `https://main-production-ede9.up.railway.app`
- Clerk Key: `pk_live_Y2xlcmsuc3Bvb2RsZS5jbyQ`
- Clerk Domain: `clerk.spoodle.co`

**Important:** Do NOT include `buildNumber` in `app.json` - EAS manages it automatically.

---

## Development Workflow

```bash
# Navigate to project
cd /Users/alexwey/Desktop/WORK/Spoodle/frontend/mobile

# Start dev server
npm start

# Run on simulator
npm run ios

# Make changes, test, commit
git add .
git commit -m "Your changes"
git push origin main
```

---

## Building for Production

### Step 1: Check Current Build Number

```bash
cd /Users/alexwey/Desktop/WORK/Spoodle/frontend/mobile

# Check what's in Apple's system
# Go to https://appstoreconnect.apple.com → TestFlight → iOS Builds
# Note the highest build number (e.g., 4)
```

### Step 2: Update Version in app.json (If Needed)

If you're getting build number conflicts, manually set it in `app.json`:

```json
{
  "expo": {
    "version": "1.0.0",  // Update for major releases
    "ios": {
      // Do NOT add buildNumber here when using remote versioning
    }
  }
}
```

Or set in `eas.json` production profile:

```json
{
  "build": {
    "production": {
      "ios": {
        "buildNumber": "5"  // Set to one higher than Apple's highest
      }
    }
  }
}
```

### Step 3: Build

```bash
eas build --platform ios --profile production
```

**Prompts during build:**
- iOS app only uses standard/exempt encryption? → `Y`
- Set up credentials automatically? → `Y`
- Generate new Apple Provisioning Profile? → `Y`

**Wait ~10-20 minutes** ☕️

### Step 4: Verify Build

```bash
eas build:list --platform ios --limit 3
```

---

## Submitting to TestFlight

```bash
eas submit --platform ios --latest
```

**Credentials:**
- Apple ID: `abcsoccerski@gmail.com`
- App-specific password: Generate at https://appleid.apple.com → App-Specific Passwords

**Wait ~2-5 minutes**

Verify at: https://appstoreconnect.apple.com → TestFlight → iOS Builds

---

## Testing on iPhone

1. **Install TestFlight** from App Store on iPhone
2. **Add yourself as tester** in App Store Connect → TestFlight → Internal Testing
3. **Accept invite** via email on iPhone
4. **Install app** from TestFlight app
5. **Test** all features

---

## 🤖 Android / Google Play Store Deployment

### Prerequisites (One-Time Setup)

#### 1. Google Play Console Account

1. Go to https://play.google.com/console
2. Pay one-time $25 registration fee
3. Create app listing for "Spoodle"
   - App name: `Spoodle inc`
   - Package name: `com.spoodleapp.spoodleapp`

#### 2. Create Service Account (Required for EAS Submit)

**Step 2a: Google Cloud Console**

1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable **Google Play Android Developer API**:
   - Search for "Google Play Android Developer API"
   - Click "Enable"
4. Create Service Account:
   - Go to IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Name: `expo-eas-submit`
   - Click "Create and Continue"
   - Skip role assignment (done in Play Console)
   - Click "Done"
5. Generate JSON Key:
   - Click on the service account
   - Keys → Add Key → Create new key
   - Choose JSON format
   - Save as `google-service-account.json` in `/Users/alexwey/Desktop/WORK/Spoodle/frontend/mobile/`
   - **⚠️ Keep this file secure and add to .gitignore!**

**Step 2b: Google Play Console**

1. Go to https://play.google.com/console
2. Navigate to Setup → API access
3. Link your Cloud project (if not already linked)
4. Under Service accounts, find your `expo-eas-submit` account
5. Click "Grant access"
6. Assign permissions:
   - ✅ Admin (View app information and download bulk reports)
   - ✅ Release manager (Release apps to testing tracks)
   - ✅ Release to production
7. Click "Invite user"

#### 3. Update eas.json

Add Android submit configuration to your `eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "6739995059"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

**Tracks:**
- `internal` - Internal testing (up to 100 testers)
- `alpha` - Closed testing
- `beta` - Open testing
- `production` - Public release

#### 4. Update .gitignore

```bash
# Add to .gitignore
google-service-account.json
```

---

### Building for Android

#### Step 1: Build the APK/AAB

```bash
cd /Users/alexwey/Desktop/WORK/Spoodle/frontend/mobile

# Build for Android (creates AAB - Android App Bundle)
eas build --platform android --profile production
```

**Prompts during first build:**
- Generate a new Android Keystore? → `Y`
- EAS will manage your signing credentials automatically

**Wait ~10-20 minutes** ☕️

#### Step 2: Verify Build

```bash
eas build:list --platform android --limit 3
```

---

### Submitting to Google Play

#### First Submission (Manual Upload Required)

For the very first submission, Google Play requires manual upload:

1. Download the AAB file from EAS:
   ```bash
   eas build:list --platform android --limit 1
   # Copy the download URL and download the .aab file
   ```

2. Go to Google Play Console → Release → Testing → Internal testing
3. Create a new release
4. Upload the AAB file manually
5. Complete the store listing (if not done):
   - App description
   - Screenshots (phone and tablet)
   - Feature graphic (1024x500)
   - App icon
   - Privacy policy URL

#### Subsequent Submissions (EAS Submit)

After the first manual upload, use EAS:

```bash
cd /Users/alexwey/Desktop/WORK/Spoodle/frontend/mobile

# Submit latest Android build
eas submit --platform android --latest
```

This will:
- Upload to the track specified in `eas.json` (e.g., `internal`)
- Automatically handle signing with your service account

---

### Testing on Android Devices

#### Internal Testing Track

1. **Add testers** in Google Play Console:
   - Release → Testing → Internal testing
   - Click "Testers" tab
   - Add email addresses (or create email list)
   - Save changes

2. **Get the testing link**:
   - Copy the "Copy link" URL from Internal testing page

3. **Install on device**:
   - Send link to testers
   - Open link on Android device
   - Accept invitation
   - Install from Google Play Store
   - App updates will show up in Play Store

#### Alternative: Build APK for Direct Install

For quick testing without Play Store:

```bash
# Build APK (not AAB)
eas build --platform android --profile production --local

# Or add preview profile to eas.json:
# "preview": {
#   "android": {
#     "buildType": "apk"
#   }
# }
```

Then install APK directly via USB or file sharing.

---

### Version Management

#### Android Version Codes

Your `app.json` manages Android versions:

```json
{
  "version": "2.0.6",  // User-facing version
  "android": {
    "versionCode": 1   // Increments with each build
  }
}
```

**Rules:**
- `version` - User-facing (e.g., "2.0.6")
- `versionCode` - Integer that MUST increase with each submission
- EAS auto-increments `versionCode` when `"autoIncrement": true` in eas.json

#### Updating Versions

```bash
# Update user-facing version in app.json
# "version": "2.0.7"

# versionCode auto-increments via EAS
eas build --platform android --profile production
```

---

### Multi-Platform Deployment

Build and submit to both stores at once:

```bash
cd /Users/alexwey/Desktop/WORK/Spoodle/frontend/mobile

# Build both platforms
eas build --platform all --profile production

# Wait for both builds to complete (~20-40 minutes)

# Submit to both stores
eas submit --platform all --latest
```

---

### Android-Specific Configurations

Your current `app.json` already has:

```json
{
  "android": {
    "package": "com.spoodleapp.spoodleapp",
    "versionCode": 1,
    "adaptiveIcon": {
      "foregroundImage": "./assets/images/icon.png",
      "backgroundColor": "#ffffff"
    },
    "permissions": [
      "android.permission.CAMERA",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.RECORD_AUDIO"
    ]
  }
}
```

✅ Permissions are properly configured for camera and storage access.

---

## Troubleshooting

### Build Number Conflict Error

**Error:** `The bundle version must be higher than the previously uploaded version: '3'`

**Fix:**
1. Check App Store Connect → TestFlight → iOS Builds for highest build number
2. Add to `eas.json` production profile:
```json
"production": {
  "ios": {
    "buildNumber": "5"  // One higher than Apple's highest
  }
}
```
3. Rebuild: `eas build --platform ios --profile production`

### Wrong Directory Error

**Error:** `eas.json could not be found`

**Fix:** You're in wrong directory!
```bash
cd /Users/alexwey/Desktop/WORK/Spoodle/frontend/mobile
```

### Build Failed

Check logs: `eas build:view [build-id]`

### Android: Service Account Permission Error

**Error:** `The caller does not have permission` or `403 Forbidden`

**Fix:**
1. Verify service account has correct permissions in Play Console
2. Required roles: "Release manager" or "Admin"
3. Ensure Google Play Android Developer API is enabled in Cloud Console
4. Wait 5-10 minutes after granting permissions for changes to propagate

### Android: Version Code Conflict

**Error:** `Version code 1 has already been used`

**Fix:**
1. Check Play Console → Release → Production/Testing for latest version code
2. Update `app.json`:
```json
"android": {
  "versionCode": 2  // One higher than latest in Play Store
}
```
3. Or ensure `"autoIncrement": true` in `eas.json`

### Android: Service Account JSON Not Found

**Error:** `google-service-account.json not found`

**Fix:**
1. Ensure file exists in `/Users/alexwey/Desktop/WORK/Spoodle/frontend/mobile/`
2. Verify path in `eas.json`: `"serviceAccountKeyPath": "./google-service-account.json"`
3. Confirm file is valid JSON (download again from Google Cloud Console if needed)

---

## Important Notes

### iOS
- **No `ios/` folder needed** - EAS handles native code remotely
- **Build numbers** auto-increment via `"appVersionSource": "remote"`
- **Don't set `buildNumber` in `app.json`** unless fixing conflicts
- **Update `version` in `app.json`** only for major releases (1.0.0 → 1.1.0)

### Android
- **No `android/` folder needed** - EAS handles native code remotely
- **Version codes** auto-increment with `"autoIncrement": true` in eas.json
- **Service account JSON** must be kept secure and in .gitignore
- **First submission** must be manual upload in Play Console
- **Package name** cannot be changed after first upload: `com.spoodleapp.spoodleapp`

---

## Quick Commands

```bash
# Navigate
cd /Users/alexwey/Desktop/WORK/Spoodle/frontend/mobile

# iOS Build & Submit
eas build --platform ios --profile production
eas submit --platform ios --latest

# Android Build & Submit
eas build --platform android --profile production
eas submit --platform android --latest

# Both Platforms
eas build --platform all --profile production
eas submit --platform all --latest

# Check Status
eas build:list --platform ios --limit 3
eas build:list --platform android --limit 3
eas build:list --limit 5  # Both platforms
```

---

## Resources

### Dashboards
- **Expo Dashboard**: https://expo.dev/accounts/alexwey/projects/spoodle
- **App Store Connect (iOS)**: https://appstoreconnect.apple.com
- **Google Play Console (Android)**: https://play.google.com/console
- **Clerk Dashboard**: https://dashboard.clerk.com

### Documentation
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **Android Setup**: https://docs.expo.dev/build/setup/#android
- **iOS Setup**: https://docs.expo.dev/build/setup/#ios

---

## Project Info

- **Project ID**: `8c4d1aae-4c82-492f-a083-d1a400f287b2`
- **Bundle ID**: `com.spoodle.mobile`
- **Apple Team**: Spoodle Inc (WR43J9U8F5)

---

**Last Updated**: November 23, 2025

