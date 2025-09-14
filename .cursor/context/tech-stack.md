# Spoodle Tech Stack

## Overview
Full TypeScript/React/Node.js stack with AWS Lambda serverless backend and DynamoDB for data storage.

## Frontend

### Pet Owner Mobile App
- **Framework:** Expo (React Native + TS)
- **State Management:** Zustand or Redux Toolkit
- **UI Library:** NativeWind + React Native Elements
- **Navigation:** Expo Router or React Navigation

### Clinic Web App
- **Framework:** Next.js (React + TS)
- **State Management:** Zustand or Redux Toolkit
- **UI Library:** Tailwind CSS + Headless UI
- **Routing:** React Router

## Backend

### API & Runtime
- **API:** Node.js with TypeScript
- **Runtime:** AWS Lambda with Node.js 22.x
- **API Gateway:** AWS API Gateway for REST endpoints
- **Framework:** AWS SAM or Serverless Framework for deployment
- **Abstractions** Abstract shared business logic to packages/common and keep platform-specific logic isolated

### Database & Storage
- **Primary DB:** Amazon DynamoDB (NoSQL)
- **File Storage:** Amazon S3 with CloudFront CDN for medical documents/images
- **Search:** Amazon OpenSearch for clinic/pet search functionality

## AWS Services

### Core Services
- **Authentication:** AWS Cognito for user management
- **Push Notifications:** Amazon SNS with Expo Push Notifications
- **AI Integration:** Amazon Bedrock or direct OpenAI API integration
- **Email:** Amazon SES
- **Monitoring:** AWS CloudWatch + X-Ray
- **Security:** AWS WAF, AWS Secrets Manager

## Mono-repo Structure

```
Spoodle/
├── backend/
│   ├── api/                      # Backend API (Lambda functions)
│   ├── database/                 # DynamoDB schemas & data access layer
│   └── shared/                   # Shared TypeScript types & utilities
├── frontend/
│   ├── mobile/                   # Pet Owner Mobile App (Expo)
│   └── web/                      # Clinic Web App (Next.js)
├── infrastructure/
│   ├── cdk/                      # AWS CDK infrastructure code
│   ├── environments/             # Environment-specific configs
│   └── scripts/                  # Deployment & utility scripts
├── docs/
│   ├── api/                      # API documentation
│   ├── architecture/             # System architecture docs
│   └── deployment/               # Deployment guides
└── tests/
    ├── e2e/                      # End-to-end tests
    ├── integration/              # Integration tests
    └── fixtures/                 # Test data & mocks
```

## Detailed Package Structure

### `/apps/mobile` (Pet Owner App)
```
mobile/
├── src/
│   ├── screens/                  # All app screens
│   ├── components/               # Mobile-specific components
│   ├── navigation/               # Navigation configuration
│   ├── hooks/                    # Custom React hooks
│   ├── stores/                   # Zustand stores
│   ├── services/                 # API clients & external services
│   └── utils/                    # Mobile-specific utilities
├── assets/                       # Images, fonts, etc.
├── app.json                      # Expo configuration
└── package.json
```

### `/apps/web` (Clinic Web App)
```
web/
├── src/
│   ├── pages/                    # Next.js pages
│   ├── components/               # Web-specific components
│   ├── hooks/                    # Custom React hooks
│   ├── stores/                   # State management
│   ├── services/                 # API clients
│   ├── styles/                   # Tailwind & CSS modules
│   └── utils/                    # Web-specific utilities
├── public/                       # Static assets
├── next.config.js
└── package.json
```

### `/packages/api` (Backend Services)
```
api/
├── src/
│   ├── functions/                # Individual Lambda functions
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── pets/                 # Pet management
│   │   ├── appointments/         # Appointment booking
│   │   ├── records/              # Medical records
│   │   ├── notifications/        # Push notifications
│   │   └── ai/                   # AI-powered features
│   ├── middleware/               # Shared middleware
│   ├── utils/                    # Backend utilities
│   └── types/                    # API-specific types
├── templates/                    # SAM/Serverless templates
└── package.json
```

### `/packages/database` (Data Layer)
```
database/
├── src/
│   ├── models/                   # DynamoDB models & schemas
│   ├── repositories/             # Data access layer
│   ├── migrations/               # Database migration scripts
│   └── seeds/                    # Test/development data
├── scripts/                      # Database utility scripts
└── package.json
```

## Development Process

