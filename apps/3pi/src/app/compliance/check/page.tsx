'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: 'vaccination' | 'health' | 'prevention' | 'documentation';
  status: 'met' | 'not-met' | 'pending' | 'not-applicable';
  notes?: string;
  documentUrl?: string;
  expirationDate?: Date;
}

interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'other';
  breed: string;
  age: number;
  ownerName: string;
  spoodleId: string;
  photo?: string;
  requirements: ComplianceRequirement[];
}

// Mock data for demonstration
const mockPet: Pet = {
  id: '1',
  name: 'Max',
  type: 'dog',
  breed: 'Golden Retriever',
  age: 3,
  ownerName: 'Sarah Johnson',
  spoodleId: 'SP001234',
  photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop&crop=face',
  requirements: [
    {
      id: '1',
      name: 'Rabies Vaccination',
      description: 'Current rabies vaccination required',
      required: true,
      category: 'vaccination',
      status: 'met',
      documentUrl: '/documents/rabies-vaccination-max.pdf',
      expirationDate: new Date('2025-01-10')
    },
    {
      id: '2',
      name: 'DHPP Vaccination',
      description: 'Core vaccination series',
      required: true,
      category: 'vaccination',
      status: 'met',
      documentUrl: '/documents/dhpp-vaccination-max.pdf',
      expirationDate: new Date('2025-01-10')
    },
    {
      id: '3',
      name: 'Bordetella Vaccination',
      description: 'Kennel cough prevention',
      required: true,
      category: 'vaccination',
      status: 'met',
      documentUrl: '/documents/bordetella-vaccination-max.pdf',
      expirationDate: new Date('2025-01-10')
    },
    {
      id: '4',
      name: 'Flea/Tick Prevention',
      description: 'Current flea and tick prevention',
      required: true,
      category: 'prevention',
      status: 'met',
      documentUrl: '/documents/flea-tick-prevention-max.pdf',
      expirationDate: new Date('2024-04-15')
    },
    {
      id: '5',
      name: 'Health Certificate',
      description: 'Recent health examination certificate',
      required: true,
      category: 'documentation',
      status: 'met',
      documentUrl: '/documents/health-certificate-max.pdf',
      expirationDate: new Date('2024-07-10')
    },
    {
      id: '6',
      name: 'Heartworm Test',
      description: 'Annual heartworm test result',
      required: false,
      category: 'health',
      status: 'met',
      documentUrl: '/documents/heartworm-test-max.pdf',
      expirationDate: new Date('2024-12-10')
    }
  ]
};

