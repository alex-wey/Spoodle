import { Calendar, Weight, Heart, Dog, Cat, Circle, Dna, Phone, Mail, MapPin, Mars, Venus, AlertTriangle, Utensils, Pencil } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";
import type { PatientData } from "./types";

interface HeroProps {
  patient: PatientData;
  onEdit?: () => void;
  onEditClient?: () => void;
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

export function Hero({ patient, onEdit, onEditClient }: HeroProps) {
  const SpeciesIcon = getSpeciesIcon(patient.species);
  const SexIcon = getSexIcon(patient.biologicalSex);
  
  return (
    <Card className="overflow-hidden">
      <div className="p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Patient Section */}
          <div className="flex-1 lg:flex-[2] flex flex-col">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl flex-shrink-0">
                <AvatarImage src={patient.imageUrl || ''} alt={patient.name} className="object-cover" />
                <AvatarFallback className="text-4xl bg-primary/20 flex items-center justify-center">
                  <SpeciesIcon className="h-12 w-12 text-primary" />
                </AvatarFallback>
              </Avatar>
              
              {/* Basic Info */}
              <div className="flex-1 text-center lg:text-left min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-primary">{patient.name}</h1>
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={onEdit} className="hidden lg:flex">
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                <p className="text-lg text-muted-foreground mb-4">
                  {calculateAge(patient.dateOfBirth)} old{patient.biologicalSex ? ` • ${patient.biologicalSex.charAt(0).toUpperCase() + patient.biologicalSex.slice(1)}` : ''}
                </p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patient.species && (
                    <div className="flex items-center gap-3 text-base">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <SpeciesIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Species</p>
                        <p className="font-medium text-base">{getSpeciesLabel(patient.species)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-base">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Dna className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Breed</p>
                      <p className="font-medium text-base">{patient.breed || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  {patient.biologicalSex && (
                    <div className="flex items-center gap-3 text-base">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <SexIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sex</p>
                        <p className="font-medium text-base">{getSexLabel(patient.biologicalSex)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-base">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium text-base">
                        {patient.dateOfBirth 
                          ? new Date(patient.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {patient.weight && (
                    <div className="flex items-center gap-3 text-base">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Weight className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="font-medium text-base">{patient.weight} lbs</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-base">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Spayed/Neutered</p>
                      <p className="font-medium text-base">{patient.spayedNeutered ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Allergies & Dietary Restrictions */}
                {((patient.allergies && patient.allergies.length > 0) || (patient.dietaryRestrictions && patient.dietaryRestrictions.length > 0)) && (
                  <div className="mt-6 space-y-4">
                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Allergies</p>
                          <div className="flex flex-wrap gap-1">
                            {patient.allergies.map((allergy) => (
                              <Badge key={allergy} variant="destructive" className="text-xs">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {patient.dietaryRestrictions && patient.dietaryRestrictions.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Utensils className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Dietary Restrictions</p>
                          <div className="flex flex-wrap gap-1">
                            {patient.dietaryRestrictions.map((restriction) => (
                              <Badge key={restriction} variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                                {restriction}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile Edit Button */}
          {onEdit && (
            <div className="flex lg:hidden justify-end">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          )}
          
          {/* Divider */}
          {patient.client && (
            <Separator orientation="vertical" className="hidden lg:block h-auto" />
          )}
          
          {/* Client Section */}
          {patient.client && (
            <div className="w-full lg:flex-1 lg:max-w-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {patient.client.imageUrl && (
                        <AvatarImage src={patient.client.imageUrl} alt={patient.client.name} />
                      )}
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {patient.client.name.split(' ').map(n => n.charAt(0)).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-semibold">{patient.client.name}</h4>
                      <Badge>Client</Badge>
                    </div>
                  </div>
                  {onEditClient && (
                    <Button variant="outline" size="sm" onClick={onEditClient}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium truncate">{patient.client.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {patient.client.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{patient.client.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className={`font-medium ${!patient.client.address ? 'text-muted-foreground' : ''}`}>
                        {patient.client.address || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

