'use client';

import { useState, useEffect, use } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Skeleton, SkeletonCard } from '@/components';
import { apiService, Owner, Pet } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function OwnerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [ownerPets, setOwnerPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'pets' | 'preferences'>('overview');
  const router = useRouter();

  useEffect(() => {
    const loadOwnerData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if the ID parameter looks like an email
        const isEmail = resolvedParams.id.includes('@');
        
        let ownerResponse;
        if (isEmail) {
          // If it's an email, use the email endpoint
          ownerResponse = await apiService.getOwnerByEmail(resolvedParams.id);
        } else {
          // If it's an ID, use the ID endpoint
          ownerResponse = await apiService.getOwnerById(resolvedParams.id);
        }
        
        if (ownerResponse.success && ownerResponse.data) {
          setOwner(ownerResponse.data);
          
          // Load owner's pets using the owner ID from the response
          const petsResponse = await apiService.getOwnerPets(ownerResponse.data.id);
          if (petsResponse.success && petsResponse.data) {
            setOwnerPets(petsResponse.data);
          }
        } else {
          setError(ownerResponse.error || 'Failed to load owner data');
          return;
        }
      } catch (err) {
        setError('An error occurred while loading owner data');
      } finally {
        setIsLoading(false);
      }
    };

    loadOwnerData();
  }, [resolvedParams.id]);

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getPetTypeIcon = (type: string) => {
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

  const getComplianceStatusVariant = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'success' as const;
      case 'missing-records':
        return 'warning' as const;
      case 'action-needed':
        return 'error' as const;
      default:
        return 'default' as const;
    }
  };

  const getComplianceStatusText = (status: string) => {
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

  if (error || !owner) {
    return (
      <div className="min-h-screen bg-background py-8 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="text-error text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Owner Profile</h1>
            <p className="text-muted-foreground mb-4">{error || 'Owner not found'}</p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Owner Info Card */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-3xl text-white font-bold">
              {owner.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{owner.name}</h2>
              <p className="text-foreground">{owner.email}</p>
              <p className="text-foreground">{owner.phone}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium mb-2">Contact Information</h3>
              {owner.address && (
                <p><strong>Address:</strong> {owner.address}</p>
              )}
              <p><strong>Registration Date:</strong> {formatDate(owner.registrationDate)}</p>
              <p><strong>Last Active:</strong> {formatDate(owner.lastActive)}</p>
            </div>
            
            {owner.emergencyContact && (
              <div className="space-y-2">
                <h3 className="font-medium mb-2">Emergency Contact</h3>
                <p><strong>Name:</strong> {owner.emergencyContact.name}</p>
                <p><strong>Phone:</strong> {owner.emergencyContact.phone}</p>
                <p><strong>Relationship:</strong> {owner.emergencyContact.relationship}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{ownerPets.length}</div>
            <p className="text-foreground font-medium">Total Pets</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success mb-2">
              {ownerPets.filter(p => p.complianceStatus === 'compliant').length}
            </div>
            <p className="text-foreground font-medium">Compliant Pets</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-warning mb-2">
              {ownerPets.filter(p => p.complianceStatus !== 'compliant').length}
            </div>
            <p className="text-foreground font-medium">Pets Needing Attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {owner.notes && owner.notes.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {owner.notes.map((note, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <p className="text-foreground">{note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPets = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Owner's Pets</h3>
        <Button
          onClick={() => router.push('/pets/register')}
          leftIcon={<span>➕</span>}
        >
          Register New Pet
        </Button>
      </div>

      {ownerPets.length === 0 ? (
        <Card variant="elevated">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-lg font-medium mb-2">No Pets Registered</h3>
            <p className="text-muted-foreground mb-4">
              This owner hasn't registered any pets yet.
            </p>
            <Button
              onClick={() => router.push('/pets/register')}
              leftIcon={<span>➕</span>}
            >
              Register First Pet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownerPets.map((pet) => (
            <Card key={pet.id} variant="elevated" className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-xl">
                    {pet.photo ? (
                      <img 
                        src={pet.photo} 
                        alt={pet.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      getPetTypeIcon(pet.type)
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{pet.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {getPetTypeIcon(pet.type)} {pet.breed}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm"><strong>Age:</strong> {pet.age} years</p>
                  <p className="text-sm"><strong>Spoodle ID:</strong> {pet.spoodleId}</p>
                  <p className="text-sm"><strong>Last Check-in:</strong> {pet.lastCheckIn ? new Date(pet.lastCheckIn).toLocaleDateString() : 'Never'}</p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <Badge
                    variant={getComplianceStatusVariant(pet.complianceStatus)}
                    dot
                  >
                    {getComplianceStatusText(pet.complianceStatus)}
                  </Badge>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => router.push(`/pets/${pet.id}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    View Profile
                  </Button>
                  <Button
                    onClick={() => router.push(`/compliance/check?petId=${pet.id}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Check Compliance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6 animate-fade-in">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Communication Preferences</CardTitle>
          <CardDescription>
            How this owner prefers to be contacted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Contact Method</label>
              <div className="p-3 bg-muted rounded-lg">
                <span className="capitalize">{owner.preferences?.communicationMethod || 'Not specified'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Appointment Reminders</label>
              <div className="p-3 bg-muted rounded-lg">
                <span>{owner.preferences?.appointmentReminders ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Marketing Emails</label>
              <div className="p-3 bg-muted rounded-lg">
                <span>{owner.preferences?.marketingEmails ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              leftIcon={<span>←</span>}
            >
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Owner Profile</h1>
          </div>
          <p className="text-muted-foreground">
            Managing profile for {owner.name}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: '👤' },
                { id: 'pets', label: 'Pets', icon: '🐾' },
                { id: 'preferences', label: 'Preferences', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'pets' && renderPets()}
        {activeTab === 'preferences' && renderPreferences()}
      </div>
    </div>
  );
}
