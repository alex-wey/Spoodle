'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Badge, Skeleton } from '@/components';
import { apiService } from '@/lib/api';

interface PetRegistrationForm {
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'other';
  breed: string;
  age: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  microchipNumber?: string;
  spayNeuterStatus: 'spayed' | 'neutered' | 'intact' | 'unknown';
  description?: string;
  specialNeeds?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: {
    conditions: string[];
    medications: string[];
    allergies: string[];
  };
}

export default function RegisterPetPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PetRegistrationForm>({
    name: '',
    type: 'dog',
    breed: '',
    age: 0,
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    microchipNumber: '',
    spayNeuterStatus: 'unknown',
    description: '',
    specialNeeds: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
    medicalHistory: {
      conditions: [],
      medications: [],
      allergies: [],
    },
  });

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Pet and owner details' },
    { id: 2, title: 'Medical Information', description: 'Health and medical history' },
    { id: 3, title: 'Emergency Contacts', description: 'Emergency contact information' },
    { id: 4, title: 'Review & Submit', description: 'Review and complete registration' },
  ];

  const handleInputChange = (field: keyof PetRegistrationForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmergencyContactChange = (field: keyof typeof formData.emergencyContact, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact!,
        [field]: value,
      },
    }));
  };

  const handleMedicalHistoryChange = (field: keyof typeof formData.medicalHistory, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory!,
        [field]: value,
      },
    }));
  };

  const addMedicalItem = (field: keyof typeof formData.medicalHistory, item: string) => {
    if (!item.trim()) return;
    const currentItems = formData.medicalHistory?.[field] || [];
    handleMedicalHistoryChange(field, [...currentItems, item.trim()]);
  };

  const removeMedicalItem = (field: keyof typeof formData.medicalHistory, index: number) => {
    const currentItems = formData.medicalHistory?.[field] || [];
    handleMedicalHistoryChange(field, currentItems.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.breed && formData.ownerName && formData.ownerEmail && formData.ownerPhone);
      case 2:
        return true; // Medical info is optional
      case 3:
        return !!(formData.emergencyContact?.name && formData.emergencyContact?.phone);
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.registerPet(formData);
      
      if (response.success && response.data) {
        setSuccess('Pet registered successfully! Redirecting to pet profile...');
        
        // Redirect to the new pet's profile after a short delay
        setTimeout(() => {
          router.push(`/pets/${response.data.id}`);
        }, 2000);
      } else {
        setError(response.error || 'Failed to register pet. Please try again.');
      }
      
    } catch (err) {
      setError('Failed to register pet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pet Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter pet's name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pet Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="select"
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Breed *</label>
                <Input
                  value={formData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                  placeholder="Enter breed"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Age (years) *</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  max="30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Microchip Number</label>
                <Input
                  value={formData.microchipNumber}
                  onChange={(e) => handleInputChange('microchipNumber', e.target.value)}
                  placeholder="15-digit microchip number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Spay/Neuter Status</label>
                <select
                  value={formData.spayNeuterStatus}
                  onChange={(e) => handleInputChange('spayNeuterStatus', e.target.value)}
                  className="select"
                >
                  <option value="unknown">Unknown</option>
                  <option value="spayed">Spayed</option>
                  <option value="neutered">Neutered</option>
                  <option value="intact">Intact</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your pet's appearance, personality, etc."
                className="input resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Owner Name *</label>
                <Input
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  placeholder="Enter owner's full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Owner Email *</label>
                <Input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                  placeholder="Enter owner's email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Owner Phone *</label>
                <Input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                  placeholder="Enter owner's phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Special Needs</label>
                <Input
                  value={formData.specialNeeds}
                  onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
                  placeholder="Any special care requirements"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Medical Conditions</label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add medical condition"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addMedicalItem('conditions', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addMedicalItem('conditions', input.value);
                      input.value = '';
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.medicalHistory?.conditions.map((condition, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeMedicalItem('conditions', index)}>
                      {condition} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Current Medications</label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add medication"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addMedicalItem('medications', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addMedicalItem('medications', input.value);
                      input.value = '';
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.medicalHistory?.medications.map((medication, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeMedicalItem('medications', index)}>
                      {medication} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Allergies</label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add allergy"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addMedicalItem('allergies', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addMedicalItem('allergies', input.value);
                      input.value = '';
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.medicalHistory?.allergies.map((allergy, index) => (
                    <Badge key={index} variant="error" className="cursor-pointer" onClick={() => removeMedicalItem('allergies', index)}>
                      {allergy} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Emergency Contact Name *</label>
                <Input
                  value={formData.emergencyContact?.name}
                  onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                  placeholder="Enter emergency contact name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Emergency Contact Phone *</label>
                <Input
                  type="tel"
                  value={formData.emergencyContact?.phone}
                  onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                  placeholder="Enter emergency contact phone"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Relationship to Pet</label>
                <Input
                  value={formData.emergencyContact?.relationship}
                  onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                  placeholder="e.g., Friend, Family member, Vet"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">Review Registration Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Pet Information</h4>
                  <div className="space-y-1 text-sm text-foreground">
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>Type:</strong> {formData.type}</p>
                    <p><strong>Breed:</strong> {formData.breed}</p>
                    <p><strong>Age:</strong> {formData.age} years</p>
                    {formData.microchipNumber && <p><strong>Microchip:</strong> {formData.microchipNumber}</p>}
                    <p><strong>Spay/Neuter:</strong> {formData.spayNeuterStatus}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-2">Owner Information</h4>
                  <div className="space-y-1 text-sm text-foreground">
                    <p><strong>Name:</strong> {formData.ownerName}</p>
                    <p><strong>Email:</strong> {formData.ownerEmail}</p>
                    <p><strong>Phone:</strong> {formData.ownerPhone}</p>
                  </div>
                </div>
              </div>

              {formData.medicalHistory && (
                <div className="mt-4">
                  <h4 className="font-medium text-foreground mb-2">Medical Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-foreground">
                    <div>
                      <strong>Conditions:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.medicalHistory.conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" size="sm">{condition}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong>Medications:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.medicalHistory.medications.map((medication, index) => (
                          <Badge key={index} variant="outline" size="sm">{medication}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong>Allergies:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.medicalHistory.allergies.map((allergy, index) => (
                          <Badge key={index} variant="error" size="sm">{allergy}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formData.emergencyContact && (
                <div className="mt-4">
                  <h4 className="font-medium text-foreground mb-2">Emergency Contact</h4>
                  <div className="text-sm text-foreground">
                    <p><strong>Name:</strong> {formData.emergencyContact.name}</p>
                    <p><strong>Phone:</strong> {formData.emergencyContact.phone}</p>
                    {formData.emergencyContact.relationship && (
                      <p><strong>Relationship:</strong> {formData.emergencyContact.relationship}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Register New Pet</h1>
          <p className="text-foreground">Complete the registration form to add a new pet to the system</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-lg font-semibold text-foreground">{steps[currentStep - 1].title}</h2>
            <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Form */}
        <Card variant="elevated" className="animate-fade-in">
          <CardHeader>
            <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStepContent()}

            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 bg-error-light border border-error rounded-lg animate-fade-in">
                <div className="flex items-center">
                  <span className="text-error mr-2">⚠️</span>
                  <p className="text-error font-medium">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="p-4 bg-success-light border border-success rounded-lg animate-fade-in">
                <div className="flex items-center">
                  <span className="text-success mr-2">✅</span>
                  <p className="text-success font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              <div className="flex space-x-3">
                {currentStep < steps.length ? (
                  <Button
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    loadingText="Registering..."
                    disabled={!validateStep(currentStep)}
                    variant="success"
                  >
                    Register Pet
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
