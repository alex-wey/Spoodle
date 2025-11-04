# 📱 Spoodle Mobile - Deployment Playbook

**From Development to TestFlight**

Last Updated: October 31, 2025

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

---

## Important Notes

- **No `ios/` folder needed** - EAS handles native code remotely
- **Build numbers** auto-increment via `"appVersionSource": "remote"`
- **Don't set `buildNumber` in `app.json`** unless fixing conflicts
- **Update `version` in `app.json`** only for major releases (1.0.0 → 1.1.0)

---

## Quick Commands

```bash
# Navigate
cd /Users/alexwey/Desktop/WORK/Spoodle/frontend/mobile

# Build & Submit
eas build --platform ios --profile production
eas submit --platform ios --latest

# Check status
eas build:list --platform ios --limit 3
```

---

## Resources

- **Expo Dashboard**: https://expo.dev/accounts/alexwey/projects/spoodle
- **App Store Connect**: https://appstoreconnect.apple.com
- **Clerk Dashboard**: https://dashboard.clerk.com

---

## Project Info

- **Project ID**: `8c4d1aae-4c82-492f-a083-d1a400f287b2`
- **Bundle ID**: `com.spoodle.mobile`
- **Apple Team**: Spoodle Inc (WR43J9U8F5)

---

**Last Updated**: October 31, 2025

