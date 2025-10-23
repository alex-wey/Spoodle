# App Store Deployment Setup Guide

## 📱 Preparing Spoodle for App Store Release

This guide walks you through setting up EAS (Expo Application Services) and preparing your app for iOS App Store and Google Play Store submission.

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Apple Developer Account** ($99/year) - Required for iOS
  - Sign up at: https://developer.apple.com/programs/
- [ ] **Google Play Developer Account** ($25 one-time) - Required for Android
  - Sign up at: https://play.google.com/console/signup
- [ ] **Expo Account** (Free)
  - Sign up at: https://expo.dev/signup
- [ ] **Railway Backend** ✅ Already deployed!
- [ ] **Production API working** ✅ Already configured!

---

## 🚀 Step-by-Step EAS Setup

### Step 1: Install EAS CLI

```bash
npm install -g @expo/eas-cli
```

Verify installation:
```bash
eas --version
```

### Step 2: Login to Expo

```bash
eas login
```

Enter your Expo account credentials (or create an account if you don't have one).

### Step 3: Initialize EAS in Your Project

```bash
cd frontend/mobile
eas build:configure
```

This will:
- Create `eas.json` configuration file
- Set up build profiles
- Link your project to Expo

### Step 4: Configure Your App Details

Update `app.json` with production details:

```json
{
  "expo": {
    "name": "Spoodle",
    "slug": "spoodle",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "spoodle",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.spoodle",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.spoodle",
      "versionCode": 1
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID_HERE"
      }
    }
  }
}
```

**Important:** Replace `com.yourcompany.spoodle` with your actual bundle identifier!

---

## 📝 EAS Configuration (eas.json)

After running `eas build:configure`, you'll get an `eas.json` file. Here's a recommended configuration:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://main-production-ede9.up.railway.app/api",
        "EXPO_PUBLIC_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://main-production-ede9.up.railway.app/api",
        "EXPO_PUBLIC_ENV": "production"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://main-production-ede9.up.railway.app/api",
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🏗️ Building Your App

### For iOS (App Store)

**First build (creates credentials):**
```bash
eas build --platform ios --profile production
```

EAS will:
1. Ask if you want it to manage credentials (say **yes**)
2. Generate signing certificates
3. Create provisioning profiles
4. Build your app in the cloud
5. Provide download link when done

**Subsequent builds:**
```bash
eas build --platform ios
```

### For Android (Google Play)

**First build:**
```bash
eas build --platform android --profile production
```

EAS will:
1. Generate keystore (say **yes** to auto-generate)
2. Build your `.aab` file
3. Provide download link

**Subsequent builds:**
```bash
eas build --platform android
```

### Build Both Platforms at Once

```bash
eas build --platform all --profile production
```

---

## 📦 Build Profiles Explained

### **Development**
- For internal testing
- Includes development tools
- Faster builds
- Not for App Store

### **Preview**
- For beta testing
- Production-like but internal distribution
- Good for TestFlight/internal testing

### **Production**
- Final App Store/Play Store builds
- Optimized and minified
- Ready for public release

---

## 🧪 Testing Builds

### iOS Testing (TestFlight)

1. **Build for iOS:**
   ```bash
   eas build --platform ios --profile preview
   ```

2. **Submit to TestFlight:**
   ```bash
   eas submit --platform ios --latest
   ```

3. **Invite testers** via App Store Connect

### Android Testing (Internal Testing)

1. **Build for Android:**
   ```bash
   eas build --platform android --profile preview
   ```

2. **Submit to Google Play Internal Testing:**
   ```bash
   eas submit --platform android --latest
   ```

3. **Invite testers** via Google Play Console

---

## 📱 Updating app.json for Production

Key things to configure before building:

### 1. Bundle Identifiers
```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.spoodle"
  },
  "android": {
    "package": "com.yourcompany.spoodle"
  }
}
```

**Important:** Choose carefully - can't change after first submission!

### 2. Version Numbers
```json
{
  "version": "1.0.0",
  "ios": {
    "buildNumber": "1"
  },
  "android": {
    "versionCode": 1
  }
}
```

Increment these with each release!

### 3. App Name and Description
```json
{
  "name": "Spoodle",
  "slug": "spoodle",
  "description": "Your comprehensive pet healthcare management app"
}
```

### 4. Privacy Policy (Required!)
```json
{
  "privacy": "public",
  "privacyPolicy": "https://yourwebsite.com/privacy"
}
```

### 5. Permissions
```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "Spoodle needs camera access to take photos of your pets and documents",
      "NSPhotoLibraryUsageDescription": "Spoodle needs photo library access to select pet photos and documents"
    }
  },
  "android": {
    "permissions": [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE"
    ]
  }
}
```

---

## 🎨 Required Assets

Make sure you have these in proper sizes:

### App Icon
- **Location:** `assets/images/icon.png`
- **Size:** 1024x1024px
- **Format:** PNG with transparency

### Splash Screen
- **Location:** `assets/images/splash.png`
- **Size:** 1284x2778px (will be resized)
- **Format:** PNG

### Adaptive Icon (Android)
- **Location:** `assets/images/adaptive-icon.png`
- **Size:** 1024x1024px
- **Format:** PNG with transparency

---

## 💰 Cost Breakdown

### One-Time Costs
- **Google Play Developer:** $25 (one-time)
- **App Icon/Graphics:** $0-500 (if hiring designer)

### Annual Costs
- **Apple Developer:** $99/year
- **EAS Build:** Free tier available, or:
  - Production plan: $99/month (unlimited builds)
  - Enterprise: Custom pricing

### Free Tier Limits (EAS)
- iOS: 30 builds/month
- Android: 30 builds/month
- Usually sufficient for indie developers!

---

## 📋 Pre-Submission Checklist

### Technical
- [ ] App builds successfully on EAS
- [ ] All features tested on real devices
- [ ] API endpoints working (Railway backend)
- [ ] Authentication working
- [ ] Push notifications configured (if applicable)
- [ ] Deep linking working (if applicable)
- [ ] No crashes or critical bugs

### Legal/Content
- [ ] Privacy Policy published and linked
- [ ] Terms of Service (if applicable)
- [ ] App Store/Play Store screenshots (required!)
- [ ] App description written
- [ ] Keywords/categories chosen
- [ ] Age rating determined

### Assets
- [ ] App icon (1024x1024)
- [ ] Splash screen
- [ ] Screenshots for all required device sizes:
  - iOS: iPhone, iPad
  - Android: Phone, Tablet (optional)

### App Store Connect (iOS)
- [ ] Apple Developer account active
- [ ] App created in App Store Connect
- [ ] Bundle ID matches app.json
- [ ] App information filled out
- [ ] Screenshots uploaded

### Google Play Console (Android)
- [ ] Google Play Developer account active
- [ ] App created in Play Console
- [ ] Package name matches app.json
- [ ] Store listing complete
- [ ] Content rating questionnaire completed

---

## 🚀 Deployment Commands Quick Reference

```bash
# Build for production (both platforms)
eas build --platform all --profile production

# Build iOS only
eas build --platform ios --profile production

# Build Android only
eas build --platform android --profile production

# Submit to App Store (after build)
eas submit --platform ios --latest

# Submit to Google Play (after build)
eas submit --platform android --latest

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]
```

---

## 🐛 Common Issues & Solutions

### "Bundle identifier is already in use"
- Solution: Choose a different bundle identifier in app.json

### "Build failed: Missing credentials"
- Solution: Run `eas credentials` to manage credentials

### "App rejected: Missing privacy policy"
- Solution: Create and publish privacy policy, add URL to app.json

### "Build takes too long"
- Normal: First builds can take 15-30 minutes
- Subsequent builds: Usually 10-15 minutes

---

## 📞 Getting Help

### Expo Documentation
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- App Store: https://docs.expo.dev/submit/ios/
- Google Play: https://docs.expo.dev/submit/android/

### Support
- Expo Forums: https://forums.expo.dev/
- Expo Discord: https://chat.expo.dev/

---

## 🎯 Next Steps

1. **Install EAS CLI** (if not already done)
2. **Configure EAS** (`eas build:configure`)
3. **Update app.json** with production details
4. **Create app icons** (1024x1024)
5. **Test build** with preview profile first
6. **Create production build**
7. **Submit to stores**

---

## ⚡ Quick Start Commands

```bash
# From frontend/mobile directory:

# 1. Install EAS CLI
npm install -g @expo/eas-cli

# 2. Login
eas login

# 3. Initialize
eas build:configure

# 4. First preview build (recommended for testing)
eas build --platform ios --profile preview
eas build --platform android --profile preview

# 5. Production build (when ready)
eas build --platform all --profile production

# 6. Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest
```

---

**Your backend is ready, now let's get your app in the stores!** 🚀

