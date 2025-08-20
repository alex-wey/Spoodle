import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      )
    }

    console.log('Validating token for email:', email)

    // Find user with the email and reset token
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      console.log('User not found or no reset token')
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date() > user.resetTokenExpiry) {
      console.log('Token has expired')
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    console.log('Token not expired, verifying...')

    // Verify the token
    const isValidToken = await bcrypt.compare(token, user.resetToken)

    console.log('Token validation result:', isValidToken)

    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Token is valid' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Validate reset token error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
