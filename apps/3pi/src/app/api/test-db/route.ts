import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const organizationCount = await prisma.organization.count()
    
    return NextResponse.json({
      message: 'Database connection successful',
      stats: {
        users: userCount,
        organizations: organizationCount
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { error: 'Database connection failed', details: error },
      { status: 500 }
    )
  }
}
