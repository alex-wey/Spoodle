import pool from './src/lib/db.js';
import { v4 as uuidv4 } from 'uuid';

async function testPetCreate() {
  console.log('Testing direct pg pet creation...\n');
  
  const userId = 'a6eb13a1-1cb0-48be-8815-d9ee9fb5fe84';
  const petId = uuidv4();
  
  const petData = {
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    dateOfBirth: '2020-05-15T00:00:00.000Z',
    weight: 65
  };
  
  console.log('Pet ID:', petId);
  console.log('Owner ID:', userId);
  console.log('Pet Data:', petData);
  console.log();
  
  try {
    const result = await pool.query(
      `INSERT INTO pets (
        id, "ownerId", name, species, breed, "dateOfBirth", 
        gender, "spayedNeutered", weight, "microchipId", 
        allergies, "dietaryRestrictions", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
      ) RETURNING *`,
      [
        petId,
        userId,
        petData.name,
        petData.species,
        petData.breed || null,
        petData.dateOfBirth || null,
        null, // gender
        false, // spayedNeutered
        petData.weight || null,
        null, // microchipId
        [], // allergies (array)
        [] // dietaryRestrictions (array)
      ]
    );
    
    console.log('✅ SUCCESS!');
    console.log('Created pet:', result.rows[0]);
  } catch (error) {
    console.error('❌ ERROR:');
    console.error('Name:', (error as any).name);
    console.error('Message:', (error as any).message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testPetCreate();

