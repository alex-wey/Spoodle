# Spoodle Mobile App

A comprehensive pet healthcare management mobile application built with React Native and Expo.

## 🚀 Features

### Implemented Features ✅
- **Authentication**: Secure login/signup with JWT tokens and persistent sessions
- **Pet Management**: View and manage multiple pet profiles with detailed information
- **Pet Profiles**: Comprehensive pet details including breed, age, weight, allergies, and dietary restrictions
- **Medical Records**: View and manage pet medical records with file type categorization
- **Real API Integration**: Connected to backend API with proper authentication
- **State Management**: Zustand stores for auth and pets with AsyncStorage persistence
- **Type Safety**: Full TypeScript implementation with proper type definitions
- **Navigation**: File-based routing with Expo Router and protected routes

### In Progress 🚧
- **Appointments**: Schedule and manage veterinary appointments
- **AI Assistant**: Chat with Spood, an AI-powered pet care assistant
- **Notifications**: Reminders for medications, appointments, and tasks
- **User Profiles**: Manage account settings and preferences
- **Pet Creation**: Add new pets with photo upload

### Technical Features
- **Backend Integration**: RESTful API client with JWT authentication
- **Offline Support**: Local data caching with AsyncStorage
- **State Management**: Zustand for global state management
- **Form Validation**: Zod schemas for type-safe validation
- **Error Handling**: Comprehensive error handling with user-friendly alerts
- **Loading States**: Proper loading indicators throughout the app

## 📱 Screenshots

The app includes:
- Landing page with feature highlights
- Authentication flow (Login/Signup/Onboarding)
- Bottom tab navigation
- Pet profile cards with quick actions
- Floating action buttons for chat and support

## 🛠️ Tech Stack

- **Framework**: React Native 0.79.5 with Expo SDK 53
- **Language**: TypeScript 5.8
- **Navigation**: Expo Router 5.1 (file-based routing)
- **State Management**: Zustand 5.0 with AsyncStorage persistence
- **Styling**: Custom StyleSheet with consistent design system
- **Forms**: React Hook Form + Zod validation
- **API Client**: Custom fetch-based client with JWT authentication
- **UI Components**: Custom components with Lucide React Native icons
- **Storage**: AsyncStorage for offline data persistence
- **Authentication**: JWT tokens with refresh token support

## 📦 Installation

1. **Prerequisites**
   - Node.js 22.0.0 or higher
   - iOS Simulator (Mac) or Android Emulator
   - Expo Go app on your physical device (optional)

2. **Install Dependencies**
   ```bash
   cd frontend/mobile
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # or
   npm startewhich
   ```

4. **Run on Specific Platform**
   ```bash
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator
   npm run web      # Web Browser
   ```

## 🏗️ Project Structure

```
app/
├── (auth)/                    # Authentication screens
│   ├── _layout.tsx            # Auth navigation
│   ├── landing.tsx            # Welcome screen
│   ├── login.tsx              # Login form with test credentials
│   ├── signup.tsx             # Registration form
│   └── onboarding.tsx         # New user onboarding
├── (tabs)/                    # Main app screens (tab navigation)
│   ├── _layout.tsx            # Tab navigation configuration
│   ├── pets/                  # Pet management section
│   │   ├── index.tsx          # Pet list with cards
│   │   ├── add.tsx            # Add new pet form
│   │   └── [id]/              # Dynamic pet routes
│   │       ├── profile.tsx    # Pet profile details
│   │       ├── records.tsx    # Pet medical records
│   │       └── components/    # Pet-specific components
│   │           └── PetCard.tsx
│   ├── chat/                  # AI chat assistant
│   │   └── index.tsx
│   ├── appointments/          # Appointment management
│   │   └── index.tsx
│   ├── profile/               # User profile
│   │   ├── index.tsx
│   │   └── settings/
│   └── notifications/         # Notifications center
│       └── index.tsx
├── components/                # Reusable components
│   └── FAB.tsx                # Floating action button
├── lib/                       # Utilities and helpers
│   ├── api.ts                 # API client with authentication
│   └── utils.ts               # Helper functions
├── store/                     # Zustand state management
│   ├── auth.ts                # Authentication state
│   └── pets.ts                # Pet data state
├── types/                     # TypeScript definitions
│   └── index.ts               # Shared types and Zod schemas
├── _layout.tsx                # Root layout with providers
└── index.tsx                  # Entry point with auth redirect
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run build` - Create production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

### API Configuration

The app connects to the backend API automatically based on the platform:
- **iOS Simulator**: `http://localhost:3001/api`
- **Android Emulator**: `http://10.0.2.2:3001/api`
- **Physical Device**: Configure in `/app/lib/api.ts` with your computer's IP address

### Test Credentials

For development and testing, use these credentials:
```
Email: sarah.johnson@email.com
Password: password123
```

The login screen includes a "Quick Fill" button to auto-populate these credentials.

## 🎨 Design System

### Colors
- **Primary**: #4F46E5 (Indigo)
- **Secondary**: #7C3AED (Purple)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Danger**: #EF4444 (Red)
- **Neutral**: Gray scale

### Typography
- System fonts with responsive sizing
- Bold headers for emphasis
- Regular text for body content

### Components
- Cards with subtle shadows
- Rounded corners (12-16px)
- Consistent padding (16-24px)
- Touch targets minimum 44x44px

## 🚀 Deployment

### Building for Production

1. **iOS**
   ```bash
   expo build:ios
   ```

2. **Android**
   ```bash
   expo build:android
   ```

3. **Web**
   ```bash
   npm run build
   ```

### App Store Preparation

Update `app.json` with:
- App name and slug
- Version numbers
- Bundle identifiers
- App icons and splash screens
- Required permissions

## 📝 Next Steps

### Priority Features
1. [x] Real API integration ✅
2. [x] Pet profile viewing ✅
3. [x] Medical records viewing ✅
4. [ ] Pet creation/editing with photo upload
5. [ ] Document upload functionality for medical records
6. [ ] Appointment booking and management
7. [ ] AI chat assistant implementation
8. [ ] Push notifications
9. [ ] Calendar integration
10. [ ] Offline sync improvements
11. [ ] Biometric authentication

### Improvements
- [ ] Performance optimization
- [ ] Accessibility enhancements (WCAG compliance)
- [ ] Internationalization (i18n)
- [ ] Dark mode support
- [ ] Analytics integration
- [ ] Crash reporting (Sentry)
- [ ] User onboarding tour
- [ ] In-app messaging
- [ ] Pull-to-refresh on all lists
- [ ] Skeleton loaders for better UX
- [ ] Image optimization and caching

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

Private - Spoodle Pet Healthcare Management

## 🆘 Support

For issues or questions, please contact the development team.