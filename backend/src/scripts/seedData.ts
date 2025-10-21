import db from '../database/crud/index.js';
import { User, Pet, Appointment, Task, MedicalRecord, Clinic, VetProfile } from '../database/entities/index.js';
import bcrypt from 'bcryptjs';

async function seedData() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users: User[] = [
      {
        petOwnerId: 'user-1',
        username: 'sarah_johnson',
        email: 'sarah.johnson@email.com',
        password: hashedPassword,
        phoneNumber: '(555) 123-4567',
        address: '123 Main Street, Anytown, ST 12345',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        petOwnerId: 'user-2',
        username: 'michael_chen',
        email: 'michael.chen@email.com',
        password: hashedPassword,
        phoneNumber: '(555) 234-5678',
        address: '456 Oak Avenue, Springfield, ST 67890',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        petOwnerId: 'user-3',
        username: 'jennifer_wilson',
        email: 'jennifer.wilson@email.com',
        password: hashedPassword,
        phoneNumber: '(555) 345-6789',
        address: '789 Pine Road, Riverside, ST 13579',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        petOwnerId: 'user-4',
        username: 'robert_garcia',
        email: 'robert.garcia@email.com',
        password: hashedPassword,
        phoneNumber: '(555) 456-7890',
        address: '321 Elm Street, Hillcrest, ST 24680',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Create users
    for (const user of users) {
      await db.createUser(user);
    }
    console.log('✅ Created users');

    // Create sample clinics
    const clinics: Clinic[] = [
      {
        clinicId: 'clinic-1',
        name: 'Happy Paws Veterinary Clinic',
        address: '100 Animal Care Drive, Pet City, ST 12345',
        phoneNumber: '(555) 987-6543',
        email: 'info@happypaws.com',
        hours: {
          monday: { open: '08:00', close: '18:00' },
          tuesday: { open: '08:00', close: '18:00' },
          wednesday: { open: '08:00', close: '18:00' },
          thursday: { open: '08:00', close: '18:00' },
          friday: { open: '08:00', close: '18:00' },
          saturday: { open: '09:00', close: '15:00' },
          sunday: null
        },
        services: ['General Medicine', 'Surgery', 'Dentistry', 'Emergency Care', 'Grooming'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        clinicId: 'clinic-2',
        name: 'Animal Wellness Center',
        address: '200 Pet Health Blvd, Vet Town, ST 54321',
        phoneNumber: '(555) 876-5432',
        email: 'contact@animalwellness.com',
        hours: {
          monday: { open: '07:00', close: '19:00' },
          tuesday: { open: '07:00', close: '19:00' },
          wednesday: { open: '07:00', close: '19:00' },
          thursday: { open: '07:00', close: '19:00' },
          friday: { open: '07:00', close: '19:00' },
          saturday: { open: '08:00', close: '16:00' },
          sunday: { open: '09:00', close: '14:00' }
        },
        services: ['General Medicine', 'Specialty Care', 'Physical Therapy', 'Nutrition Counseling'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const clinic of clinics) {
      await db.create<Clinic>('clinics', clinic);
    }
    console.log('✅ Created clinics');

    // Create vet profiles
    const vets: VetProfile[] = [
      {
        vetId: 'vet-1',
        firstName: 'Dr. Sarah',
        lastName: 'Chen',
        clinicId: 'clinic-1',
        role: 'veterinarian',
        isAdmin: true,
        phoneNumber: '(555) 111-2222',
        email: 'sarah.chen@happypaws.com',
        specialty: 'Internal Medicine',
        biography: 'Dr. Chen has 10 years of experience in veterinary medicine with a focus on internal medicine.',
        startDate: '2014-01-15',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        vetId: 'vet-2',
        firstName: 'Dr. Michael',
        lastName: 'Martinez',
        clinicId: 'clinic-1',
        role: 'veterinarian',
        isAdmin: false,
        phoneNumber: '(555) 333-4444',
        email: 'michael.martinez@happypaws.com',
        specialty: 'Surgery',
        biography: 'Dr. Martinez specializes in surgical procedures and emergency care.',
        startDate: '2018-06-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        vetId: 'vet-3',
        firstName: 'Dr. Lisa',
        lastName: 'Wilson',
        clinicId: 'clinic-2',
        role: 'veterinarian',
        isAdmin: true,
        phoneNumber: '(555) 555-6666',
        email: 'lisa.wilson@animalwellness.com',
        specialty: 'Dentistry',
        biography: 'Dr. Wilson is a board-certified veterinary dentist with extensive experience.',
        startDate: '2012-03-10',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const vet of vets) {
      await db.create<VetProfile>('vetProfiles', vet);
    }
    console.log('✅ Created vet profiles');

    // Create sample pets with comprehensive demographics
    const pets: Pet[] = [
      {
        petId: 'pet-1',
        ownerId: 'user-1',
        name: 'Max',
        breed: 'Golden Retriever',
        age: 3,
        dateOfBirth: '2021-03-15',
        gender: 'male',
        spayedNeutered: true,
        weight: 65.5,
        allergies: ['Chicken', 'Dust mites'],
        dietaryRestrictions: ['Grain-free diet recommended'],
        profilePhoto: '/assets/pets/golden-retriever.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        petId: 'pet-2',
        ownerId: 'user-2',
        name: 'Whiskers',
        breed: 'Tabby Cat',
        age: 2,
        dateOfBirth: '2022-07-20',
        gender: 'female',
        spayedNeutered: true,
        weight: 8.2,
        allergies: ['Fish'],
        dietaryRestrictions: ['Indoor cat formula'],
        profilePhoto: '/assets/pets/tabby-cat.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        petId: 'pet-3',
        ownerId: 'user-3',
        name: 'Rocky',
        breed: 'German Shepherd',
        age: 4,
        dateOfBirth: '2020-01-10',
        gender: 'male',
        spayedNeutered: false,
        weight: 75.8,
        allergies: [],
        dietaryRestrictions: ['High-protein diet'],
        profilePhoto: '/assets/pets/german-shepherd.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        petId: 'pet-4',
        ownerId: 'user-4',
        name: 'Bella',
        breed: 'Border Collie',
        age: 5,
        dateOfBirth: '2019-05-12',
        gender: 'female',
        spayedNeutered: true,
        weight: 45.2,
        allergies: ['Wheat'],
        dietaryRestrictions: ['Active dog formula'],
        profilePhoto: '/assets/pets/border-collie.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        petId: 'pet-5',
        ownerId: 'user-1',
        name: 'Luna',
        breed: 'Labrador Mix',
        age: 1,
        dateOfBirth: '2023-08-05',
        gender: 'female',
        spayedNeutered: false,
        weight: 35.0,
        allergies: [],
        dietaryRestrictions: ['Puppy formula'],
        profilePhoto: '/assets/pets/labrador-mix.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        petId: 'pet-6',
        ownerId: 'user-2',
        name: 'Mittens',
        breed: 'Persian Cat',
        age: 6,
        dateOfBirth: '2018-11-30',
        gender: 'female',
        spayedNeutered: true,
        weight: 10.5,
        allergies: ['Dairy'],
        dietaryRestrictions: ['Hairball control formula'],
        profilePhoto: '/assets/pets/persian-cat.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        petId: 'pet-7',
        ownerId: 'user-3',
        name: 'Duke',
        breed: 'Great Dane',
        age: 2,
        dateOfBirth: '2022-02-14',
        gender: 'male',
        spayedNeutered: true,
        weight: 120.3,
        allergies: ['Corn'],
        dietaryRestrictions: ['Large breed formula'],
        profilePhoto: '/assets/pets/great-dane.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        petId: 'pet-8',
        ownerId: 'user-4',
        name: 'Shadow',
        breed: 'Black Labrador',
        age: 7,
        dateOfBirth: '2017-09-08',
        gender: 'male',
        spayedNeutered: true,
        weight: 70.1,
        allergies: ['Beef'],
        dietaryRestrictions: ['Senior dog formula'],
        profilePhoto: '/assets/pets/black-lab.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const pet of pets) {
      await db.createPet(pet);
    }
    console.log('✅ Created pets with comprehensive demographics');

    // Create sample appointments
    const appointments: Appointment[] = [
      {
        appointmentId: 'apt-1',
        petOwnerId: 'user-1',
        petId: 'pet-1',
        clinicId: 'clinic-1',
        vetId: 'vet-1',
        scheduledTime: '2024-12-20T09:00:00Z',
        scheduledDuration: 30,
        status: 'confirmed',
        appointmentType: 'general_exam',
        reason: 'Annual checkup and vaccination',
        notes: 'Patient is due for DHPP and Rabies vaccines',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        appointmentId: 'apt-2',
        petOwnerId: 'user-2',
        petId: 'pet-2',
        clinicId: 'clinic-1',
        vetId: 'vet-2',
        scheduledTime: '2024-12-21T14:30:00Z',
        scheduledDuration: 45,
        status: 'pending',
        appointmentType: 'dental',
        reason: 'Teeth cleaning and dental exam',
        notes: 'First dental cleaning, may need extractions',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        appointmentId: 'apt-3',
        petOwnerId: 'user-3',
        petId: 'pet-3',
        clinicId: 'clinic-2',
        vetId: 'vet-3',
        scheduledTime: '2024-12-22T10:15:00Z',
        scheduledDuration: 60,
        status: 'confirmed',
        appointmentType: 'surgery',
        reason: 'Neutering procedure',
        notes: 'Pre-surgery blood work completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const appointment of appointments) {
      await db.createAppointment(appointment);
    }
    console.log('✅ Created appointments');

    // Create sample tasks
    const tasks: Task[] = [
      {
        taskId: 'task-1',
        petId: 'pet-1',
        ownerId: 'user-1',
        type: 'walk',
        title: 'Morning walk',
        description: '30-minute walk around the neighborhood',
        scheduledTime: '2024-12-20T07:00:00Z',
        completionStatus: false,
        recurring: true,
        recurrencePattern: 'daily',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        taskId: 'task-2',
        petId: 'pet-2',
        ownerId: 'user-2',
        type: 'feed',
        title: 'Evening feeding',
        description: 'Wet food meal',
        scheduledTime: '2024-12-20T18:00:00Z',
        completionStatus: true,
        completedAt: '2024-12-20T18:05:00Z',
        completedBy: 'michael_chen',
        recurring: true,
        recurrencePattern: 'daily',
        notes: 'Ate well, finished entire portion',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        taskId: 'task-3',
        petId: 'pet-3',
        ownerId: 'user-3',
        type: 'medicate',
        title: 'Heartworm prevention',
        description: 'Monthly heartworm tablet',
        scheduledTime: '2024-12-25T09:00:00Z',
        completionStatus: false,
        recurring: true,
        recurrencePattern: 'monthly',
        notes: 'Give with food to prevent stomach upset',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const task of tasks) {
      await db.createTask(task);
    }
    console.log('✅ Created tasks');

    // Create sample medical records
    const medicalRecords: MedicalRecord[] = [
      {
        recordId: 'record-1',
        petId: 'pet-1',
        ownerId: 'user-1',
        fileType: 'vaccination',
        fileName: 'max_vaccination_record_2024.pdf',
        fileUrl: '/uploads/max_vaccination_record_2024.pdf',
        uploadDate: '2024-09-10T10:30:00Z',
        description: 'Annual vaccination record including DHPP and Rabies',
        clinicId: 'clinic-1',
        vetId: 'vet-1'
      },
      {
        recordId: 'record-2',
        petId: 'pet-2',
        ownerId: 'user-2',
        fileType: 'medical_history',
        fileName: 'whiskers_health_history.pdf',
        fileUrl: '/uploads/whiskers_health_history.pdf',
        uploadDate: '2024-08-15T14:20:00Z',
        description: 'Complete medical history and previous treatments',
        clinicId: 'clinic-1',
        vetId: 'vet-1'
      },
      {
        recordId: 'record-3',
        petId: 'pet-3',
        ownerId: 'user-3',
        fileType: 'blood_work',
        fileName: 'rocky_blood_test_2024.pdf',
        fileUrl: '/uploads/rocky_blood_test_2024.pdf',
        uploadDate: '2024-11-05T09:15:00Z',
        description: 'Pre-surgery blood work results',
        clinicId: 'clinic-2',
        vetId: 'vet-3'
      }
    ];

    for (const record of medicalRecords) {
      await db.create<MedicalRecord>('medicalRecords', record);
    }
    console.log('✅ Created medical records');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🏥 Clinics: ${clinics.length}`);
    console.log(`👨‍⚕️ Veterinarians: ${vets.length}`);
    console.log(`🐾 Pets: ${pets.length}`);
    console.log(`📅 Appointments: ${appointments.length}`);
    console.log(`📋 Tasks: ${tasks.length}`);
    console.log(`📄 Medical Records: ${medicalRecords.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedData;
