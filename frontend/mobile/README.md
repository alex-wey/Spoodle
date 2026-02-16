# Spoodle Mobile App

React Native mobile application for pet healthcare management built with Expo and TypeScript.

## Quick Start

### Prerequisites

- Node.js >= 22.0.0
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (optional, for physical device testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env` file):
```env
EXPO_PUBLIC_API_URL=http://localhost:3002
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

3. Start development server:
```bash
npm run dev
# or
npm start
```

4. Run on specific platform:
```bash
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web Browser
```

## Project Structure

```
app/
├── (auth)/                    # Authentication screens
│   ├── landing.tsx
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   ├── verify-contact.tsx
│   ├── select-clinic.tsx
│   └── reset-password.tsx
├── (tabs)/                    # Main app screens (bottom tabs)
│   ├── pets/                  # Pet management
│   │   ├── add.tsx
│   │   └── [id]/
│   │       ├── profile.tsx
│   │       └── docs/          # Documents
│   │           └── [category].tsx
│   ├── tasks/                 # Task management
│   ├── chat/                  # AI chat assistant
│   └── profile/               # User profile
├── components/                # Reusable components
│   ├── chat/
│   ├── pets/
│   │   └── [id]/
│   ├── profile/
│   ├── tasks/
│   └── FAB.tsx
├── lib/                      # Utilities
│   ├── api.ts
│   ├── imageUtils.ts
│   └── utils.ts
├── store/                    # Zustand state management
│   ├── pets.ts
│   ├── chat.ts
│   └── documents.ts
├── support/                  # Bug reporting
└── types.ts
```

## API Integration

The app connects to the backend API at `EXPO_PUBLIC_API_URL`. All requests are authenticated using Clerk session tokens.

### Key API Endpoints

**Authentication**
- `POST /api/setup/complete` - Complete initial setup

**Pets**
- `GET /api/pets` - Get all pets
- `GET /api/pets/:id` - Get pet details
- `POST /api/pets` - Create pet
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

**Documents**
- `GET /api/documents` - Get all documents
- `GET /api/documents/category/:category` - Get by category
- `GET /api/documents/pet/:petId` - Get pet documents
- `POST /api/documents` - Upload document
- `GET /api/documents/download/:id` - Download document
- `DELETE /api/documents/:id` - Delete document

**Tasks**
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/complete` - Complete task
- `DELETE /api/tasks/:id` - Delete task

**Clinics**
- `GET /api/clinics` - Get available clinics
- `GET /api/clinics/my-clinic` - Get user's clinic
- `POST /api/clinics/select` - Select clinic
- `POST /api/clinics/switch` - Switch clinic

**Chat**
- `POST /api/chatbot/chat` - Send message to AI

**Settings**
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `DELETE /api/auth/me` - Delete account

**Bug Reports**
- `POST /api/bug-report` - Submit bug report

## Available Scripts

- `npm run dev` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run build` - Create production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## Tech Stack

- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Language**: TypeScript 5.9
- **Navigation**: Expo Router 6.0 (file-based routing)
- **State Management**: Zustand 5.0 with AsyncStorage
- **Styling**: NativeWind (Tailwind CSS)
- **Forms**: React Hook Form + Zod validation
- **Authentication**: Clerk
- **API Client**: Custom fetch-based client with Clerk auth

## Environment Configuration

**Development**
- iOS Simulator: `http://localhost:3002`
- Android Emulator: `http://10.0.2.2:3002`
- Physical Device: Use your computer's IP (e.g., `http://192.168.1.x:3002`)

**Production**
- Set `EXPO_PUBLIC_API_URL` to your production backend URL

## Deployment

Builds are manual using Expo EAS. Production config (API URL, Clerk keys) is in `eas.json`. Build time: ~10-20 minutes per build.

### Prerequisites

```bash
npm install -g eas-cli
eas login
```

**Android (one-time setup):**
1. Create Google Play Console account ($25 fee)
2. Create service account in Google Cloud Console
3. Enable Google Play Android Developer API
4. Download service account JSON key → `google-service-account.json`
5. Grant service account access in Play Console (Release manager role)
6. Add to `eas.json` submit config with `serviceAccountKeyPath`

### Build & Submit

```bash
# Build both platforms
# Android (first submission requires manual upload in Play Console)
eas build --platform all --profile production

# iOS
eas submit --platform ios --latest

# Check build status
eas build:list --platform ios --limit 3
```

### Important Notes

- **Build numbers**: Auto-managed by EAS. Don't set `buildNumber` in `app.json` unless fixing conflicts.
- **Version conflicts**: If build fails with "bundle version must be higher", check App Store Connect for highest build number, then set in `eas.json` production profile: `"ios": { "buildNumber": "X" }` (one higher).
- **Android version codes**: Auto-increment with `"autoIncrement": true` in `eas.json`. Update `versionCode` in `app.json` if conflicts occur.
- **No native folders**: EAS handles iOS/Android native code remotely.

### Troubleshooting

**Build number conflict (iOS):**
- Check App Store Connect → TestFlight → iOS Builds for highest number
- Set `buildNumber` in `eas.json` production profile (one higher)
- Rebuild

**Service account error (Android):**
- Verify service account has "Release manager" role in Play Console
- Ensure Google Play Android Developer API is enabled
- Wait 5-10 minutes after permission changes

**View build logs:**
```bash
eas build:view [build-id]
```

## License

Private - Spoodle Pet Healthcare Management
