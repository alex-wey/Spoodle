# Spoodle Mobile App

A comprehensive pet healthcare management mobile application built with React Native and Expo.

## 🚀 Features

### Implemented Features ✅
- **Authentication**: Secure sign-in/sign-up with Clerk authentication and two-step verification (email + phone)
- **Pet Management**: View and manage multiple pet profiles with detailed information
- **Pet Profiles**: Comprehensive pet details including species, breed, biological sex, weight, allergies, and dietary restrictions
- **Pet Creation/Editing**: Add new pets and edit existing pet profiles with custom components
- **Document Management**: Upload, view, and manage pet documents with categorization (Vaccination Records, Lab Results, Prescriptions, etc.)
- **AI Chat Assistant**: Chat with Spoodle AI for pet-specific health advice with persistent chat sessions per pet
- **Bug Reporting**: In-app bug reporting system with severity levels and categories
- **State Management**: Zustand stores for pets, chat sessions, and documents with AsyncStorage persistence
- **Type Safety**: Full TypeScript implementation with proper type definitions
- **Navigation**: File-based routing with Expo Router and protected routes

### Technical Features
- **Backend Integration**: RESTful API client with Clerk authentication
- **Offline Support**: Local data caching with AsyncStorage for pets and chat sessions
- **State Management**: Zustand stores (pets, chat, documents) with persistence
- **Form Validation**: Zod schemas for type-safe validation
- **Error Handling**: Comprehensive error handling with user-friendly alerts and toast notifications
- **Loading States**: Proper loading indicators throughout the app
- **Image Handling**: Image picker and document picker integration with upload functionality
- **Custom Components**: Reusable components including FABs, modals, selectors, and custom inputs

## 📱 App Screens

The app includes the following main screens:

### Authentication
- **Landing Page**: Feature highlights and app introduction
- **Sign In**: Clerk-powered authentication
- **Sign Up**: Registration with email and phone
- **Verify Contact**: Two-step verification process

### Main Navigation (Bottom Tabs)
- **Home/Dashboard**: Overview and quick actions
- **Pets**: Pet list with detailed cards
- **Chat**: AI assistant chat interface
- **Profile**: User account and settings

### Pet Management
- **Pet List**: View all pets with quick action buttons
- **Pet Profile**: Detailed pet information with inline editing
- **Pet Documents**: Categorized document management
  - Vaccination Records
  - Lab Results
  - Prescriptions
  - Vet Visits
  - Radiology
  - Insurance
- **Document Upload**: Multi-step upload with category selection
- **Add Pet**: Comprehensive pet creation form

### Features
- **AI Chat**: Pet-specific chat sessions with persistent history
- **Bug Report**: In-app issue reporting with severity levels
- **FABs**: Floating action buttons for chat and support access

## 🛠️ Tech Stack

- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Language**: TypeScript 5.9
- **Navigation**: Expo Router 6.0 (file-based routing)
- **State Management**: Zustand 5.0 with AsyncStorage persistence
- **Styling**: Custom StyleSheet with NativeWind (Tailwind CSS) and expo-linear-gradient
- **Forms**: React Hook Form + Zod 4.1 validation
- **API Client**: Custom fetch-based client with Clerk authentication
- **UI Components**: Custom components with Lucide React Native icons
- **Storage**: AsyncStorage for offline data persistence
- **Authentication**: Clerk (OAuth provider) with email and phone verification
- **Document Handling**: expo-document-picker and expo-image-picker
- **Date Handling**: date-fns for date formatting

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

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Configure your backend API URL and Clerk publishable key

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   npm start
   ```

5. **Run on Specific Platform**
   ```bash
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator
   npm run web      # Web Browser
   ```

## 🏗️ Project Structure

```
app/
├── (auth)/                    # Authentication screens
│   ├── _layout.tsx            # Auth navigation layout
│   ├── landing.tsx            # Welcome screen with feature highlights
│   ├── sign-in.tsx            # Clerk sign-in form
│   ├── sign-up.tsx            # Clerk registration form
│   └── verify-contact.tsx     # Two-step verification (email + phone)
├── (tabs)/                    # Main app screens (bottom tab navigation)
│   ├── _layout.tsx            # Tab navigation configuration
│   ├── index.tsx              # Home/Dashboard screen
│   ├── pets/                  # Pet management section
│   │   ├── index.tsx          # Pet list with cards
│   │   ├── add.tsx            # Add new pet form
│   │   ├── components/        # Pet-specific components
│   │   │   └── PetCard.tsx    # Reusable pet card component
│   │   └── [id]/              # Dynamic pet routes
│   │       ├── profile.tsx    # Pet profile details with edit functionality
│   │       ├── components/    # Pet profile components
│   │       │   ├── BiologicalSexSelector.tsx
│   │       │   ├── EditableList.tsx
│   │       │   ├── InfoRow.tsx
│   │       │   └── SpeciesSelector.tsx
│   │       └── docs/          # Pet documents section
│   │           ├── index.tsx       # Document categories list
│   │           ├── [category].tsx  # Category-specific documents
│   │           └── upload.tsx      # Document upload form
│   ├── chat/                  # AI chat assistant
│   │   └── index.tsx          # Chat sessions and interface
│   └── profile/               # User profile
│       └── index.tsx          # User profile and settings
├── components/                # Reusable components
│   ├── ChatbotIntroModal.tsx  # Chat introduction modal
│   ├── ChatInterfaceModal.tsx # Main chat interface
│   ├── DeleteAccountButton.tsx # Account deletion component
│   ├── FAB.tsx                # Floating action button
│   ├── PetSelectionModal.tsx  # Pet selection for chat
│   └── SignOutButton.tsx      # Sign-out button component
├── support/                   # Support features
│   └── index.tsx              # Bug report submission
├── lib/                       # Utilities and helpers
│   ├── api.ts                 # API client with Clerk authentication
│   ├── imageUtils.ts          # Image processing utilities
│   └── utils.ts               # General helper functions
├── store/                     # Zustand state management
│   ├── pets.ts                # Pet data state with API integration
│   ├── chat.ts                # Chat sessions with persistence
│   └── documents.ts           # Document management state
├── types.ts                   # TypeScript type definitions
├── _layout.tsx                # Root layout with Clerk provider
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

