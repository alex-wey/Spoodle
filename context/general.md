# Spoodle: Pet Health and Records Platform

## Overview

Spoodle is an integrated platform that centralizes pet healthcare management for pet owners and veterinary practices. The app allows pet owners to store and share medical records, receive personalized AI-generated care plans, manage daily health tasks, and book veterinary appointments in one place.

On the pet owner side, users can manage detailed pet profiles, upload vaccination and medical documents, schedule and track tasks such as medication and exercise, and book clinic visits. Owners receive reminders for tasks and upcoming appointments and can securely share and receive records with clinics.

On the clinic side, staff can view shared records before visits, manage appointment requests, and update pet health data after consultations.

Spoodle is designed to be secure, mobile first, and easy to use. It supports both web and native app experiences. Future updates may include insurance integrations, pharmacy refill requests, and advanced analytics for clinics.

## Goals

- Help pet owners manage all pet health data and care tasks in one place
- Simplify appointment scheduling and reduce administrative work for clinics
- Provide proactive health insights and personalized plans through AI
- Improve compliance with care tasks and follow-ups using reminders
- Enable secure and easy record sharing between owners and clinics

## User Stories

### Pet Owners

**As a new pet owner, I want to:**
- Create a profile for my pet quickly and easily
- Upload and store vaccination records and other health files
- Receive AI-generated care plan recommendations based on my pet's age, breed, and medical history
- Get push or email reminders for scheduled tasks such as medication and walks
- Book veterinary appointments online and receive confirmations

**As a returning pet owner, I want to:**
- View my pet's complete medical record and upcoming appointments
- Share my pet's records securely with a clinic or pet sitter
- Edit care plans or add new daily tasks
- Cancel or reschedule appointments easily

### Clinics

**As a receptionist or staff member, I want to:**
- View shared medical records before appointments
- Confirm or suggest new times for appointment requests
- Update vaccination and treatment information after visits
- Export or print shared records when needed

**As a veterinarian, I want to:**
- View an integrated care plan and see tasks completed by the owner
- Add post-visit notes and mark tasks for follow-up
- Monitor appointment volume and rebook rates

### Third Party Partners (3PP)

**As a shelter or pet store manager, I want to:**
- Verify vaccine and medical records quickly before adoptions or services
- Upload documents for new adopters
- Perform instant compliance checks
- Print certificates
- Share my unique referral code to earn revenue

**As an airport or boarding facility staff member, I want to:**
- Look up pet compliance status instantly before boarding
- Flag non-compliant pets
- Notify owners on the spot
- Generate or print health clearance certificates seamlessly

## Functional Requirements

### Pet Owner/3PP Side (Mobile App)

- Create and manage pet profiles, including name, breed, birthday, gender, and photos
- Upload and store medical records such as vaccinations, blood work, and diagnostic reports
- Access AI-generated personalized care plans covering diet, exercise, check-ups, and dental care
- Use a task calendar with daily and weekly views
- Create and customize tasks such as medication, exercise, feeding, and check-ups
- Receive push notification reminders
- Book appointments with clinics by selecting date and time
- Attach records or pre-visit forms to bookings
- Receive confirmations and reminders for appointments
- Share pet records securely with clinics or other contacts
- View appointment and task history

### Clinic Side (Web App)

- View shared pet medical records and task compliance
- Manage appointment requests (accept, reschedule, or cancel)
- Upload new documents such as treatment summaries and visit notes
- View and update pet profile information with owner consent
- Download or export pet health reports
- Access a dashboard showing key metrics such as appointment volume and record sharing activity

## Non-Functional Requirements

- Secure record handling with future support for HIPAA or PIPEDA compliance
- End-to-end encryption for document uploads and record sharing
- High availability with a target uptime above 99.5 percent
- Fully responsive design for all device sizes
- Push notifications delivered with at least 98 percent success within 60 seconds
- Support for at least 10,000 concurrent users without performance degradation

## Permissions Hierarchy

### Clinics

Clinics are added to the Spoodle database manually by the Spoodle team during onboarding. An administrative email is sent to the clinic contact with a unique code to create the first account.

#### Roles for Clinic Accounts

**Organizer**
- First user to register with the clinic's access code
- Can add and remove Admins
- Has full control over clinic settings

**Admin**
- Can add and remove regular staff accounts
- Can edit and customize booking questionnaires
- Can set prices for different procedures and services
- Can view and analyze the KPI dashboard

**Staff**
- Cannot access clinic settings or the KPI dashboard
- Cannot set procedure pricing or edit booking questionnaires
- Can perform core clinic functions, such as managing appointments, viewing shared records, updating patient information, and interacting with pet owner communications

### Pet Owners

- Every pet owner has a unique account profile
- Every pet has its own pet profile created by a pet owner
- The pet owner who creates a pet profile is designated as the "Owner"
- The "Owner" can send friend requests to other pet owners by entering their email or phone number into a search bar that appears after pressing the "add friends" button on a pet's profile

#### Roles for Pet Connections

**Friend**
- Can interact with the pet's task calendar
- Can edit tasks and mark them as completed
- Can share pet medical records securely
- Can edit pet profile settings
- Can interact with Spoodle's AI features (such as chatbot suggestions and care recommendations)

**Admin**
- Inherits all Friend permissions
- Can book appointments with clinics on behalf of the pet
- Can send additional friend requests to invite more pet owners

**Owner**
- Inherits all Admin and Friend permissions
- Can delete the pet profile permanently
- Can archive the profile in case of pet death
- Can remove Admins from the pet's friend list
- Can transfer ownership to an Admin or fully relinquish ownership

## Integrations

- Practice management systems for future appointment syncing
- OneSignal or Firebase for push notifications
- Stripe or Plaid for payment and deposit handling in future versions
- AI services such as OpenAI or custom ML for generating care plans

## Deliverables

- Fully functional mobile app for iOS and Android plus a responsive web portal
- Admin and clinic web dashboard
- Technical documentation and API references
- User onboarding flows with sample data
- Third Party Interface web portal for partner organizations
- Optional demo videos showing key user journeys

## Optional Future Enhancements

- Insurance integration for claims tracking
- Direct pharmacy refills and prescription management
- Wellness scoring and long-term pet health insights
- In-app video consultations
