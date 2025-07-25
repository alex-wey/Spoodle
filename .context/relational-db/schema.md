# Spoodle Database Schema

## Overview
This document outlines the relational database schema for the Spoodle pet health and records platform, including tables for users, pets, medical records, appointments, clinics, and third-party partners.

## Table Schemas

### Users
**Purpose:** Store pet owner account information

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `petOwnerId` | INT | Primary Key | Unique identifier for pet owner |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | User's chosen username |
| `password` | VARCHAR(255) | NOT NULL, SENSITIVE | Encrypted password hash |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Pet owner's email address |
| `phoneNumber` | VARCHAR(20) | | Pet owner's phone number |
| `address` | TEXT | | Pet owner's physical address |

**Primary Key:** `petOwnerId`

---

### Pets
**Purpose:** Store individual pet profile information

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `petId` | INT | Primary Key | Unique identifier for pet |
| `ownerId` | INT | Foreign Key, NOT NULL | References `Users.petOwnerId` |
| `name` | VARCHAR(100) | NOT NULL | Pet's name |
| `breed` | VARCHAR(100) | | Pet's breed |
| `age` | INT | | Pet's current age in years |
| `dateOfBirth` | DATE | | Pet's date of birth |

**Primary Key:** `petId`  
**Foreign Keys:** `ownerId` → `Users.petOwnerId`

---

### Medical Records
**Purpose:** Store pet medical documents and files

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `recordId` | INT | Primary Key | Unique identifier for medical record |
| `petId` | INT | Foreign Key, NOT NULL | References `Pets.petId` |
| `ownerId` | INT | Foreign Key, NOT NULL | References `Users.petOwnerId` |
| `fileType` | ENUM | NOT NULL | Type of medical record |
| `uploadDate` | TIMESTAMP | NOT NULL, UTC | When the record was uploaded |

**Primary Key:** `recordId`  
**Foreign Keys:** 
- `petId` → `Pets.petId`
- `ownerId` → `Users.petOwnerId`

**File Type Values:**
- `medical history`
- `vaccination`
- `medication`
- `surgical`

---

### Tasks
**Purpose:** Store pet care tasks and schedules

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `taskId` | INT | Primary Key | Unique identifier for task |
| `petId` | INT | Foreign Key, NOT NULL | References `Pets.petId` |
| `ownerId` | INT | Foreign Key, NOT NULL | References `Users.petOwnerId` |
| `type` | ENUM | NOT NULL | Type of care task |
| `scheduledTime` | TIMESTAMP | NOT NULL | When task is scheduled |
| `completionStatus` | BOOLEAN | DEFAULT FALSE | Whether task is completed |

**Primary Key:** `taskId`  
**Foreign Keys:** 
- `petId` → `Pets.petId`
- `ownerId` → `Users.petOwnerId`

**Task Type Values:**
- `walk`
- `feed`
- `medicate`

---

### Appointments
**Purpose:** Store veterinary appointment information

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `appointmentId` | INT | Primary Key | Unique identifier for appointment |
| `petID-clinicID` | VARCHAR(50) | Secondary Key | Composite key for pet-clinic relationship |
| `scheduledTime` | TIMESTAMP | NOT NULL | Appointment date and time |
| `scheduledDuration` | INT | | Appointment duration in minutes |
| `Status` | ENUM | NOT NULL | Current appointment status |
| `petOwnerId` | INT | Foreign Key, NOT NULL | References `Users.petOwnerId` |
| `vetID` | INT | Foreign Key, NOT NULL | References `Vet Profiles.vetId` |
| `dischargedDate` | TIMESTAMP | | When pet was discharged |

**Primary Key:** `appointmentId`  
**Secondary Key:** `petID-clinicID`  
**Foreign Keys:** 
- `petOwnerId` → `Users.petOwnerId`
- `vetID` → `Vet Profiles.vetId`

---

### Clinics
**Purpose:** Store veterinary clinic information

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `clinicId` | INT | Primary Key | Unique identifier for clinic |
| `address` | TEXT | NOT NULL | Clinic's physical address |
| `hours` | JSON | | Clinic operating hours |
| `staffAccounts` | JSON | | List of associated staff accounts |

**Primary Key:** `clinicId`

---

### Vet Profiles
**Purpose:** Store veterinarian and clinic staff information

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `vetId` | INT | Primary Key | Unique identifier for veterinarian |
| `firstName` | VARCHAR(50) | NOT NULL | Veterinarian's first name |
| `lastName` | VARCHAR(50) | NOT NULL | Veterinarian's last name |
| `clinicId` | INT | Foreign Key, NOT NULL | References `Clinics.clinicId` |
| `admin` | BOOLEAN | DEFAULT FALSE | Whether user has admin privileges |
| `phoneNumber` | VARCHAR(20) | | Veterinarian's phone number |

**Primary Key:** `vetId`  
**Foreign Keys:** `clinicId` → `Clinics.clinicId`

---

### Notifications
**Purpose:** Store user notifications and alerts

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `notificationId` | INT | Primary Key | Unique identifier for notification |
| `notificationType` | ENUM | NOT NULL | Type of notification |
| `userId` | INT | Foreign Key | References `Users.petOwnerId` |
| `petOwnerId` | INT | Foreign Key | References `Users.petOwnerId` |

**Primary Key:** `notificationId`  
**Foreign Keys:** 
- `userId` → `Users.petOwnerId`
- `petOwnerId` → `Users.petOwnerId`

## Relationships Summary

### One-to-Many Relationships
- **Users** → **Pets** (One pet owner can have multiple pets)
- **Pets** → **Medical Records** (One pet can have multiple medical records)
- **Pets** → **Tasks** (One pet can have multiple tasks)
- **Users** → **Appointments** (One pet owner can have multiple appointments)
- **Clinics** → **Vet Profiles** (One clinic can have multiple veterinarians)
- **Users** → **Notifications** (One user can have multiple notifications)

### Many-to-Many Relationships
- **Pets** ↔ **Clinics** (Through appointments - pets can visit multiple clinics, clinics can see multiple pets)

## Indexes Recommendations

### Primary Indexes
- All primary keys are automatically indexed

### Secondary Indexes
- `Users.email` - for login lookups
- `Pets.ownerId` - for owner's pet queries
- `Medical Records.petId` - for pet record lookups
- `Tasks.petId, Tasks.scheduledTime` - for task scheduling queries
- `Appointments.petOwnerId, Appointments.scheduledTime` - for appointment queries
- `Vet Profiles.clinicId` - for clinic staff queries
- `Third Party Partners.referralCode` - for referral lookups