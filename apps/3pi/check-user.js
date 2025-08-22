const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: 'jj@vonoiste.com'
      },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        createdAt: true
      }
    })

    if (user) {
      console.log('✅ User found:')
      console.log('ID:', user.id)
      console.log('Email:', user.email)
      console.log('Name:', user.name)
      console.log('Created:', user.createdAt)
      console.log('Password Hash:', user.password)
      console.log('\n🔍 Password hash starts with:', user.password.substring(0, 20) + '...')
    } else {
      console.log('❌ User not found: jj@vonoiste.com')
    }
  } catch (error) {
    console.error('Error checking user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
