# Pet Owner App Specification

## Initial Screens

### Login/Sign-up

**Purpose:** User authentication screen for logging in or creating a new account

**Navigation:** Serves as app's entrypoint unless valid session token is detected (the user is already logged in)

**Functionality:**
- Email/password input fields with validation
- Toggle between "Login" and "Sign Up" modes
- OAuth options (e.g. sign in with Google/Apple)
- Error handling for failed login attempts (e.g., invalid credentials, existing account)
- "Forgot password" flow linked to email-based password reset
- Persistent session storage (e.g. using secure local storage or cookies)
- Direct to Pet Owner Onboarding upon successful sign-up, or direct to Home Dashboard upon successful login

### Pet Owner Onboarding

**Purpose:** Collect essential information to register a new pet owner account

**Navigation:** Triggered immediately after user sign-up from the main app entry point

**Functionality:**
- Input fields: First Name, Last Name, Phone Number, Email, Address, and optional Referral Code
- Required acceptance of Terms & Conditions
- [Optional] for NYC users: prompt for dog license request through Spoodle (includes integrated payment flow)
- Direct to Home Dashboard upon completion or friend request acceptance

### Navigation Bar

**Purpose:** Navigates between 5 primary screens of the app (see Primary Screens)

**Navigation:** Always present at the bottom of the app unless stated otherwise

**Functionality:**
- Leftmost button is Home Dashboard (home icon)
- Second leftmost button is Pet Profiles (dogs icon)
- Middle button is Appointments (appointment icon)
- Second rightmost button is Notifications (notifications icon)
- Rightmost button is User Profile & Settings (avatar icon)

## Primary Screens

### Home Dashboard

**Purpose:** Provide a centralized summary of each pet's health, care plan, upcoming appointments, and daily tasks

**Navigation:** Default landing screen after Login/Sign-up or Pet Owner Onboarding; accessible via leftmost button on bottom navigation bar

**Functionality:**
- Overview of each pet's current health status, including any alerts or flagged issues
- Display of upcoming appointments (e.g., "Leo's check-up on July 14")
- Display list of daily tasks
- Key highlights from the AI-generated Care Plan (e.g., "Daily brushing recommended")
- Quick-action buttons for fast navigation to: Appointments, Tasks, Records, and Messages

### Pet Profiles

**Purpose:** Stores detailed pet profile information

**Navigation:** Second leftmost button on navigation bar

**Functionality:**

**Create/edit pet profile:**
- Upload pet profile photo
- Input pet name, breed, age, date of birth, spay/neuter status
- Upload health information fields (weight, allergies, dietary restrictions)
- Enter payment information
- Assign creator as pet "owner"
- After creation, redirect to new pet profile

**View appointments:**
- User can see all upcoming appointments
- User can click appointment to see the date, clinic, vet profile, and reason for appointment

**Create/edit tasks:**
- Input type of task
- Set to repeating or one time
- Schedule time
- Save

**Medical document and file management:**
- Upload documents/files:
  - Birth certificate
  - X-ray documents
  - Diagnostics
  - Vaccination history
  - Blood test reports
- Manage linked medical records and document privacy settings

**Share pet records:**
- Button that navigates to Share Pet Records

**Request pet records:**
- Button that navigates to Request Pet Records

**Friend requests:**
- Search for friends by email or phone number
- Can view sent requests

**Settings and permissions:**
- Toggle notification preferences specific to this pet (e.g., enable/disable task reminders, health tips)
- Manage access permissions:
  - View list of friends and admins
  - Add or remove friends and admins
  - Transfer or relinquish ownership to an admin
- Review pet activity logs (e.g., task completions, shared records history)
- Delete pet profile

### Appointments

**Purpose:** Centralized dashboard for scheduled appointments at veterinary clinics

**Navigation:** Accessible via middle button on navigation bar

**Functionality:**
- Default displays list of appointments for each pet
- To book a new appointment, click "+" icon button in top right corner
- Choose pet for appointment booking, which directs user to Appointment Booking

### Notifications

**Purpose:** View reminders and alerts

**Navigation:** Accessible via second rightmost button on navigation bar

**Functionality:** View, mark as read, adjust settings

**Notification Types:**

**Task Reminder**
- **Trigger:** Upcoming task from Task Calendar (e.g., "Time for Max's morning walk")
- Time-based and customizable (e.g., 30 minutes before task)

**Task Overdue**
- **Trigger:** Task not marked as completed by end of scheduled day
- "You missed Toby's training session today. Want to reschedule it?"

**Appointment Confirmation**
- **Trigger:** Successful booking of a new appointment
- "Your appointment with GreenPaws Vet is confirmed for July 15 at 3:00 PM."

