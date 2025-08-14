import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organizationName,
      organizationType,
      email,
      password,
      phone,
      address,
      city,
      state,
      zipCode,
      businessLicense,
      description
    } = body

    // Validate required fields
    if (!organizationName || !organizationType || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          type: organizationType,
          description: description || '',
          email,
          phone: phone || '',
          address: address || '',
          city: city || '',
          state: state || '',
          zipCode: zipCode || '',
          businessLicense: businessLicense || '',
          status: 'PENDING'
        }
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name: organizationName, // Use organization name as user name initially
          password: hashedPassword,
          role: 'ADMIN', // First user is admin
          organizationId: organization.id,
          isActive: true
        },
        include: {
          organization: true
        }
      })

      return { user, organization }
    })

    // Return success response
    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        organizationId: result.user.organizationId
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        type: result.organization.type,
        status: result.organization.status
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
