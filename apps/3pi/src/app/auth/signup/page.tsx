'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    businessLicense: '',
    description: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationName: formData.organizationName,
          organizationType: formData.organizationType,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          businessLicense: formData.businessLicense,
          description: formData.description
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Account created successfully - automatically log in the user
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.error) {
        // If auto-login fails, redirect to signin page
        router.push('/auth/signin?message=Account created successfully! Please sign in with your credentials.')
      } else {
        // Auto-login successful - redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Create Your Partner Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Spoodle's network of trusted pet care partners
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Information */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">Organization Name *</label>
                <input
                  id="organizationName"
                  type="text"
                  name="organizationName"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.organizationName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700">Organization Type *</label>
                <select
                  id="organizationType"
                  name="organizationType"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.organizationType}
                  onChange={handleChange}
                >
                  <option value="">Select type</option>
                  <option value="SHELTER">Animal Shelter</option>
                  <option value="PET_STORE">Pet Store</option>
                  <option value="VETERINARY_CLINIC">Veterinary Clinic</option>
                  <option value="GROOMER">Pet Groomer</option>
                  <option value="TRAINER">Pet Trainer</option>
                  <option value="AIRPORT">Airport</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of your organization..."
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <input
                id="address"
                type="text"
                name="address"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">ZIP Code</label>
                <input
                  id="zipCode"
                  type="text"
                  name="zipCode"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.zipCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password *</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={8}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="businessLicense" className="block text-sm font-medium text-gray-700">Business License Number</label>
              <input
                id="businessLicense"
                type="text"
                name="businessLicense"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.businessLicense}
                onChange={handleChange}
                placeholder="Optional - for verification purposes"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
              Already have an account? Sign in
            </Link>
            
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
