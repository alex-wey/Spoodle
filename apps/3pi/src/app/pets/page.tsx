'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Input } from '@/components';
import { useRouter } from 'next/navigation';

export default function PetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'compliant' | 'missing-records' | 'action-needed'>('all');
  const router = useRouter();

  // Mock data - in real app this would come from API
  const pets = [
    {
      id: '1',
      name: 'Buddy',
      type: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      ownerName: 'John Smith',
      complianceStatus: 'compliant',
      lastCheckIn: '2024-01-15',
      spoodleId: 'SP001',
      photo: null
    },
    {
      id: '2',
      name: 'Luna',
      type: 'cat',
      breed: 'Persian',
      age: 2,
      ownerName: 'Sarah Johnson',
      complianceStatus: 'missing-records',
      lastCheckIn: '2024-01-10',
      spoodleId: 'SP002',
      photo: null
    },
    {
      id: '3',
      name: 'Max',
      type: 'dog',
      breed: 'Labrador',
      age: 5,
      ownerName: 'Mike Davis',
      complianceStatus: 'action-needed',
      lastCheckIn: '2024-01-08',
      spoodleId: 'SP003',
      photo: null
    },
    {
      id: '4',
      name: 'Bella',
      type: 'dog',
      breed: 'Beagle',
      age: 1,
      ownerName: 'Emily Wilson',
      complianceStatus: 'compliant',
      lastCheckIn: '2024-01-14',
      spoodleId: 'SP004',
      photo: null
    },
    {
      id: '5',
      name: 'Charlie',
      type: 'cat',
      breed: 'Maine Coon',
      age: 4,
      ownerName: 'David Brown',
      complianceStatus: 'compliant',
      lastCheckIn: '2024-01-12',
      spoodleId: 'SP005',
      photo: null
    }
  ];

  const getStatusVariant = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  const getTypeIcon = (type: string) => {
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

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pet.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pet.spoodleId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || pet.complianceStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleRegisterPet = () => {
    router.push('/pets/register');
  };

  const handleViewPet = (petId: string) => {
    router.push(`/pets/${petId}`);
  };

  const handleStartComplianceCheck = (petId: string) => {
    router.push(`/compliance/check?petId=${petId}`);
  };

  const stats = {
    total: pets.length,
    compliant: pets.filter(p => p.complianceStatus === 'compliant').length,
    missingRecords: pets.filter(p => p.complianceStatus === 'missing-records').length,
    actionNeeded: pets.filter(p => p.complianceStatus === 'action-needed').length,
  };

  return (
    <div className="min-h-screen bg-background py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Pet Management
            </h1>
            <p className="text-foreground">
              Manage all registered pets and their compliance status
            </p>
          </div>
          <Button 
            onClick={handleRegisterPet}
            leftIcon={<span>➕</span>}
            size="lg"
          >
            Register New Pet
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Pets</p>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-success mb-2">{stats.compliant}</div>
              <p className="text-sm text-muted-foreground">Compliant</p>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-warning mb-2">{stats.missingRecords}</div>
              <p className="text-sm text-muted-foreground">Missing Records</p>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-error mb-2">{stats.actionNeeded}</div>
              <p className="text-sm text-muted-foreground">Action Needed</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <Input
                    placeholder="Search pets by name, owner, or Spoodle ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-96"
                    leftIcon={<span className="text-lg">🔍</span>}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">Filter by status:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="select"
                  >
                    <option value="all">All Pets</option>
                    <option value="compliant">Compliant</option>
                    <option value="missing-records">Missing Records</option>
                    <option value="action-needed">Action Needed</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pets List */}
        <div className="space-y-6">
          {filteredPets.map((pet) => (
            <Card key={pet.id} variant="elevated" className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl">
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
                      <h3 className="text-xl font-semibold">{pet.name}</h3>
                      <p className="text-muted-foreground">
                        {getTypeIcon(pet.type)} {pet.breed} • {pet.age} years old
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Owner: {pet.ownerName} • Spoodle ID: {pet.spoodleId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last check-in: {pet.lastCheckIn ? new Date(pet.lastCheckIn).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={getStatusVariant(pet.complianceStatus)}
                      dot
                      size="lg"
                    >
                      {getStatusText(pet.complianceStatus)}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPet(pet.id)}
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/owners/${pet.ownerEmail}`)}
                        leftIcon={<span>👤</span>}
                      >
                        Owner Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartComplianceCheck(pet.id)}
                        leftIcon={<span>🏥</span>}
                      >
                        Check Compliance
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-6xl mb-4">🐾</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No pets found' : 'No pets registered yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by registering your first pet'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button onClick={handleRegisterPet} leftIcon={<span>➕</span>}>
                Register First Pet
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
