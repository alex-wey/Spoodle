# Clinic Web App Specification

## Initial Screens

### Clinic Staff Onboarding

**Purpose:** Set up secure clinic staff profiles and assign roles

**Navigation:** Accessed from secure onboarding link sent via email to clinic staff

**Functionality:**
- Input profile picture, first name, last name, role (vet, front desk, vet tech, etc.), specialty, start date, email, phone number, password, confirm password
- Display password requirements checklist
- After submission, direct to Clinic Dashboard

### Navigation Menu

**Purpose:** Allow clinic users to seamlessly navigate between all primary modules of the Spoodle platform relevant to their role

**Navigation:** Persistent left-side vertical menu on all screens

**Functionality:**
- Toggles between Primary Screens

### Clinic Dashboard

**Purpose:** Overview of appointments and key metrics

**Navigation:** Landing screen after login or nav bar from other screens

**Functionality:**

**Appointments View:**
- View today's schedule of appointments
- Appointments are split into 3 default fixed types:
  - **Booked**
  - **Pending Discharge**
  - **Discharged**
- Vet should be able to view the list of each type of appointments in a separate column that is scrollable
- Each appointment should be clickable to go to its respective appointment screen

**Appointment Filters:**
- **Clinic vs. Personal View**
  - **Clinic View:** Show all the appointments running through a clinic
  - **Personal View:** Just the appointments the specific vet user is scheduled for
- **Care Professional:** Drop-down selection for veterinarians to select to filter for their appointments
- **Patient Type:** Selections are recurring patient vs new patient
- **Date:** Date should be a selection of one date to another for when the appointment is scheduled for

**Messages:**
- New messages button to click where you can see any incoming messages

**Appointment Cards Display:**
Under each appointment in the column there should be:
- A picture of the pet
- The pet's name
- The type of appointment
- Whether the appointment is for a new client
- A green dot to represent a message sent over

**User Information:**
- Profile picture of the user on the header
- The name of the user
- Whether they are a veterinarian or a vet nurse
- What clinic they belong to
- Access to a home menu
- Show Reports & Metrics

## Primary Screens

### Appointment Management

**Purpose:** Manage appointment bookings

**Navigation:** From dashboard or nav bar

**Functionality:**

**Owner Information:**
- Owner Profile Picture
- Owner Name
- Owner Email
- Owner Phone Number
- Owner information should be clickable to get to the Pet Owner Profile Screen

**Appointment Details:**
- Appointment Date
- Appointment Time
- Veterinarian responsible for appointment
- Nurse assigned to the appointment

**Pet Information:**
- Pet Profile Picture
- Pet Name
- Pet Breed
- Pet Gender
- Fixed/Unfixed Status
- Pet Birthday
- Relevant Pet Information (needs to be premedicated, aggressive, etc.)
- Pet information should be clickable to get to the Pet Profile Screen

**Reason for Appointment:**
- Appointment Type
- Appointment Text Details that the pet owner provides
- Button to see the discharge report and any files associated with the appointment if the appointment is completed
- Button to see the pre-filled questionnaires
- Photos and Videos Owner may have uploaded

**Appointment Management:**
- Appointment Status
- Trash Can button with the ability to delete the appointment
- Home Menu Dropdown option

**Messages Pop-Up:**
- Optional iMessage-like messaging system that you can turn on to communicate with the pet owner regarding the appointment

### Search Screen

**Purpose:** Search for pets and owners who shared records

**Navigation:** From dashboard or nav bar

**Functionality:**
- Traditional search screen with a list of pet owner/pet combinations listed on a scrollable list of rows below the search bar to be able to click as buttons
- The search bar exists to be able to search by pet owner, pet owner contact information, or pet itself
- Toggle to switch between search by pet or pet owner

**Search Results Display:**
- **If searching for pet owners:** Pet owner info should be to the left side of the row and respective pet information should be to the right
- **If searching for pets:** Vice versa for searching for pet

**Pet Owner Information:**
- Pet Owner profile picture, name, email, and phone number should sit on the pet owner side

**Pet Information:**
- Pet Name, Profile Picture, Age, and Breed should be available on the pet side

**Navigation:**
- Pet Owner part of the row should be a clickable button to the respective pet owner screen
- Pet information part of the row should be a clickable button to the respective pet screen

### Patient Records Viewer

**Purpose:** View shared records in detail

**Navigation:** From search results, pet profile, or appointments

**Functionality:** Review documents, add notes, or print

**Features:**
- Popup window that allows a user to look at a file once clicked in Spoodle, including but not exclusive to discharge reports, SOAP notes, diagnostic reports, blood tests, x-rays, etc.
- The window allows the user to view the PDF but also annotate and take notes to the right side of the file
- Print, email, and download buttons in the patient records viewer window

### Pet Profile & History

**Purpose:** View full pet profile and history

**Navigation:** From appointment or search

**Functionality:**

**Pet Data Display:**
- Pet Profile Picture
- Age
- Breed
- Pet Owner (provide the pet owner data as a button that you can click to get to the pet owner screen)
- Spay/Neuter Status

**Medical Records:**
- Most recent discharge report, SOAP notes, and key X-rays & diagnostic reports (blood tests)
- Each of these should be clickable to open a PDF of the respective document with the option to add comments to the document to the right side of the PDF → this popup will be the patient records viewer

**Appointment History:**
- List of past appointments that you can scroll down, each appointment as a row of specific information:
  - Pet Profile Picture
  - Reason For Appointment
  - Date Of Appointment
  - Appointment Status
- Make sure that the rows can be searched and filtered by each data type

**Management Features:**
- Update records
- Add treatments
- Track care adherence

### Pet Owner Profile

**Purpose:** View full pet owner profile and history

**Navigation:** From pet profile screen, records screen, search, or appointment dashboard screen

**Functionality:**

**Pet Owner Data Display:**
- Pet Owner Profile Picture
- Name
- Address
- Email Address
- Phone Number

**Pet List:**
List of Pets, each with:
- Pet Profile Picture
- Age
- Breed

## Secondary Screens

### Reports & Metrics

**Purpose:** Analyze clinic performance

**Navigation:** From dashboard or nav bar

**Functionality:**

**View Trends:**
- Pet Owners deciled by revenue, appointments booked, and more
- Average revenue per appointment
- Average DVM utilization
- Average staff utilization
- Missed appointment data, all of the users who are skipping appointments
- New pet owners vs. recurring pet owner data
- Export reports of these trends
- See cancellations and services data

### Clinic Settings

**Purpose:** Manage clinic and staff settings

**Navigation:** From nav bar or profile dropdown

**Functionality:**

**Personal Settings:**
- Edit personal vet/vet nurse contact info including email, phone number, etc.
- Set personal vet details including vet name, clinic that vet is a part of, how long the vet/vet user has been at the clinic, short biography, specialty (i.e. ophthalmology)

**Admin Functions (if user is an admin):**
- **Calendar Management:** Mark clinic hours and set days off to block timing in booking
- **User Management:** 
  - List of users to be able to invite other clinic accounts via email
  - Remove users from a clinic
  - Promote other users to admin status
