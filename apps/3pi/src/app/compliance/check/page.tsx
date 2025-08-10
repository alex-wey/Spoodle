'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Input, Skeleton, SkeletonCard } from '@/components/ui';
import { apiService, Pet, ComplianceRequirement } from '@/lib/api';

export default function ComplianceCheckPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'microchip' | 'spoodle-id' | 'qr-code'>('microchip');
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [checkInProgress, setCheckInProgress] = useState(false);
  const [checkNotes, setCheckNotes] = useState('');
  const [requirementNotes, setRequirementNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      let response;
      
      if (searchType === 'microchip') {
        response = await apiService.getPetByMicrochip(searchQuery);
      } else if (searchType === 'spoodle-id') {
        response = await apiService.getPetBySpoodleId(searchQuery);
      } else {
        // For QR code, we'll treat it as a Spoodle ID for now
        response = await apiService.getPetBySpoodleId(searchQuery);
      }

      if (response.success && response.data) {
        setCurrentPet(response.data);
      } else {
        setError(response.error || 'Pet not found');
        setCurrentPet(null);
      }
    } catch (err) {
      setError('An error occurred while searching for the pet');
      setCurrentPet(null);
    } finally {
      setIsSearching(false);
    }
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

  const getStatusVariant = (status: ComplianceRequirement['status']) => {
    switch (status) {
      case 'met':
        return 'success' as const;
      case 'not-met':
        return 'error' as const;
      case 'pending':
        return 'warning' as const;
      case 'not-applicable':
        return 'default' as const;
      default:
        return 'default' as const;
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

  const getOverallStatusVariant = (status: string) => {
    switch (status) {
      case 'passed':
        return 'success' as const;
      case 'failed':
        return 'error' as const;
      case 'partial':
        return 'warning' as const;
      default:
        return 'default' as const;
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
    setError(null);
    
    try {
      const checkData = {
        requirements: currentPet.requirements.map(req => ({
          id: req.id,
          status: req.status,
          notes: requirementNotes[req.id] || undefined,
        })),
        overallNotes: checkNotes || undefined,
      };

      const response = await apiService.performComplianceCheck(currentPet.id, checkData);

      if (response.success) {
        alert('Compliance check completed successfully!');
        // Reset for next check
        setCurrentPet(null);
        setSearchQuery('');
        setCheckNotes('');
        setRequirementNotes({});
      } else {
        setError(response.error || 'Failed to complete compliance check');
      }
    } catch (err) {
      setError('An error occurred while completing the compliance check');
    } finally {
      setCheckInProgress(false);
    }
  };

  const renderSearchSection = () => (
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader>
        <CardTitle>Start Compliance Check</CardTitle>
        <CardDescription>
          Search for a pet to begin compliance verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Enter microchip number, Spoodle ID, or scan QR code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              leftIcon={<span className="text-lg">🔍</span>}
              variant="filled"
            />
          </div>
          <div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="select"
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
            loadingText="Searching..."
            disabled={!searchQuery.trim()}
            className="flex-1"
            leftIcon={<span>🔍</span>}
          >
            Search Pet
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            leftIcon={<span>📷</span>}
          >
            Scan QR Code
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-error-light border border-error rounded-lg animate-fade-in">
            <div className="flex items-center">
              <span className="text-error mr-2">⚠️</span>
              <p className="text-error font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="p-4 bg-primary-light border border-primary/20 rounded-md">
          <h4 className="font-medium text-primary mb-2">Quick Tips:</h4>
          <ul className="text-sm text-primary/80 space-y-1">
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
      <Card variant="elevated" className="animate-slide-in">
        <CardHeader>
          <CardTitle>Pet Information</CardTitle>
          <CardDescription>
            Verify pet details before proceeding with compliance check
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl">
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
               <p className="text-foreground">{currentPet.breed} • {currentPet.age} years old</p>
               <p className="text-foreground">Owner: {currentPet.ownerName}</p>
               <p className="text-foreground">Spoodle ID: {currentPet.spoodleId}</p>
            </div>
            <div className="text-right">
              <Badge
                variant={getOverallStatusVariant(getOverallStatus())}
                dot
                size="lg"
              >
                {getOverallStatusText(getOverallStatus())}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderComplianceCheck = () => {
    if (!currentPet) return null;

    return (
      <Card variant="elevated" className="animate-scale-in">
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
                    <Card key={requirement.id} variant="outlined">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h5 className="font-medium">{requirement.name}</h5>
                              {requirement.required && (
                                <Badge variant="error" size="sm">
                                  Required
                                </Badge>
                              )}
                            </div>
                                                         <p className="text-sm text-foreground mb-2">{requirement.description}</p>
                             {requirement.expirationDate && (
                               <p className="text-sm text-foreground">
                                 Expires: {new Date(requirement.expirationDate).toLocaleDateString()}
                               </p>
                             )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <select
                              value={requirement.status}
                              onChange={(e) => handleRequirementStatusChange(requirement.id, e.target.value as any)}
                              className="select"
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
                            className="input resize-none"
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
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
              className="input resize-none"
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
              loadingText="Completing check..."
              disabled={getOverallStatus() === 'pending'}
              className="flex-1"
              variant="success"
            >
              Complete Compliance Check
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Compliance Check-In
          </h1>
          <p className="text-foreground">
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
