import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { sendEmail, createPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // For security reasons, don't reveal if the email exists or not
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      )
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = await bcrypt.hash(resetToken, 10)
    
    // Set expiration (1 hour from now)
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)

    // Store the reset token in the database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry: resetTokenExpiry,
      }
    })

    const resetUrl = `http://localhost:3000/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    // Send password reset email
    const { subject, html } = createPasswordResetEmail(email, resetUrl)
    const emailResult = await sendEmail({
      to: email,
      subject,
      html
    })

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, a password reset link has been sent.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