### Workspace Management
- **Tool:** Turborepo or Nx for mono-repo orchestration
- **Package Manager:** pnpm for efficient dependency management
- **Scripts:** Unified scripts for building, testing, and deployment

### Development Workflow
```bash
# Install dependencies across all packages
pnpm install

# Start development servers concurrently
pnpm dev                          # All apps in dev mode
pnpm dev:mobile                   # Mobile app only
pnpm dev:web                      # Web app only
pnpm dev:api                      # API with hot reload

# Run tests
pnpm test                         # All packages
pnpm test:unit                    # Unit tests only
pnpm test:e2e                     # End-to-end tests
```

### Code Sharing Strategy
- **Shared Types:** All API contracts and data models in `/packages/shared`
- **UI Components:** Reusable components with platform-specific implementations
- **Business Logic:** Core logic abstracted into shared utilities
- **Configuration:** Centralized config management with environment overrides

## Deployment Strategy

### Environment Structure
```
Environments:
├── development/     # Individual developer environments
├── staging/         # QA and integration testing
├── production/      # Live production environment
└── demo/           # Client demonstrations
```

### CI/CD Pipeline (GitHub Actions)
```yaml
# Simplified workflow structure
Build & Test:
  - Install dependencies
  - Lint & type check
  - Run unit tests
  - Build all packages

Deploy Backend:
  - Deploy infrastructure (CDK)
  - Deploy Lambda functions
  - Run integration tests

Deploy Frontend:
  - Build mobile app (EAS Build)
  - Deploy web app (Vercel/CloudFront)
  - Run E2E tests

Notifications:
  - Slack/email notifications
  - Deployment status updates
```

### Mobile App Deployment
- **Development:** Expo Dev Client for testing
- **Staging:** Internal distribution via EAS Update
- **Production:** App Store deployment via EAS Submit

## Infrastructure Management with AWS CDK

### CDK Structure
```
infrastructure/cdk/
├── lib/
│   ├── stacks/
│   │   ├── api-stack.ts          # API Gateway + Lambda
│   │   ├── database-stack.ts     # DynamoDB tables
│   │   ├── storage-stack.ts      # S3 + CloudFront
│   │   ├── auth-stack.ts         # Cognito configuration
│   │   ├── monitoring-stack.ts   # CloudWatch + X-Ray
│   │   └── networking-stack.ts   # VPC, security groups
│   ├── constructs/               # Reusable CDK constructs
│   └── utils/                    # CDK utilities
├── environments/
│   ├── dev.ts
│   ├── staging.ts
│   └── prod.ts
└── cdk.json
```

### Infrastructure as Code Benefits
- **Version Control:** All infrastructure changes tracked in Git
- **Environment Parity:** Identical infrastructure across environments
- **Automated Deployments:** Infrastructure updates via CI/CD
- **Resource Management:** Proper resource tagging and cost allocation

### CDK Deployment Strategy
```bash
# Deploy to specific environment
cdk deploy --context environment=staging

# Deploy specific stack
cdk deploy ApiStack --context environment=prod

# Diff before deployment
cdk diff --context environment=prod
```

## Development Tools & Quality

### Code Quality
- **Prettier + ESLint:** Consistent code formatting
- **Husky + lint-staged:** Pre-commit quality checks
- **TypeScript:** Strict mode across all packages
- **Jest + Testing Library:** Comprehensive test coverage
- **Storybook:** Component development and documentation

### Monitoring & Observability
- **CloudWatch Dashboards:** Real-time monitoring
- **AWS X-Ray:** Distributed tracing
- **Error Tracking:** Sentry integration
- **Performance Monitoring:** Web Vitals tracking
- **Cost Monitoring:** AWS Cost Explorer integration

### Security Considerations
- **Secrets Management:** AWS Secrets Manager integration
- **API Security:** Rate limiting, authentication middleware
- **Data Privacy:** HIPAA compliance considerations
- **Mobile Security:** Certificate pinning, secure storage

### Scalability Planning
- **Auto-scaling:** Lambda concurrency management
- **Caching Strategy:** CloudFront + DynamoDB DAX
- **Database Design:** Single-table design for DynamoDB
- **CDN Strategy:** Global content distribution

### Developer Experience
- **Hot Reloading:** Fast development feedback
- **Type Safety:** End-to-end TypeScript coverage
- **API Documentation:** Auto-generated OpenAPI specs
- **Local Development:** Docker containers for consistent environments

