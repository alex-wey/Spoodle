'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Input, Skeleton, SkeletonCard } from '@/components';
import { apiService, Pet } from '@/lib/api';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'name' | 'owner' | 'microchip' | 'spoodle-id'>('all');
  const [filterType, setFilterType] = useState<'all' | 'dog' | 'cat' | 'bird' | 'other'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'compliant' | 'missing-records' | 'action-needed'>('all');
  const [recentlyViewed, setRecentlyViewed] = useState<Pet[]>([]);
  const [searchResults, setSearchResults] = useState<Pet[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await apiService.searchPets(searchQuery, {
        type: filterType === 'all' ? undefined : filterType,
        status: filterStatus === 'all' ? undefined : filterStatus,
      });

      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        setError(response.error || 'Failed to search pets');
        setSearchResults([]);
      }
    } catch (err) {
      setError('An error occurred while searching');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePetClick = (pet: Pet) => {
    // Add to recently viewed
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== pet.id);
      return [pet, ...filtered].slice(0, 5);
    });
    
    // Navigate to pet profile
    window.location.href = `/pets/${pet.id}`;
  };

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

  return (
    <div className="min-h-screen bg-background py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Search & Pet Lookup
          </h1>
          <p className="text-foreground">
            Search for pets by name, owner, microchip, or Spoodle ID
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Search Pets</CardTitle>
                <CardDescription>
                  Find pet records using various search criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Input */}
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter pet name, owner name, microchip, or Spoodle ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      leftIcon={<span className="text-lg">🔍</span>}
                      variant="filled"
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    isLoading={isSearching}
                    loadingText="Searching..."
                    disabled={!searchQuery.trim()}
                    leftIcon={<span>🔍</span>}
                  >
                    Search
                  </Button>
                </div>

                {/* Search Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Search Type
                    </label>
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value as any)}
                      className="select"
                    >
                      <option value="all">All Fields</option>
                      <option value="name">Pet Name</option>
                      <option value="owner">Owner Name</option>
                      <option value="microchip">Microchip</option>
                      <option value="spoodle-id">Spoodle ID</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pet Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="select"
                    >
                      <option value="all">All Types</option>
                      <option value="dog">Dogs</option>
                      <option value="cat">Cats</option>
                      <option value="bird">Birds</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Compliance Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="select"
                    >
                      <option value="all">All Statuses</option>
                      <option value="compliant">Compliant</option>
                      <option value="missing-records">Missing Records</option>
                      <option value="action-needed">Action Needed</option>
                    </select>
                  </div>
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

                {/* Search Results */}
                {isSearching && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Searching...</h3>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.length > 0 && !isSearching && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-medium">
                      Search Results ({searchResults.length})
                    </h3>
                    <div className="space-y-3">
                      {searchResults.map((pet) => (
                        <Card
                          key={pet.id}
                          variant="interactive"
                          onClick={() => handlePetClick(pet)}
                          className="animate-scale-in"
                        >
                          <CardContent className="p-4">
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
                              <div className="flex-1">
                                                                 <div className="flex items-center space-x-3 mb-2">
                                   <h4 className="text-lg font-semibold">{pet.name}</h4>
                                   <span className="text-sm text-foreground">{getTypeIcon(pet.type)} {pet.breed}</span>
                                   <span className="text-sm text-foreground">{pet.age} years old</span>
                                 </div>
                                 <p className="text-foreground mb-2">Owner: {pet.ownerName}</p>
                                 <div className="flex items-center space-x-4 text-sm text-foreground">
                                  <span>ID: {pet.spoodleId}</span>
                                  {pet.microchipNumber && (
                                    <span>Microchip: {pet.microchipNumber}</span>
                                  )}
                                  {pet.lastCheckIn && (
                                    <span>Last Check-in: {new Date(pet.lastCheckIn).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant={getStatusVariant(pet.complianceStatus)}
                                  dot
                                  size="md"
                                  className="mb-2"
                                >
                                  {getStatusText(pet.complianceStatus)}
                                </Badge>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/compliance/check/${pet.id}`;
                                  }}
                                >
                                  Check Compliance
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.length === 0 && searchQuery && !isSearching && !error && (
                  <div className="text-center py-8 animate-fade-in">
                    <div className="text-muted-foreground text-6xl mb-4">🔍</div>
                                         <h3 className="text-lg font-medium text-foreground mb-2">No pets found</h3>
                     <p className="text-foreground">
                       Try adjusting your search criteria or check the spelling
                     </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
              <Card variant="elevated" className="animate-slide-in">
                <CardHeader>
                  <CardTitle>Recently Viewed</CardTitle>
                  <CardDescription>
                    Quick access to recently accessed pet profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentlyViewed.map((pet) => (
                      <Card
                        key={pet.id}
                        variant="interactive"
                        onClick={() => handlePetClick(pet)}
                        className="animate-scale-in"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-lg">
                              {getTypeIcon(pet.type)}
                            </div>
                                                         <div className="flex-1 min-w-0">
                               <p className="font-medium text-sm truncate">{pet.name}</p>
                               <p className="text-xs text-foreground truncate">{pet.ownerName}</p>
                             </div>
                            <Badge
                              variant={getStatusVariant(pet.complianceStatus)}
                              dot
                              size="sm"
                            >
                              {getStatusText(pet.complianceStatus)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  leftIcon={<span>🏥</span>}
                  onClick={() => window.location.href = '/compliance/check'}
                >
                  Start Compliance Check
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  leftIcon={<span>📋</span>}
                  onClick={() => window.location.href = '/requests'}
                >
                  View Owner Requests
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  leftIcon={<span>📊</span>}
                  onClick={() => window.location.href = '/analytics'}
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Search Tips */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Search Tips</CardTitle>
                <CardDescription>
                  Get better search results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-foreground space-y-2">
                  <li>• Use partial names for broader results</li>
                  <li>• Microchip numbers are 15 digits</li>
                  <li>• Spoodle IDs start with "SP"</li>
                  <li>• Filter by pet type for specific results</li>
                  <li>• Check compliance status for quick overview</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