**Appointment Reminder**
- **Trigger:** 24 hours and/or 1 hour before confirmed appointment time
- "Reminder: Bella has a vet visit tomorrow at 10:00 AM."

**Appointment Update**
- **Trigger:** Clinic reschedules or cancels appointment
- "GreenPaws Vet rescheduled your appointment to July 18 at 2:30 PM."
- "Your appointment on July 12 has been canceled by the clinic."

**New Record Shared**
- **Trigger:** New medical records shared by clinic or uploaded by another admin or friend
- "New records uploaded for Luna: Vaccine Report."

**Record Request Status Update**
- **Trigger:** External clinic responds to record request
- "Your requested records have been uploaded by Riverdale Animal Hospital."

**Friend Request Received**
- **Trigger:** Another pet owner sends a friend request to access a pet profile
- "You have a new friend request from Emily (emily@spoodle.ai) to join Max's care team."

**Friend Request Accepted**
- **Trigger:** A pending friend request is accepted by the recipient
- "Alex accepted your friend request for Pepper's profile."

**NYC Dog License Update**
- **Trigger:** Status change on license request
- "Your NYC dog license has been issued. Check your email and upload it to complete your profile."

**Referral Program Update**
- **Trigger:** New sign-up or premium purchase attributed to referral code
- "You earned $6.99 from a new premium subscription via your QR code."

**System Update or Feature Announcement**
- **Trigger:** Important updates about Spoodle platform features, maintenance notices, or new releases
- "We've updated Spoodle with new features. Check out what's new!"

**Payment Confirmation**
- **Trigger:** Successful transaction for services like license requests or premium subscriptions
- "Your payment for premium subscription was successful."

### User Profile & Settings

**Purpose:** Users configure their personal profile and settings

**Navigation:** Accessible via rightmost button on navigation bar

**Functionality:**
- Edit personal information: First Name, Last Name, Phone Number, Email, Address
- Update password (with security checks and current password validation)
- Manage notification preferences: push, email, SMS
- View and manage payment methods and billing information
- Access referral code, referral link, and QR code for profit share program
- Track referral earnings and history (total amount made, number of sign-ups)
- Manage connected devices and integrations (e.g., health trackers)
- View terms of service and privacy policy
- Log out
- Delete account permanently (with confirmation steps and data retention warnings)

## Secondary Screens

### Appointment Booking

**Purpose:** Find, select, and book veterinary appointments

**Navigation:** Accessible via "+" icon button in Appointments or quick-action button in Home Dashboard

**Functionality:**

**Filters:**
- Service type (e.g., General Exam, Vaccinations, Dental Cleaning)
- Mile radius distance (1 mi, 5 mi, 10 mi)
- Nearby option

**Search:**
- Displays list of nearby clinics (ordered by distance ascending)
- Search for clinics by name or location via search bar, which will autofill as user enters information
- Displays list of clinics according to search (ordered by distance ascending)

**Booking Flow:**
- Select a clinic, which directs user to a gallery of dates and available time slots
- Once time slot is chosen, user is directed to Appointment Details

### Appointment Details

**Purpose:** View appointment information and confirmation

**Navigation:** Accessible via clinic selected in Appointment Booking or appointment selected from appointment list in Appointments

**Functionality (appointment creation):**

**Appointment overview:**
- Display date, time, and location (with clickable map link)
- Show service type
- Assigned veterinarian or staff (if available)
- Appointment status (Pending or confirmed)

**Pre-Visit preparation:**
- Upload medical records, notes, or special requests
- Complete any required pre-visit questionnaires (if applicable)
- View estimated cost (if pricing data is available)

**Confirmation & notification:**
- Upon confirmation, display pop-up and add to appointments list in Appointments
- Send automated confirmation via email and push notification

**Functionality (appointment management):**
- Edit medical records, notes, or special requests
- Button to reschedule appointment with available new time slots shown
- Button to cancel appointment with clear outline of cancellation policy and any associated fees
- Contact clinic button to call or direct to Messages for in-app messaging

### Share Pet Records

**Purpose:** Share records with a clinic onboarded to Spoodle

**Navigation:** From records screen or pet profile

**Functionality:** Search clinic, confirm share, view share status

**Features:**
- Search for a clinic or third party by name, location, or partner code
- View list of matched clinics or partners, with profile previews and verification status indicators
- Select desired clinic or recipient and confirm selection
- Option to preview all medical records and choose specific documents to include or share all by default
- Display summary of selected files before sending, including document titles, dates, and file types
- Input optional notes or messages to the recipient to provide additional context
- Confirm sharing action with clear security and privacy disclaimers
- Receive confirmation screen showing successful share status and timestamp
- View history of shared records including recipients, dates, and documents sent
- Option to revoke access or resend shared records if needed
- Push notification to confirm records have been viewed or downloaded by the recipient (when supported)

