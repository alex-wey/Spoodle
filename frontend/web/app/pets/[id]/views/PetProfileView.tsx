'use client';

import { useParams, useRouter } from "next/navigation";
import { User, Phone, Mail, MapPin, Cake, Weight, Heart, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
import { Separator } from "../../../../components/ui/separator";
import { useState, useEffect } from "react";

interface PetData {
  petId: string;
  name: string;
  breed: string;
  dateOfBirth: string;
  gender: string;
  weight: number;
  spayedNeutered: boolean;
  profilePhoto?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

export default function PetProfileView() {
  const { id: petId } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch pet details from API
  useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/pets/${petId}/details`);
        if (!response.ok) throw new Error('Failed to fetch pet details');
        
        const result = await response.json();
        if (result.success) {
          setPet(result.data);
        }
      } catch (error) {
        console.error('Error fetching pet details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchPetDetails();
    }
  }, [petId]);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const ageInYears = Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const ageInMonths = Math.floor((today.getTime() - birth.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
    
    if (ageInYears < 1) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
    }
    return `${ageInYears} year${ageInYears !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pet profile...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold text-muted-foreground mb-4">Pet Not Found</h1>
        <Button onClick={() => router.push('/pets')}>Back to Pets</Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Section with Pet Photo and Basic Info */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Pet Avatar */}
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={pet.profilePhoto} alt={pet.name} className="object-cover" />
                <AvatarFallback className="text-4xl bg-primary/20">{pet.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              {/* Pet Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-primary">{pet.name}</h1>
                  <Badge variant="secondary" className="text-sm w-fit mx-auto md:mx-0">
                    <Activity className="h-3 w-3 mr-1" />
                    {pet.breed}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground mb-4">
                  {calculateAge(pet.dateOfBirth)} old • {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Cake className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Birthday</p>
                      <p className="font-medium">{new Date(pet.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Weight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="font-medium">{pet.weight} lbs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Spayed/Neutered</p>
                      <p className="font-medium">{pet.spayedNeutered ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Owner Information and Additional Information Cards - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Owner Information Card */}
          {pet.owner && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Pet Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {pet.owner.name.split(' ').map(n => n.charAt(0)).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="w-full space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">{pet.owner.name}</h3>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium truncate">{pet.owner.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium">{pet.owner.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Address</p>
                          <p className="font-medium">{pet.owner.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>Breed</span>
                  </div>
                  <p className="text-lg font-semibold">{pet.breed}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Gender</span>
                  </div>
                  <p className="text-lg font-semibold capitalize">{pet.gender}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                  <Badge variant={pet.spayedNeutered ? "default" : "secondary"} className="text-sm">
                    {pet.spayedNeutered ? 'Spayed/Neutered' : 'Not Spayed/Neutered'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
