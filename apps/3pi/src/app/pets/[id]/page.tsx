'use client';

import { useState, useEffect, use } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Skeleton, SkeletonCard } from '@/components';
import { apiService, Pet, MedicalRecord, ComplianceCheck } from '@/lib/api';

export default function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [pet, setPet] = useState<Pet | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'compliance' | 'notes'>('overview');

  useEffect(() => {
    const loadPetData = async () => {
      // Special handling for "new" pet registration
      if (resolvedParams.id === 'new') {
        setIsLoading(false);
        setError('This is a placeholder for new pet registration. Please use the search page to find existing pets.');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        // Load pet data
        const petResponse = await apiService.getPetById(resolvedParams.id);
        if (petResponse.success && petResponse.data) {
          setPet(petResponse.data);
        } else {
          setError(petResponse.error || 'Failed to load pet data');
          return;
        }

        // Load medical records
        const recordsResponse = await apiService.getMedicalRecords(resolvedParams.id);
        if (recordsResponse.success && recordsResponse.data) {
          setMedicalRecords(recordsResponse.data);
        }

        // Load compliance history
        const complianceResponse = await apiService.getComplianceHistory(resolvedParams.id);
        if (complianceResponse.success && complianceResponse.data) {
          setComplianceChecks(complianceResponse.data);
        }
      } catch (err) {
        setError('An error occurred while loading pet data');
      } finally {
        setIsLoading(false);
      }
    };

    loadPetData();
  }, [resolvedParams.id]);

  const addNote = () => {
    if (!newNote.trim() || !pet) return;
    
    setPet(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        notes: [...prev.notes, newNote]
      };
    });
    setNewNote('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton variant="text" width="300px" height="36px" className="mb-2" />
            <Skeleton variant="text" width="400px" height="20px" />
          </div>
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="text-error text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {resolvedParams.id === 'new' ? 'New Pet Registration' : 'Error Loading Pet'}
            </h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex justify-center space-x-4">
              {resolvedParams.id === 'new' ? (
                <>
                  <Button onClick={() => window.location.href = '/search'}>
                    Search for Pets
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                    Back to Dashboard
                  </Button>
                </>
              ) : (
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-background py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="text-muted-foreground text-6xl mb-4">🐾</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Pet Not Found</h1>
            <p className="text-muted-foreground mb-4">The pet you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.location.href = '/search'}>
              Search for Pets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: Pet['complianceStatus']) => {
    switch (status) {
      case 'compliant':
        return 'compliant' as const;
      case 'missing-records':
        return 'missing-records' as const;
      case 'action-needed':
        return 'action-needed' as const;
      default:
        return 'default' as const;
    }
  };

  const getStatusText = (status: Pet['complianceStatus']) => {
    switch (status) {
      case 'compliant':
        return 'Compliant';
      case 'missing-records':
        return 'Missing Records';
      case 'action-needed':
        return 'Action Needed';
      default:
        return 'Unknown';
    }
  };

  const getTypeIcon = (type: Pet['type']) => {
    switch (type) {
      case 'dog':
        return '🐕';
      case 'cat':
        return '🐱';
      case 'bird':
        return '🐦';
      default:
        return '🐾';
    }
  };

  const getRecordTypeIcon = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'vaccination':
        return '💉';
      case 'health-check':
        return '🏥';
      case 'treatment':
        return '💊';
      case 'test-result':
        return '🔬';
      case 'boarding':
        return '🏠';
      default:
        return '📄';
    }
  };

  const getRecordStatusVariant = (status: MedicalRecord['status']) => {
    switch (status) {
      case 'active':
        return 'success' as const;
      case 'expired':
        return 'error' as const;
      case 'pending':
        return 'warning' as const;
      default:
        return 'default' as const;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Pet Info Card */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-4xl">
              {pet.photo ? (
                <img 
                  src={pet.photo} 
                  alt={pet.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                getTypeIcon(pet.type)
              )}
            </div>
                         <div>
               <h2 className="text-2xl font-bold">{pet.name}</h2>
               <p className="text-foreground">{getTypeIcon(pet.type)} {pet.breed}</p>
               <p className="text-foreground">{pet.age} years old</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p><strong>Spoodle ID:</strong> {pet.spoodleId}</p>
              {pet.microchipNumber && (
                <p><strong>Microchip:</strong> {pet.microchipNumber}</p>
              )}
              <p><strong>Spay/Neuter:</strong> {pet.spayNeuterStatus.replace(/\b\w/g, l => l.toUpperCase())}</p>
              <p><strong>Last Check-in:</strong> {pet.lastCheckIn?.toLocaleDateString() || 'Never'}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium mb-2">Owner Information</h3>
              <div className="space-y-1">
                <p><strong>Name:</strong> {pet.ownerName}</p>
                <p><strong>Email:</strong> {pet.ownerEmail}</p>
                <p><strong>Phone:</strong> {pet.ownerPhone}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Compliance Status</h3>
              <Badge
                variant={getStatusVariant(pet.complianceStatus)}
                dot
                size="lg"
              >
                {getStatusText(pet.complianceStatus)}
              </Badge>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={() => window.location.href = `/compliance/check/${pet.id}`}
                className="w-full"
                leftIcon={<span>🏥</span>}
              >
                Start Compliance Check
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{medicalRecords.length}</div>
            <p className="text-foreground font-medium">Medical Records</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-secondary mb-2">{complianceChecks.length}</div>
            <p className="text-foreground font-medium">Compliance Checks</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success mb-2">
              {medicalRecords.filter(r => r.status === 'active').length}
            </div>
            <p className="text-foreground font-medium">Active Records</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMedical = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Medical Records</h3>
        <Button 
          variant="outline"
          leftIcon={<span>📄</span>}
        >
          Upload Record
        </Button>
      </div>
      
      <div className="space-y-4">
        {medicalRecords.map((record) => (
          <Card key={record.id} variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getRecordTypeIcon(record.type)}</div>
                  <div>
                    <h4 className="font-medium">{record.title}</h4>
                                         <p className="text-sm text-foreground mb-2">{record.description}</p>
                     <div className="flex items-center space-x-4 text-sm text-foreground">
                      <span>Date: {new Date(record.date).toLocaleDateString()}</span>
                      {record.expirationDate && (
                        <span>Expires: {new Date(record.expirationDate).toLocaleDateString()}</span>
                      )}
                      <span>Uploaded by: {record.uploadedBy}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={getRecordStatusVariant(record.status)}
                    dot
                  >
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                  {record.documentUrl && (
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Compliance History</h3>
        <Button 
          onClick={() => window.location.href = `/compliance/check/${pet.id}`}
          leftIcon={<span>🏥</span>}
        >
          New Compliance Check
        </Button>
      </div>
      
      <div className="space-y-4">
        {complianceChecks.map((check) => (
          <Card key={check.id} variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">Compliance Check</h4>
                                     <p className="text-sm text-foreground mb-2">
                     Date: {new Date(check.date).toLocaleDateString()} • Performed by: {check.performedBy}
                   </p>
                   <p className="text-sm text-foreground">{check.notes}</p>
                </div>
                <Badge
                  variant={check.status === 'passed' ? 'success' : check.status === 'failed' ? 'error' : 'warning'}
                  dot
                >
                  {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Notes</h3>
        <Button 
          onClick={addNote}
          disabled={!newNote.trim()}
          leftIcon={<span>➕</span>}
        >
          Add Note
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Add a new note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="input flex-1"
            onKeyPress={(e) => e.key === 'Enter' && addNote()}
          />
        </div>
        
        <div className="space-y-4">
          {pet.notes.map((note, index) => (
            <Card key={index} variant="outlined">
              <CardContent className="p-4">
                <p className="text-sm">{note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'medical', label: 'Medical Records', icon: '🏥' },
    { id: 'compliance', label: 'Compliance', icon: '✅' },
    { id: 'notes', label: 'Notes', icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-background py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              leftIcon={<span>←</span>}
            >
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              Pet Profile: {pet.name}
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'medical' && renderMedical()}
        {activeTab === 'compliance' && renderCompliance()}
        {activeTab === 'notes' && renderNotes()}
      </div>
    </div>
  );
}
