'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components';

interface VerificationFormData {
  organizationName: string;
  organizationType: 'shelter' | 'pet-store' | 'airport' | 'referral-partner';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  website?: string;
}

export default function VerificationPage() {
  const [step, setStep] = useState<'form' | 'upload' | 'review' | 'submitted'>('form');
  const [formData, setFormData] = useState<VerificationFormData>({
    organizationName: '',
    organizationType: 'shelter',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    website: '',
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof VerificationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setDocuments(Array.from(files));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setStep('submitted');
  };

  const renderForm = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Organization Verification</CardTitle>
        <CardDescription>
          Complete your organization profile to get verified and start using Spoodle&apos;s Third Party Interface.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => handleInputChange('organizationName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Type *
            </label>
            <select
              value={formData.organizationType}
              onChange={(e) => handleInputChange('organizationType', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="shelter">Animal Shelter</option>
              <option value="pet-store">Pet Store</option>
              <option value="airport">Airport</option>
              <option value="referral-partner">Referral Partner</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province *
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP/Postal Code *
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Primary Contact (Admin)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.adminFirstName}
                onChange={(e) => handleInputChange('adminFirstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.adminLastName}
                onChange={(e) => handleInputChange('adminLastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.adminEmail}
                onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.adminPhone}
                onChange={(e) => handleInputChange('adminPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => setStep('upload')}
          disabled={!formData.organizationName || !formData.address || !formData.adminEmail}
          className="w-full"
        >
          Continue to Document Upload
        </Button>
      </CardFooter>
    </Card>
  );

  const renderUpload = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <CardDescription>
          Upload required verification documents to complete your organization verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-800 mb-2">Required Documents:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Business license or registration certificate</li>
              <li>• Tax identification documents</li>
              <li>• Proof of address (utility bill, lease agreement)</li>
              <li>• Government-issued ID for primary contact</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Documents *
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-sm text-gray-500 mt-1">
              Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
            </p>
          </div>

          {documents.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Uploaded Documents:</h4>
              <ul className="space-y-1">
                {documents.map((doc, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{doc.name}</span>
                    <span className="text-xs text-green-600">✓ Uploaded</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="font-medium text-yellow-800 mb-2">Security & Compliance Notice:</h4>
          <p className="text-sm text-yellow-700">
            All uploaded documents are encrypted and stored securely. Your information will only be used for verification purposes 
            and will not be shared with third parties without your explicit consent.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex space-x-3">
        <Button 
          variant="outline" 
          onClick={() => setStep('form')}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={() => setStep('review')}
          disabled={documents.length === 0}
          className="flex-1"
        >
          Review & Submit
        </Button>
      </CardFooter>
    </Card>
  );

  const renderReview = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
        <CardDescription>
          Please review your information before submitting for verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Organization Details</h4>
            <div className="bg-gray-50 p-3 rounded">
              <p><strong>Name:</strong> {formData.organizationName}</p>
              <p><strong>Type:</strong> {formData.organizationType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              <p><strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zipCode}, {formData.country}</p>
              {formData.website && <p><strong>Website:</strong> {formData.website}</p>}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Primary Contact</h4>
            <div className="bg-gray-50 p-3 rounded">
              <p><strong>Name:</strong> {formData.adminFirstName} {formData.adminLastName}</p>
              <p><strong>Email:</strong> {formData.adminEmail}</p>
              <p><strong>Phone:</strong> {formData.adminPhone}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Documents</h4>
            <div className="bg-gray-50 p-3 rounded">
              <p><strong>Uploaded:</strong> {documents.length} document(s)</p>
              <ul className="text-sm text-gray-600 mt-1">
                {documents.map((doc, index) => (
                  <li key={index}>• {doc.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            By submitting this verification request, you agree to Spoodle&apos;s terms of service and privacy policy. 
            Verification typically takes 2-3 business days.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex space-x-3">
        <Button 
          variant="outline" 
          onClick={() => setStep('upload')}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit}
          isLoading={isSubmitting}
          className="flex-1"
        >
          Submit for Verification
        </Button>
      </CardFooter>
    </Card>
  );

  const renderSubmitted = () => (
    <Card className="max-w-2xl mx-auto text-center">
      <CardHeader>
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <CardTitle className="text-green-600">Verification Request Submitted!</CardTitle>
        <CardDescription>
          Thank you for submitting your organization verification request.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-left bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">What happens next?</h4>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Our verification team will review your documents (2-3 business days)</li>
            <li>2. You&apos;ll receive email updates on your verification status</li>
            <li>3. Once approved, you&apos;ll get access to your partner dashboard</li>
            <li>4. You can start inviting staff members and using Spoodle&apos;s tools</li>
          </ol>
        </div>
        
        <div className="text-left bg-blue-50 p-4 rounded">
          <h4 className="font-medium mb-2">Need help?</h4>
          <p className="text-sm text-blue-700">
            Contact our support team at <a href="mailto:support@spoodle.com" className="underline">support@spoodle.com</a> 
            or call <a href="tel:+1-800-SPOODLE" className="underline">1-800-SPOODLE</a>
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => window.location.href = '/'}
          className="w-full"
        >
          Return to Home
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Organization Verification
          </h1>
          <p className="text-muted-foreground">
            Complete your setup to access Spoodle&apos;s Third Party Interface
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step === 'form' || step === 'upload' || step === 'review' || step === 'submitted' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'form' || step === 'upload' || step === 'review' || step === 'submitted' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Organization Info</span>
            </div>
            <div className={`flex-1 h-0.5 ${step === 'upload' || step === 'review' || step === 'submitted' ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step === 'upload' || step === 'review' || step === 'submitted' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' || step === 'review' || step === 'submitted' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Documents</span>
            </div>
            <div className={`flex-1 h-0.5 ${step === 'review' || step === 'submitted' ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step === 'review' || step === 'submitted' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' || step === 'submitted' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        {step === 'form' && renderForm()}
        {step === 'upload' && renderUpload()}
        {step === 'review' && renderReview()}
        {step === 'submitted' && renderSubmitted()}
      </div>
    </div>
  );
}
