import db from '../database/crud/index.js';
import { Pet } from '../database/entities/index.js';
import { v4 as uuidv4 } from 'uuid';

async function addNewPets() {
  console.log('🐾 Adding new pets to the database...');

  try {
    // Get existing users to assign pets to
    const users = await db.findAll('users');
    if (users.length === 0) {
      console.log('❌ No users found. Please run seed script first.');
      return;
    }

    // New pets to add
    const newPets: Omit<Pet, 'createdAt' | 'updatedAt'>[] = [
      {
        petId: uuidv4(),
        ownerId: users[0].petOwnerId, // Assign to first user (Sarah Johnson)
        name: 'Buddy',
        breed: 'Labrador Retriever',
        dateOfBirth: '2023-06-15',
        gender: 'male',
        spayedNeutered: false,
        weight: 55.2,
        allergies: [],
        dietaryRestrictions: ['Puppy formula']
      },
      {
        petId: uuidv4(),
        ownerId: users[1]?.petOwnerId || users[0].petOwnerId, // Assign to second user or first
        name: 'Princess',
        breed: 'Maine Coon',
        dateOfBirth: '2022-03-20',
        gender: 'female',
        spayedNeutered: true,
        weight: 12.8,
        allergies: ['Fish'],
        dietaryRestrictions: ['Indoor cat formula']
      },
      {
        petId: uuidv4(),
        ownerId: users[0].petOwnerId, // Assign to first user
        name: 'Charlie',
        breed: 'French Bulldog',
        dateOfBirth: '2024-01-10',
        gender: 'male',
        spayedNeutered: false,
        weight: 28.5,
        allergies: ['Chicken'],
        dietaryRestrictions: ['Grain-free diet']
      },
      {
        petId: uuidv4(),
        ownerId: users[2]?.petOwnerId || users[0].petOwnerId, // Assign to third user or first
        name: 'Luna',
        breed: 'Siberian Husky',
        dateOfBirth: '2021-11-05',
        gender: 'female',
        spayedNeutered: true,
        weight: 45.7,
        allergies: ['Dairy'],
        dietaryRestrictions: ['Active dog formula']
      }
    ];

    // Add each pet to the database
    const addedPets: Pet[] = [];
    for (const petData of newPets) {
      const newPet = await db.createPet(petData);
      addedPets.push(newPet);
      console.log(`✅ Added pet: ${newPet.name} (${newPet.breed})`);
    }

    console.log(`\n🎉 Successfully added ${addedPets.length} new pets!`);
    
    // Show updated pet count
    const allPets = await db.findAll<Pet>('pets');
    console.log(`📊 Total pets in database: ${allPets.length}`);

    // Show the new pets
    console.log('\n📋 Newly Added Pets:');
    addedPets.forEach(pet => {
      console.log(`- ${pet.name} (${pet.breed}) - ${pet.gender} - ${pet.weight}lbs`);
    });

  } catch (error) {
    console.error('❌ Error adding new pets:', error);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addNewPets()
    .then(() => {
      console.log('\n✅ Pet addition completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to add pets:', error);
      process.exit(1);
    });
}

export default addNewPets;
