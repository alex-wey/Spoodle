# Spoodle Third Party Interface (3PI)

A secure web-based portal for shelters, pet stores, airports, and referral partners to manage pet records, compliance checks, and referral programs.

## Features

- 🔐 **Organization Verification** - Secure onboarding and verification process
- 🏠 **Dashboard** - Overview of pet interactions and compliance status
- 🔍 **Pet Search & Records** - Search and access pet profiles and medical records
- ✅ **Compliance Check-ins** - Verify pet compliance for services
- 📊 **Analytics & Revenue** - Track partner performance and referral earnings
- 🎯 **Marketing Tools** - Manage referral codes, QR codes, and promotional materials
- ⚙️ **Settings & Administration** - Manage staff and organization settings

## Tech Stack

- **Framework**: Next.js 15.4.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **UI Components**: Headless UI + Heroicons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd apps/3pi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # Reusable UI components
├── lib/               # Utility libraries
├── hooks/             # Custom React hooks
├── stores/            # Zustand stores
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Development Phases

1. **Phase 1**: Core Foundation - Authentication, verification, basic dashboard
2. **Phase 2**: Record Management - Pet profiles, documents, compliance
3. **Phase 3**: Business Features - Revenue tracking, marketing tools
4. **Phase 4**: Advanced Features - Reporting, integrations, optimization

## Contributing

Please follow the existing code patterns and conventions when contributing to this project.
