import db from '../database/crud/index.js';
import { Pet, User } from '../database/entities/index.js';

async function showPetTable() {
  console.log('🐾 Pet Demographics Table\n');
  console.log('=' .repeat(120));
  
  try {
    // Get all pets
    const pets = await db.findAll<Pet>('pets');
    const users = await db.findAll<User>('users');
    
    // Create user lookup map
    const userMap = new Map(users.map(user => [user.petOwnerId, user]));
    
    // Calculate age from date of birth
    function calculateAge(dateOfBirth: string | undefined): string {
      if (!dateOfBirth) return 'N/A';
      const birth = new Date(dateOfBirth);
      const today = new Date();
      const ageInYears = Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const ageInMonths = Math.floor((today.getTime() - birth.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
      
      if (ageInYears >= 1) {
        return `${ageInYears} year${ageInYears > 1 ? 's' : ''}`;
      } else {
        return `${ageInMonths} month${ageInMonths > 1 ? 's' : ''}`;
      }
    }
    
    // Format weight
    function formatWeight(weight: number | undefined): string {
      if (!weight) return 'N/A';
      return `${weight} lbs`;
    }
    
    // Format allergies
    function formatAllergies(allergies: string[] | undefined): string {
      if (!allergies || allergies.length === 0) return 'None';
      return allergies.join(', ');
    }
    
    // Header
    console.log(
      'Pet Name'.padEnd(15) +
      'Owner'.padEnd(20) +
      'Breed'.padEnd(20) +
      'Date of Birth'.padEnd(15) +
      'Age'.padEnd(12) +
      'Gender'.padEnd(8) +
      'Weight'.padEnd(10) +
      'Spayed/Neutered'.padEnd(15) +
      'Allergies'.padEnd(25)
    );
    console.log('-'.repeat(120));
    
    // Data rows
    pets.forEach(pet => {
      const owner = userMap.get(pet.ownerId);
      const ownerName = owner ? `${owner.username}` : 'Unknown';
      const age = calculateAge(pet.dateOfBirth);
      const weight = formatWeight(pet.weight);
      const spayNeuter = pet.spayedNeutered ? 'Yes' : 'No';
      const allergies = formatAllergies(pet.allergies);
      
      console.log(
        (pet.name || 'N/A').padEnd(15) +
        (ownerName || 'N/A').padEnd(20) +
        (pet.breed || 'Mixed').padEnd(20) +
        (pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : 'N/A').padEnd(15) +
        age.padEnd(12) +
        (pet.gender || 'N/A').padEnd(8) +
        weight.padEnd(10) +
        spayNeuter.padEnd(15) +
        allergies.padEnd(25)
      );
    });
    
    console.log('-'.repeat(120));
    console.log(`\n📊 Total Pets: ${pets.length}`);
    
    // Summary statistics
    const genderCounts = pets.reduce((acc, pet) => {
      const gender = pet.gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const breedCounts = pets.reduce((acc, pet) => {
      const breed = pet.breed || 'Mixed';
      acc[breed] = (acc[breed] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalWeight = pets.reduce((sum, pet) => sum + (pet.weight || 0), 0);
    const avgWeight = pets.length > 0 ? totalWeight / pets.length : 0;
    
    console.log('\n📈 Summary Statistics:');
    console.log(`Average Weight: ${avgWeight.toFixed(1)} lbs`);
    console.log(`Gender Distribution: ${Object.entries(genderCounts).map(([gender, count]) => `${gender}: ${count}`).join(', ')}`);
    console.log(`Most Common Breeds: ${Object.entries(breedCounts).sort(([,a], [,b]) => b - a).slice(0, 3).map(([breed, count]) => `${breed} (${count})`).join(', ')}`);
    
    const spayedNeuteredCount = pets.filter(pet => pet.spayedNeutered).length;
    console.log(`Spayed/Neutered: ${spayedNeuteredCount}/${pets.length} (${((spayedNeuteredCount/pets.length)*100).toFixed(1)}%)`);
    
    const petsWithAllergies = pets.filter(pet => pet.allergies && pet.allergies.length > 0).length;
    console.log(`Pets with Allergies: ${petsWithAllergies}/${pets.length} (${((petsWithAllergies/pets.length)*100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('❌ Error displaying pet table:', error);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  showPetTable()
    .then(() => {
      console.log('\n✅ Pet table displayed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to display pet table:', error);
      process.exit(1);
    });
}

export default showPetTable;
