# Spoodle Web - Veterinary Practice Management Platform

A modern, full-featured web application for veterinary clinics built with Next.js 15, React 19, and TypeScript. Designed to streamline clinic operations, manage appointments, track pet records, and provide comprehensive analytics.

## 🚀 Features

### Core Functionality
- **Dashboard Home**: Kanban-style appointment management with drag-and-drop workflow (Booked → Pending → Discharged)
- **Pet Management**: Complete pet profiles with medical records, owner information, and searchable database
- **Appointment Calendar**: Time-slot based scheduling with veterinarian filtering and real-time availability
- **Analytics Dashboard**: Revenue tracking, staff utilization, customer insights, and service performance metrics
- **Messaging**: Integrated communication system for clinic staff and pet owners
- **Settings**: User preferences and clinic configuration

### Key Features
- 🔐 **Authentication**: Clerk-based authentication with organization support
- 📊 **Advanced Filtering**: Filter appointments by veterinarian, patient type, and date range
- 📈 **Data Visualization**: Charts and graphs using Recharts for business intelligence
- 🎨 **Modern UI**: Built with Radix UI components and Tailwind CSS
- 🌓 **Theme Support**: Dark/light mode with next-themes
- 📱 **Responsive Design**: Optimized for desktop and tablet viewing
- ⚡ **Performance**: Next.js 15 with Turbopack for fast development

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15.4.5** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4** - Utility-first styling

### UI Components & Design
- **Radix UI** - Accessible component primitives (40+ components)
- **shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **Fabric.js** - Canvas manipulation for medical records

### Authentication & State
- **Clerk** - Authentication and user management
- **Zustand** - State management
- **React Hook Form** - Form handling

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📋 Prerequisites

- Node.js 20.x or higher
- npm, yarn, pnpm, or bun
- Clerk account for authentication (get your API keys from [clerk.com](https://clerk.com))

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Optional: Custom sign-in/sign-up URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The application will start at [http://localhost:3000](http://localhost:3000).

### 4. Build for Production

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
frontend/web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── analytics/                # Analytics dashboard
│   ├── appointments/             # Appointment management
│   │   ├── [id]/                # Individual appointment details
│   │   └── views/               # Appointment views
│   ├── home/                     # Main dashboard
│   ├── messages/                 # Messaging system
│   ├── pets/                     # Pet management
│   │   ├── [id]/                # Individual pet profiles
│   │   └── views/               # Pet list and detail views
│   ├── settings/                 # Settings and configuration
│   ├── sign-in/                  # Clerk sign-in page
│   ├── layout.tsx               # Root layout with Clerk provider
│   ├── page.tsx                 # Entry point with auth redirect
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components (48 components)
│   ├── clerk/                   # Clerk-specific components
│   ├── AppLayout.tsx            # Main app layout with sidebar
│   ├── VetSidebar.tsx           # Navigation sidebar
│   ├── DashboardHeader.tsx      # Dashboard header component
│   ├── AppointmentCard.tsx      # Appointment card component
│   ├── AppointmentColumn.tsx    # Kanban column component
│   ├── PetRecordsViewer.tsx     # Medical records viewer
│   ├── MessagingPopup.tsx       # Messaging interface
│   └── SessionContext.tsx       # Session management context
├── lib/                         # Utility functions
│   └── utils.ts                 # Helper utilities
├── hooks/                       # Custom React hooks
│   └── use-toast.ts            # Toast notification hook
├── assets/                      # Static assets
│   └── pets/                    # Pet images
├── package.json                 # Dependencies and scripts
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## 🎯 Available Routes

| Route | Description |
|-------|-------------|
| `/` | Entry point (redirects to `/home` or `/sign-in`) |
| `/sign-in` | Authentication page |
| `/home` | Main dashboard with appointment kanban board |
| `/pets` | Pet list and search |
| `/pets/[id]` | Individual pet profile and medical records |
| `/appointments` | Calendar view of all appointments |
| `/appointments/[id]` | Appointment details |
| `/messages` | Messaging interface |
| `/analytics` | Business analytics and reports |
| `/settings` | User and clinic settings |

## 🎨 UI Components

The application uses a comprehensive set of 48+ UI components from shadcn/ui and Radix UI:

- **Layout**: Sidebar, Resizable Panels, Scroll Area, Separator
- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider
- **Data Display**: Table, Card, Badge, Avatar, Calendar, Chart
- **Feedback**: Toast, Alert, Dialog, Drawer, Hover Card, Tooltip
- **Navigation**: Tabs, Accordion, Breadcrumb, Dropdown Menu, Navigation Menu
- **Overlays**: Dialog, Sheet, Popover, Context Menu, Alert Dialog
- **And more**: Button, Progress, Skeleton, Command, Carousel, etc.

## 📊 Key Features Detail

### Dashboard (Home)
- Three-column kanban board for appointment workflow
- Real-time filtering by veterinarian, patient type, and date range
- Visual indicators for new clients and unread messages
- Quick stats and appointment counts
- Drag-and-drop functionality (planned)

### Pet Management
- Searchable pet database with filters
- Detailed pet profiles with owner information
- Medical records viewer with canvas-based annotations
- Weight tracking and vaccination history
- Quick access to appointment history

### Appointment Calendar
- Time-slot based scheduling (8 AM - 6 PM)
- Visual representation of appointment duration
- Color-coded status indicators (booked, pending, discharged)
- Veterinarian filtering
- Date navigation with quick "Today" button

### Analytics Dashboard
- Revenue trends and forecasting
- Staff and DVM utilization metrics
- Customer segmentation (new vs. recurring)
- Service performance analysis
- Top pet owners by revenue
- Missed appointment tracking
- Exportable reports (CSV)

## 🔧 Development Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Type check without emitting files
npm run type-check
```

## 🌐 API Integration

The application connects to a backend API (expected at `http://localhost:3001`) for:
- Pet data retrieval and management
- Appointment scheduling
- Medical records
- User authentication (via Clerk)

Ensure the backend server is running for full functionality.

## 🎨 Theming

The application supports light and dark themes using `next-themes`. Theme preferences are persisted across sessions. The color scheme is customizable via CSS variables in `globals.css`.

## 🔐 Authentication Flow

1. User visits the application
2. Redirected to `/sign-in` if not authenticated
3. Clerk handles authentication with email/password or OAuth
4. After sign-in, redirected to `/home`
5. Session managed via `SessionContext` with organization support

## 📱 Responsive Design

The application is optimized for:
- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Responsive layouts with collapsible sidebar
- **Mobile**: Limited support (mobile app available separately)

## 🚧 Future Enhancements

- Real-time notifications with WebSocket
- Drag-and-drop appointment rescheduling
- Advanced medical record annotations
- Multi-clinic support
- Inventory management
- Billing and invoicing
- Client portal integration
- Mobile-responsive improvements

## 📝 License

Private - Spoodle Veterinary Practice Management Platform

## 🤝 Contributing

This is a private project. For questions or contributions, please contact the development team.

## 📞 Support

For technical support or questions about the platform, please reach out to your system administrator or the development team.

---

Built with ❤️ for veterinary professionals
