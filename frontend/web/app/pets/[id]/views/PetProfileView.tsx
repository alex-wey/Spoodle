'use client';

import { useParams, useRouter } from "next/navigation";
import { User, Calendar, Phone, Mail, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
import { Input } from "../../../../components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../../components/ui/table";
import { useState, useEffect } from "react";

interface PetProfileViewProps {
  onViewRecords?: () => void;
}

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

export default function PetProfileView({ onViewRecords }: PetProfileViewProps = {}) {
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

  // Mock appointments data - TODO: fetch from API
  const appointments = [
    {
      id: "1",
      date: "2024-09-10",
      reason: "Annual Checkup",
      status: "Completed",
      veterinarian: "Dr. Chen"
    },
    {
      id: "2",
      date: "2024-08-15",
      reason: "Vaccination Update",
      status: "Completed",
      veterinarian: "Dr. Martinez"
    },
    {
      id: "3",
      date: "2024-07-20",
      reason: "Limping Examination",
      status: "Completed",
      veterinarian: "Dr. Chen"
    }
  ];

  const handleOwnerClick = () => {
    if (pet?.owner?.id) {
      router.push(`/pet-owners/${pet.owner.id}`);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const ageInYears = Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return `${ageInYears} year${ageInYears !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pet details...</p>
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
      <div className="max-w-7xl mx-auto">
        {/* Pet Header Info */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={pet.profilePhoto} alt={pet.name} />
            <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-primary">{pet.name}</h1>
            <p className="text-lg text-muted-foreground">{pet.breed}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pet Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Pet Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">Age</label>
                    <p>{calculateAge(pet.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Gender</label>
                    <p className="capitalize">{pet.gender}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Birth Date</label>
                    <p>{new Date(pet.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Weight</label>
                    <p>{pet.weight} lbs</p>
                  </div>
                  <div className="col-span-2">
                    <label className="font-medium text-muted-foreground">Spay/Neuter Status</label>
                    <p>{pet.spayedNeutered ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Information */}
            {pet.owner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Pet Owner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={handleOwnerClick}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {pet.owner.name.split(' ').map(n => n.charAt(0)).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium">{pet.owner.name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {pet.owner.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {pet.owner.phone}
                        </div>
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Appointment History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment History
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Appointment
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Input placeholder="Search appointments..." className="max-w-sm" />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pet</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Veterinarian</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={pet.profilePhoto} alt={pet.name} />
                              <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {pet.name}
                          </div>
                        </TableCell>
                        <TableCell>{appointment.date}</TableCell>
                        <TableCell>{appointment.reason}</TableCell>
                        <TableCell>{appointment.veterinarian}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={appointment.status === 'Completed' ? 'default' : 'secondary'}
                            className={appointment.status === 'Completed' ? 'bg-secondary' : ''}
                          >
                            {appointment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
