# Spoodle 🐾

**Pet Healthcare Management Platform**

Spoodle is an integrated platform that centralizes pet healthcare management for pet owners and veterinary practices. Pet owners can manage medical records, receive AI-generated care plans, track daily tasks, and book appointments. Veterinary clinics can view shared records, manage appointments, and update patient information.

## 🚀 Current Status

**Phase 1 Complete** - Basic project infrastructure and application foundations are ready for local development.

### ✅ What's Built

- **Mobile App (Pet Owner)** - Expo/React Native with TypeScript
- **Web App (Clinic)** - Next.js 15 with TypeScript and Tailwind CSS
- **Monorepo Setup** - Turborepo with shared configurations
- **Development Environment** - Local development servers ready

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js v22+ (LTS)
- npm or pnpm

### Run Both Applications

**Mobile App (Pet Owner)**
```bash
cd apps/mobile
npm run dev
```
- Press `w` for web browser or scan QR code with Expo Go app
- View at: `http://localhost:8081`

**Web App (Clinic)**
```bash
cd apps/web  
npm run dev
```
- View at: `http://localhost:3000`

## 🛠 Tech Stack

### Mobile App (Pet Owner)
- **Framework:** Expo (React Native + TypeScript)
- **Navigation:** Expo Router v5
- **State Management:** Zustand (planned)
- **UI:** React Native Elements, Custom components

### Web App (Clinic)  
- **Framework:** Next.js 15 (App Router + TypeScript)
- **Styling:** Tailwind CSS v4
- **UI Components:** Headless UI, Heroicons
- **State Management:** Zustand

### Shared
- **Monorepo:** Turborepo
- **Package Manager:** npm/pnpm workspaces
- **TypeScript:** Strict mode with path mappings

## 📁 Project Structure

```
spoodle/
├── apps/
│   ├── mobile/          # Pet Owner Mobile App (Expo)
│   └── web/             # Clinic Web App (Next.js)
├── packages/            # Shared packages (planned)
│   ├── shared/          # Shared types & utilities
│   ├── api/             # Backend API (planned)
│   └── database/        # Database schemas (planned)
└── context/             # Project documentation
```

## 🎨 Design System

- **Primary Color:** Green (#2E7D32) - Health & Trust
- **Secondary Color:** Orange (#FF9800) - Energy & Care  
- **Mobile:** Pet-focused, friendly interface
- **Web:** Professional clinic dashboard

## 📱 Current Features

### Mobile App (Pet Owner)
- Welcome screen with Spoodle branding
- Tab-based navigation structure
- Feature overview and getting started

### Web App (Clinic)
- Professional clinic dashboard
- Stats cards (appointments, records, patients, tasks)
- Key features overview
- Quick action buttons
- Responsive design

## 🔄 Next Steps

- [ ] Set up local database and API server
- [ ] Implement authentication systems
- [ ] Build core pet profile management
- [ ] Create appointment booking system
- [ ] Add medical records functionality

## 🧑‍💻 Development

All TypeScript configurations use strict mode with comprehensive path mappings. Both applications support hot reloading and have development servers optimized for rapid iteration.

For detailed specifications, see `/context/` directory.