The app connects to the backend-mobile API. Configure the API URL in your `.env` file:
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3002
```

Platform-specific configuration:
- **iOS Simulator**: `http://localhost:3002`
- **Android Emulator**: `http://10.0.2.2:3002`
- **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.x:3002`)

### Authentication

The app uses Clerk for authentication. You'll need:
1. A Clerk account and project
2. Set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in your `.env` file
3. Configure email and phone verification in your Clerk dashboard

### Key API Endpoints

The mobile app communicates with the backend-mobile API:

**Authentication**
- POST `/setup` - Initial user setup with sync

**Pets**
- GET `/pets` - Fetch all user pets
- GET `/pets/:id` - Get specific pet details
- POST `/pets` - Create new pet
- PUT `/pets/:id` - Update pet information
- DELETE `/pets/:id` - Delete pet

**Documents**
- GET `/documents` - Fetch all documents
- GET `/documents/category/:category` - Get documents by category
- POST `/documents/upload` - Upload new document
- DELETE `/documents/:id` - Delete document

**Chat**
- POST `/chatbot` - Send message to AI assistant

**Bug Reports**
- POST `/bug-report` - Submit bug report

**Settings**
- DELETE `/settings/account` - Delete user account

### State Management

The app uses Zustand for global state management with three main stores:

**Pet Store** (`store/pets.ts`)
- Manages pet data with AsyncStorage persistence
- Actions: `fetchPets`, `addPet`, `updatePet`, `deletePet`
- Auto-syncs with backend API

**Chat Store** (`store/chat.ts`)
- Manages AI chat sessions per pet
- Persistent chat history with AsyncStorage
- Actions: `initializeChatSession`, `addMessage`, `clearChatSession`

**Document Store** (`store/documents.ts`)
- Manages document uploads and retrieval
- Actions: `uploadDocument`, `fetchDocuments`, `fetchDocumentsByCategory`
- Integrates with backend document API

## 🎨 Design System

### Colors
- **Primary**: #4559A7 (Dark Blue)
- **Secondary**: #ADD7EB (Light Blue)
- **Accent**: #3BB272 (Green)
- **Background**: #DCEBF5 (Light Blue Background)
- **Gradients**: Linear gradients with #4559A7, #5B6FB8, #3A4A8F
- **Text**: #4559A7 (Primary Text)

### Typography
- System fonts with responsive sizing
- Bold headers for emphasis
- Regular text for body content

### Components
- Cards with subtle shadows and elevation
- Rounded corners (12-16px border radius)
- Consistent padding (16-24px)
- Touch targets minimum 44x44px
- Modal interfaces for chat and pet selection
- Custom selectors for species and biological sex
- Floating Action Buttons (FABs) for quick access

## 🚀 Deployment

### Building for Production

The app uses Expo EAS (Expo Application Services) for building:

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS**
   ```bash
   eas build:configure
   ```

3. **Build for iOS**
   ```bash
   eas build --platform ios
   ```

4. **Build for Android**
   ```bash
   eas build --platform android
   ```

5. **Build for Web**
   ```bash
   npm run build
   ```

### App Configuration

Key configuration in `app.json`:
- **App Name**: "Spoodle - Pet Health Manager"
- **Slug**: `spoodle-mobile`
- **Version**: 1.0.0
- **Bundle Identifiers**:
  - iOS: `com.spoodle.mobile`
  - Android: `com.spoodle.mobile`
- **Scheme**: `spoodle`
- **Orientation**: Portrait only
- **New Architecture**: Enabled

## 📝 Next Steps

### Priority Features
1. [x] Real API integration ✅
2. [x] Pet profile viewing ✅
3. [x] Pet creation/editing ✅
4. [x] Document management ✅
5. [x] Document upload functionality ✅
6. [x] AI chat assistant implementation ✅
7. [x] Bug reporting system ✅
8. [ ] Appointment booking and management
9. [ ] Push notifications for reminders
10. [ ] Calendar integration for appointments
11. [ ] Offline sync improvements
12. [ ] Biometric authentication (Face ID/Touch ID)
13. [ ] User profile editing
14. [ ] Pet photo updates
15. [ ] Share pet profiles

### Improvements
- [ ] Performance optimization with React.memo and useMemo
- [ ] Accessibility enhancements (WCAG compliance)
- [ ] Internationalization (i18n) for multiple languages
- [ ] Dark mode support
- [ ] Analytics integration (tracking user behavior)
- [ ] Pull-to-refresh on all lists
- [ ] Skeleton loaders for better UX during loading
- [ ] Image optimization and caching with expo-image
- [ ] Error boundary implementation
- [ ] Advanced search and filtering for pets and documents
- [ ] Export pet health records as PDF

## 🐛 Troubleshooting

### Common Issues

**Cannot connect to API**
- Check that backend-mobile is running on port 3002
- Verify `.env` file has correct `EXPO_PUBLIC_API_BASE_URL`
- For Android emulator, use `http://10.0.2.2:3002`
- For physical devices, use your computer's IP address

**Clerk Authentication Fails**
- Verify `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly
- Check that email and phone verification are enabled in Clerk dashboard
- Clear app data and reinstall if authentication state is corrupted

**Documents Not Uploading**
- Ensure backend has write permissions to uploads directory
- Check file size limits (usually 10MB max)
- Verify mime types are supported

**Chat Not Working**
- Check that backend chatbot endpoint is accessible
- Verify OpenAI API key is configured in backend
- Check network connectivity

**App Won't Start**
- Clear Metro bundler cache: `npx expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for iOS/Android specific issues in console

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes following the existing code style
3. Test on both iOS and Android platforms
4. Run linting: `npm run lint`
5. Run type checking: `npm run type-check`
6. Submit a pull request with clear description

### Code Style Guidelines
- Use TypeScript for all new code
- Follow existing naming conventions
- Add comments for complex logic
- Use Zustand for state management
- Implement proper error handling
- Use custom components from `components/` directory

## 📄 License

Private - Spoodle Pet Healthcare Management
