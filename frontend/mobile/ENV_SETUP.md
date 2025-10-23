# Environment Setup for Mobile App

## Quick Start

The mobile app now supports environment-based configuration for different API endpoints.

### Default Behavior

**By default (without .env file):**
- ✅ Uses **Railway production URL**: `https://main-production-ede9.up.railway.app/api`
- Works immediately without any setup!

### For Local Development

If you want to use a **local backend** during development:

1. **Create `.env` file** in `frontend/mobile/`:

```bash
# .env
EXPO_PUBLIC_API_URL=http://localhost:3002/api
EXPO_PUBLIC_ENV=development
```

2. **Restart your Expo dev server** (environment variables are loaded on startup)

### For Different Environments

Create environment-specific files:

#### `.env.development` (Local Backend)
```bash
EXPO_PUBLIC_API_URL=http://localhost:3002/api
EXPO_PUBLIC_ENV=development
```

#### `.env.production` (Railway Backend)
```bash
EXPO_PUBLIC_API_URL=https://main-production-ede9.up.railway.app/api
EXPO_PUBLIC_ENV=production
```

#### For Android Emulator
```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:3002/api
EXPO_PUBLIC_ENV=development
```

#### For Physical Device (Local Testing)
```bash
# Replace with your computer's IP address
# Find it with: ipconfig getifaddr en0 (Mac) or ipconfig (Windows)
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3002/api
EXPO_PUBLIC_ENV=development
```

---

## Current Configuration

### Production (Default)
- **API URL:** `https://main-production-ede9.up.railway.app/api`
- **Backend:** Railway deployment
- **Database:** PostgreSQL on Railway
- **No .env file needed!**

### Development (Optional)
- **API URL:** Set in `.env` file
- **Backend:** Local backend-mobile server
- **Database:** Local PostgreSQL or Railway

---

## How It Works

1. **Environment Variables:** Expo loads `.env` files automatically
2. **Configuration:** `app/config/env.ts` reads `EXPO_PUBLIC_API_URL`
3. **API Client:** `app/lib/api.ts` uses the configured URL
4. **Fallback:** If no `.env` file exists, uses Railway production URL

---

## Testing Different Environments

### Test with Production Backend (Railway)
```bash
# No .env file needed, or:
echo 'EXPO_PUBLIC_API_URL=https://main-production-ede9.up.railway.app/api' > .env
npm run dev
```

### Test with Local Backend
```bash
# Create .env file
echo 'EXPO_PUBLIC_API_URL=http://localhost:3002/api' > .env

# Start local backend (in another terminal)
cd ../../backend-mobile
npm run dev

# Start mobile app
npm run dev
```

### Test on Android Emulator (Local Backend)
```bash
echo 'EXPO_PUBLIC_API_URL=http://10.0.2.2:3002/api' > .env
npm run android
```

---

## Troubleshooting

### "Network request failed"
- **Production:** Check Railway deployment is running
- **Local:** Check backend server is running on correct port
- **Android:** Use `10.0.2.2` instead of `localhost`
- **Physical Device:** Use computer's IP address

### "Connection refused"
- Verify backend server is running
- Check port number (3002)
- Check firewall settings for physical device testing

### Environment Variables Not Working
- Restart Expo dev server after changing `.env`
- Check console logs for `[ENV] Configuration loaded:`
- Verify `EXPO_PUBLIC_` prefix (required by Expo)

---

## Important Notes

⚠️ **`.env` files are gitignored** - They won't be committed to the repository (for security)

✅ **No .env file needed for production** - It works out of the box with Railway!

🔧 **Only create .env for local development** - When you want to test with local backend

📱 **Physical device testing** - Requires your computer's IP address in .env

---

## Quick Reference

| Scenario | API URL | .env Needed? |
|----------|---------|--------------|
| Production (default) | Railway | ❌ No |
| iOS Simulator (local) | localhost:3002 | ✅ Yes |
| Android Emulator (local) | 10.0.2.2:3002 | ✅ Yes |
| Physical Device (local) | Your-IP:3002 | ✅ Yes |

---

## Current Setup Status

✅ **Mobile app configured** to use Railway production URL by default
✅ **No .env file needed** - works immediately!
✅ **Optional .env support** for local development
✅ **Platform detection** for iOS/Android differences
✅ **Console logging** to see which API URL is being used

**You're ready to test!** Just run `npm run dev` in the mobile directory.

