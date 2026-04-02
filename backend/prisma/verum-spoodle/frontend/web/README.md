# Spoodle Web - Veterinary Practice Management

Next.js web application for veterinary clinics built with React 19 and TypeScript.

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- Clerk account for authentication

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env.local` file):
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002

# Optional: Custom Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
```

3. Run development server:
```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000).

4. Build for production:
```bash
npm run build
npm run start
```

## Project Structure

```
app/
├── appointments/             # Appointment management
│   ├── [id]/
│   │   └── views/            # Appointment detail view
│   ├── components/           # AppointmentCard, CalendarGrid, WeekNavigation, etc.
│   └── views/                # AppointmentsView (week calendar)
├── business/                 # Business dashboard
│   └── views/
├── home/                     # Main dashboard
│   └── views/
├── messages/                 # Messaging system
│   └── views/
├── pets/                     # Pet management
│   ├── [id]/
│   │   ├── components/       # Hero, PetRecordsSection
│   │   └── views/            # PetProfileView
│   └── views/                # PetsView (pet list/table)
├── settings/                 # Settings
│   └── views/                # SettingsView (tabs: personal, calendar, users)
├── sign-in/                  # Sign-in page
│   └── [[...rest]]/
│       └── views/
└── sign-up/                  # Sign-up page
    ├── [[...rest]]/
    │   └── views/
    └── complete/
components/
├── ui/                      # shadcn/ui components (48+)
├── clerk/
├── primtives/
├── AppLayout.tsx
├── Sidebar.tsx
├── Topbar.tsx
└── SessionContext.tsx
lib/
├── api.ts
├── types.ts
└── utils.ts
hooks/
└── use-toast.ts
```

## Available Routes

- `/` - Entry point (redirects to `/home` or `/sign-in`)
- `/sign-in` - Authentication page
- `/home` - Main dashboard with appointment kanban board
- `/pets` - Pet list and search
- `/pets/[id]` - Individual pet profile and medical records
- `/appointments` - Week-view calendar of appointments with week navigation
- `/appointments/[id]` - Appointment details with questionnaire and booking information
- `/messages` - Messaging interface
- `/business` - Business analytics and reports
- `/settings` - User and clinic settings (personal info, clinic hours, user management)

## API Integration

The web app connects to the backend API at `NEXT_PUBLIC_API_BASE_URL`. All requests are authenticated using Clerk session tokens.

### Key API Endpoints

**Pets**
- `GET /api/pets` - Get all clinic pets
- `GET /api/pets/:id` - Get pet details
- `GET /api/pets/:id?clinicId=:clinicId` - Get pet (staff)

**Documents**
- `GET /api/documents` - Get all documents
- `GET /api/documents/pet/:petId` - Get pet documents
- `GET /api/documents/category/:category` - Get by category
- `GET /api/documents/download/:id` - Download document
- `POST /api/documents` - Upload document

**Clinics**
- `GET /api/clinics` - Get available clinics
- `GET /api/clinics/my-clinic` - Get user's clinic
- `POST /api/clinics/staff/verify` - Verify staff access

**Forms**
- `GET /api/forms` - Get all forms for the clinic
- `GET /api/forms/:id` - Get specific form by ID
- `GET /api/forms/:id/submissions` - Get form submissions

**Appointments**
- `GET /api/appointments` - Get all appointments (supports `?clinicId=`, `?status=`, `?petId=`, `?staffId=`)
- `GET /api/appointments/:id` - Get specific appointment by ID
- `GET /api/appointments/event-types` - Get all Cal.com event types
- `GET /api/appointments/scheduling-link` - Generate Cal.com scheduling link

**Appointment Invites**
- `GET /api/appointment-invites` - Get all appointment invites (supports `?clinicId=`)
- `GET /api/appointment-invites/:id` - Get specific appointment invite
- `POST /api/appointment-invites` - Create appointment invite (sends invite to pet owner)
- `DELETE /api/appointment-invites/:id` - Cancel appointment invite

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without emitting files

## Tech Stack

- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript 5
- **UI**: React 19.1.0
- **Styling**: Tailwind CSS 3.4
- **Components**: Radix UI + shadcn/ui (48+ components)
- **Charts**: Recharts
- **Authentication**: Clerk
- **State Management**: Zustand
- **Forms**: React Hook Form

## Features

- **Dashboard**: Kanban-style appointment management
- **Pet Management**: Complete pet profiles with medical records
- **Appointment Calendar**: Week-view calendar with appointment scheduling via Cal.com integration
- **Appointment Invites**: Send appointment invitation links to pet owners, track pending invites
- **Forms Integration**: View and manage Tally form submissions linked to pets
- **Business**: Revenue tracking and business metrics
- **Messaging**: Integrated communication system
- **Document Management**: Upload and view pet medical records
- **Theme Support**: Dark/light mode with next-themes
- **Responsive Design**: Optimized for desktop and tablet

## License

Private - Spoodle Veterinary Practice Management Platform
