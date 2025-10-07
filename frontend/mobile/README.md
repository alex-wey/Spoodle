# Spoodle Mobile App

A comprehensive pet healthcare management mobile application built with React Native and Expo.

## 🚀 Features

### Core Functionality
- **Pet Management**: Create and manage multiple pet profiles
- **Health Records**: Track vaccinations, medications, and medical history
- **Appointments**: Schedule and manage veterinary appointments
- **AI Assistant**: Chat with Spood, an AI-powered pet care assistant
- **Notifications**: Reminders for medications, appointments, and tasks
- **User Profiles**: Manage account settings and preferences

### Technical Features
- **Authentication**: Secure login/signup with persistent sessions
- **Offline Support**: Local data caching with AsyncStorage
- **State Management**: Zustand for global state
- **Type Safety**: Full TypeScript implementation
- **Form Validation**: Zod schemas with React Hook Form
- **Navigation**: File-based routing with Expo Router

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
- **Navigation**: Expo Router 5.1
- **State Management**: Zustand 5.0
- **Styling**: NativeWind (Tailwind for React Native)
- **Forms**: React Hook Form + Zod
- **API Client**: TanStack Query (React Query)
- **UI Components**: Custom components with Lucide icons
- **Storage**: AsyncStorage for persistence

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
   npm start
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
├── (auth)/              # Authentication screens
│   ├── _layout.tsx      # Auth navigation
│   ├── landing.tsx      # Welcome screen
│   ├── login.tsx        # Login form
│   ├── signup.tsx       # Registration form
│   └── onboarding.tsx   # New user onboarding
├── (tabs)/              # Main app screens
│   ├── _layout.tsx      # Tab navigation
│   ├── home.tsx         # Home with pet cards
│   ├── pets.tsx         # Pet management
│   ├── appointments.tsx # Appointment booking
│   ├── notifications.tsx# Alerts and reminders
│   └── profile.tsx      # User profile
├── components/          # Reusable components
│   ├── PetCard.tsx      # Pet profile card
│   └── FAB.tsx          # Floating action button
├── lib/                 # Utilities
│   └── utils.ts         # Helper functions
├── store/               # State management
│   ├── auth.ts          # Authentication store
│   └── pets.ts          # Pet data store
├── types/               # TypeScript definitions
│   └── index.ts         # Shared types and schemas
├── _layout.tsx          # Root layout with providers
└── index.tsx            # Entry point with auth redirect
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

### Environment Variables

Create a `.env` file in the mobile directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Mock Data

The app currently uses mock data for development. Real API integration points are marked with `TODO` comments in:
- `/app/store/auth.ts` - Authentication
- `/app/store/pets.ts` - Pet management

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
1. [ ] Real API integration
2. [ ] Push notifications
3. [ ] Camera integration for pet photos
4. [ ] Document upload functionality
5. [ ] Calendar integration
6. [ ] Social features (pet friends)
7. [ ] Offline sync
8. [ ] Biometric authentication

### Improvements
- [ ] Performance optimization
- [ ] Accessibility enhancements
- [ ] Internationalization (i18n)
- [ ] Dark mode support
- [ ] Analytics integration
- [ ] Crash reporting
- [ ] User onboarding tour
- [ ] In-app messaging

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

Private - Spoodle Pet Healthcare Management

## 🆘 Support

For issues or questions, please contact the development team.