export default function ComplianceCheckPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'microchip' | 'spoodle-id' | 'qr-code'>('microchip');
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [checkInProgress, setCheckInProgress] = useState(false);
  const [checkNotes, setCheckNotes] = useState('');
  const [requirementNotes, setRequirementNotes] = useState<Record<string, string>>({});

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, always return the mock pet
    setCurrentPet(mockPet);
    setIsSearching(false);
  };

  const handleRequirementStatusChange = (requirementId: string, status: ComplianceRequirement['status']) => {
    if (!currentPet) return;
    
    setCurrentPet(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        requirements: prev.requirements.map(req => 
          req.id === requirementId ? { ...req, status } : req
        )
      };
    });
  };

  const handleRequirementNoteChange = (requirementId: string, note: string) => {
    setRequirementNotes(prev => ({
      ...prev,
      [requirementId]: note
    }));
  };

  const getOverallStatus = () => {
    if (!currentPet) return 'pending';
    
    const requiredRequirements = currentPet.requirements.filter(req => req.required);
    const metRequirements = requiredRequirements.filter(req => req.status === 'met');
    
    if (metRequirements.length === requiredRequirements.length) return 'passed';
    if (metRequirements.length === 0) return 'failed';
    return 'partial';
  };

  const getStatusColor = (status: ComplianceRequirement['status']) => {
    switch (status) {
      case 'met':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'not-met':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not-applicable':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: ComplianceRequirement['status']) => {
    switch (status) {
      case 'met':
        return 'Met';
      case 'not-met':
        return 'Not Met';
      case 'pending':
        return 'Pending';
      case 'not-applicable':
        return 'N/A';
      default:
        return 'Unknown';
    }
  };

  const getCategoryIcon = (category: ComplianceRequirement['category']) => {
    switch (category) {
      case 'vaccination':
        return '💉';
      case 'health':
        return '🏥';
      case 'prevention':
        return '🛡️';
      case 'documentation':
        return '📄';
      default:
        return '📋';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOverallStatusText = (status: string) => {
    switch (status) {
      case 'passed':
        return 'Compliance Passed';
      case 'failed':
        return 'Compliance Failed';
      case 'partial':
        return 'Partial Compliance';
      default:
        return 'Pending Review';
    }
  };

  const handleCompleteCheck = async () => {
    if (!currentPet) return;
    
    setCheckInProgress(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would save the compliance check
    alert('Compliance check completed successfully!');
    setCheckInProgress(false);
    
    // Reset for next check
    setCurrentPet(null);
    setSearchQuery('');
    setCheckNotes('');
    setRequirementNotes({});
  };

  const renderSearchSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Start Compliance Check</CardTitle>
        <CardDescription>
          Search for a pet to begin compliance verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Enter microchip number, Spoodle ID, or scan QR code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="microchip">Microchip</option>
              <option value="spoodle-id">Spoodle ID</option>
              <option value="qr-code">QR Code</option>
            </select>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={handleSearch}
            isLoading={isSearching}
            disabled={!searchQuery.trim()}
            className="flex-1"
          >
            Search Pet
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
          >
            Scan QR Code
          </Button>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Quick Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Microchip numbers are typically 15 digits</li>
            <li>• Spoodle IDs start with "SP" followed by numbers</li>
            <li>• QR codes can be scanned from pet tags or documents</li>
            <li>• Use the camera icon to scan QR codes directly</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const renderPetInfo = () => {
    if (!currentPet) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Pet Information</CardTitle>
          <CardDescription>
            Verify pet details before proceeding with compliance check
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
              {currentPet.photo ? (
                <img 
                  src={currentPet.photo} 
                  alt={currentPet.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                '🐕'
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{currentPet.name}</h3>
              <p className="text-gray-600">{currentPet.breed} • {currentPet.age} years old</p>
              <p className="text-gray-600">Owner: {currentPet.ownerName}</p>
              <p className="text-gray-600">Spoodle ID: {currentPet.spoodleId}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getOverallStatusColor(getOverallStatus())}`}>
                {getOverallStatusText(getOverallStatus())}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderComplianceCheck = () => {
    if (!currentPet) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Requirements Check</CardTitle>
          <CardDescription>
            Review and verify each compliance requirement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Requirements by Category */}
          {['vaccination', 'health', 'prevention', 'documentation'].map(category => {
            const categoryRequirements = currentPet.requirements.filter(req => req.category === category);
            if (categoryRequirements.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <h4 className="font-medium text-lg flex items-center">
                  {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)} Requirements
                </h4>
                <div className="space-y-3">
                  {categoryRequirements.map((requirement) => (
                    <div key={requirement.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h5 className="font-medium">{requirement.name}</h5>
                            {requirement.required && (
                              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{requirement.description}</p>
                          {requirement.expirationDate && (
                            <p className="text-sm text-gray-500">
                              Expires: {requirement.expirationDate.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={requirement.status}
                            onChange={(e) => handleRequirementStatusChange(requirement.id, e.target.value as any)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="met">Met</option>
                            <option value="not-met">Not Met</option>
                            <option value="pending">Pending</option>
                            <option value="not-applicable">N/A</option>
                          </select>
                          {requirement.documentUrl && (
                            <Button variant="outline" size="sm">
                              View Doc
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <textarea
                          placeholder="Add notes about this requirement..."
                          value={requirementNotes[requirement.id] || ''}
                          onChange={(e) => handleRequirementNoteChange(requirement.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Overall Notes */}
          <div className="space-y-3">
            <h4 className="font-medium">Overall Check Notes</h4>
            <textarea
              placeholder="Add general notes about this compliance check..."
              value={checkNotes}
              onChange={(e) => setCheckNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex space-x-3 w-full">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPet(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteCheck}
              isLoading={checkInProgress}
              disabled={getOverallStatus() === 'pending'}
              className="flex-1"
            >
              Complete Compliance Check
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Compliance Check-In
          </h1>
          <p className="text-muted-foreground">
            Verify pet compliance status for boarding, travel, or other services
          </p>
        </div>

        <div className="space-y-6">
          {renderSearchSection()}
          {renderPetInfo()}
          {renderComplianceCheck()}
        </div>
      </div>
    </div>
  );
}
