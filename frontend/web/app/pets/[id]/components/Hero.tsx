import { Calendar, Weight, Heart, Dog, Cat, Circle, Dna, Phone, Mail, MapPin, Mars, Venus } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";
import type { PetData } from "./types";

interface HeroProps {
  pet: PetData;
}

// Calculate age from date of birth
const calculateAge = (dateOfBirth: string | null | undefined) => {
  if (!dateOfBirth) return 'Unknown';
  const birth = new Date(dateOfBirth);
  const today = new Date();
  const ageInYears = Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const ageInMonths = Math.floor((today.getTime() - birth.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
  
  if (ageInYears < 1) {
    return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
  }
  return `${ageInYears} year${ageInYears !== 1 ? 's' : ''}`;
};

// Get species icon based on species
const getSpeciesIcon = (species: string | null | undefined) => {
  const normalizedSpecies = (species || '').toLowerCase();
  switch (normalizedSpecies) {
    case 'dog':
      return Dog;
    case 'cat':
      return Cat;
    default:
      return Circle;
  }
};

// Get sex icon based on biological sex
const getSexIcon = (biologicalSex: string | null | undefined) => {
  const normalizedSex = (biologicalSex || '').toLowerCase();
  if (normalizedSex === 'male') {
    return Mars;
  } else if (normalizedSex === 'female') {
    return Venus;
  }
  return Heart;
};

// Get sex label
const getSexLabel = (biologicalSex: string | null | undefined) => {
  if (!biologicalSex) return 'Unknown';
  const normalizedSex = biologicalSex.toLowerCase();
  return normalizedSex.charAt(0).toUpperCase() + normalizedSex.slice(1);
};

// Get species label
const getSpeciesLabel = (species: string | null | undefined) => {
  if (!species) return 'Unknown';
  const normalizedSpecies = species.toLowerCase();
  return normalizedSpecies.charAt(0).toUpperCase() + normalizedSpecies.slice(1);
};

export function Hero({ pet }: HeroProps) {
  const SpeciesIcon = getSpeciesIcon(pet.species);
  const SexIcon = getSexIcon(pet.biologicalSex);
  
  return (
    <Card className="overflow-hidden relative">
      <div className="p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Pet Section */}
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl flex-shrink-0">
                <AvatarImage src={pet.imageUrl || ''} alt={pet.name} className="object-cover" />
                <AvatarFallback className="text-4xl bg-primary/20 flex items-center justify-center">
                  <SpeciesIcon className="h-12 w-12 text-primary" />
                </AvatarFallback>
              </Avatar>
              
              {/* Basic Info */}
              <div className="flex-1 text-center lg:text-left min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-primary">{pet.name}</h1>
                </div>
                <p className="text-lg text-muted-foreground mb-4">
                  {calculateAge(pet.dateOfBirth)} old{pet.biologicalSex ? ` • ${pet.biologicalSex.charAt(0).toUpperCase() + pet.biologicalSex.slice(1)}` : ''}
                </p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pet.species && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <SpeciesIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Species</p>
                        <p className="font-medium">{getSpeciesLabel(pet.species)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Dna className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Breed</p>
                      <p className="font-medium">{pet.breed || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  {pet.biologicalSex && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <SexIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sex</p>
                        <p className="font-medium">{getSexLabel(pet.biologicalSex)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">
                        {pet.dateOfBirth 
                          ? new Date(pet.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {pet.weight && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Weight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Weight</p>
                        <p className="font-medium">{pet.weight} lbs</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
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
          
          {/* Divider */}
          {pet.owner && (
            <Separator orientation="vertical" className="hidden lg:block h-auto" />
          )}
          
          {/* Owner Section */}
          {pet.owner && (
            <div className="w-full lg:w-auto lg:min-w-[320px]">
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {pet.owner.name.split(' ').map(n => n.charAt(0)).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-semibold">{pet.owner.name}</h4>
                    <Badge>Owner</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium truncate">{pet.owner.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {pet.owner.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{pet.owner.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {pet.owner.address && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="font-medium">{pet.owner.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

