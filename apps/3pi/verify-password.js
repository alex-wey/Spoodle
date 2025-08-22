const bcrypt = require('bcrypt')

async function verifyPassword() {
  const storedHash = '$2b$10$cnEa1C1V9KVKsHnxZrFOBut.iN5FkkcaVmRUVJnVyPMkB/1pe9KCK'
  const testPassword = 'Spoodle123$'
  
  try {
    const isMatch = await bcrypt.compare(testPassword, storedHash)
    
    console.log('🔐 Password Verification:')
    console.log('Test Password:', testPassword)
    console.log('Stored Hash:', storedHash)
    console.log('Hash starts with:', storedHash.substring(0, 20) + '...')
    console.log('\n✅ Password Match:', isMatch ? 'YES' : 'NO')
    
    if (isMatch) {
      console.log('🎉 The password "Spoodle123$" is correct for jj@vonoiste.com!')
    } else {
      console.log('❌ The password "Spoodle123$" is NOT correct for jj@vonoiste.com')
      console.log('💡 You may need to reset the password or check what the correct password is')
    }
    
  } catch (error) {
    console.error('Error verifying password:', error)
  }
}

verifyPassword()