**Management:**
- User can see all clinics with whom they shared pet's records
- User can relinquish access

### Request Pet Records

**Purpose:** Request records from non-Spoodle clinics

**Navigation:** From records screen

**Functionality:** Submit request form, generate email or fax, track status

**Features:**
- Select or confirm the pet profile for which records are being requested
- Search for external clinic by name, location, or contact information (manual entry option available if not found)
- Input required clinic contact details if not auto-filled (e.g., email, fax number, phone)
- Display pre-filled request template summarizing pet and owner information, requested record types (e.g., vaccination records, test results), and any additional notes
- Option to edit or add a personalized message to clinic
- Confirm request details on summary screen before sending
- Display legal and privacy disclaimers to ensure compliance
- Submit request, triggering automated email or fax generation to external clinic
- Receive on-screen confirmation of request submission with estimated response time guidance
- Track status of record request in a dedicated history section (e.g., pending, in progress, completed)
- Receive push notification and email updates when clinic responds or uploads records
- Direct upload option for clinics to securely submit documents to Spoodle via link

## Additional Screens

### Chatbot (Spood)

**Purpose:** AI assistant for answering questions, making suggestions, and executing certain actions

**Navigation:** Accessible by tapping floating green AI chat icon visible on all screens

**Functionality:**
- Open conversational interface to type or voice input questions and receive AI-generated responses
- Suggest relevant actions based on context (e.g., "Would you like to schedule a vet visit?" or "Add a dental cleaning to your care plan?")
- Answer general pet health questions (e.g., "How often should I brush Bella's teeth?")
- Provide tips related to pet's care plan and records (e.g., "Max is due for his flea prevention treatment next week.")

### Report a Bug

**Purpose:** Allow users to report technical or functional issues

**Navigation:** Accessible by tapping floating red bug icon visible on all screens

**Functionality:**
- Clear instructions prompting users to provide detailed information on issue so that team can address ASAP
- Text input field to describe the issue in detail (placeholder text: "What went wrong?")
- Submit button ("Send") that emails the report to technical team
- Confirmation pop-up that report was successfully submitted

## Other Screens

### Task Calendar

**Purpose:** Manage daily and weekly tasks

**Navigation:** From dashboard or nav bar

**Functionality:**
- Add, edit, and complete tasks linked to care plan and reminders
- Manage tasks, view records
- Check tasks off
- Task calendar looks like a Google calendar but with clickable events
- When you click a task, you can see the time it was checked off, who checked it off, and any notes that they left
- You can switch between your pets at the top (they all have circle profile picture icons)
- There is also an option to see all pets

### AI-generated Care Plan

**Purpose:** Display and customize AI-generated care plan

**Navigation:** Linked from dashboard or pet profile

**Functionality:** View care suggestions, customize activities, track progress

**Features:**

**Pet snapshot header:**
- Pet name and profile picture
- Quick status summary (e.g., "All tasks up to date today" or "1 overdue vaccination")

**Care goals section:**
- High-level goals personalized to the pet (e.g., maintain healthy weight, improve dental hygiene, increase daily activity)
- Progress indicators like visual bars or percentage circles

**Task breakdown by frequency:**
- **Daily tasks:** List of recurring activities (e.g., walks, feeding schedule, supplements) with completion checkmarks or status indicators
- **Weekly tasks:** E.g., grooming, longer exercise sessions, training drills
- **Monthly or seasonal tasks:** E.g., flea/tick treatments, wellness exams, vaccine reminders

**Health recommendations:**
- Specific AI-generated suggestions tied to health records and profile data (e.g., "Increase walks to 45 minutes daily due to weight gain," "Add dental chews twice per week")

**Upcoming milestones:**
- Scheduled vaccines, preventive checkups, and seasonal care events

**Editable controls:**
- Customization or skipping of certain tasks (e.g., "Skip grooming this week")
- Toggles to turn tasks on or off

**Integration features:**
- "Add to Calendar" buttons next to each task
- Preview how tasks will appear in daily and weekly views

**Educational content:**
- Rotating tips or mini-guides (e.g., nutrition advice, seasonal care)
- Links to in-app educational articles or modals

**Action buttons:**
- **"Update Plan"** to modify tasks or request a new AI analysis
- **"Share Plan"** to export or share with friends, family, or a vet
