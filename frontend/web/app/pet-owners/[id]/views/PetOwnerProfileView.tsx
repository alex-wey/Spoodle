'use client';

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, User, MapPin, Phone, Mail, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
import goldenRetriever from "@/assets/pets/golden-retriever.jpg";
import borderCollie from "@/assets/pets/border-collie.jpg";

// Mock data - would come from API based on ownerId
const petOwners = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, USA",
    memberSince: "January 2022",
    totalAppointments: 10,
    pets: [
      {
        id: "2",
        name: "Luna",
        image: borderCollie.src,
        breed: "Border Collie",
        age: "5 years",
        gender: "Male",
        lastVisit: "2024-09-10"
      },
    ],
    recentActivity: [
      { date: "2024-08-22", activity: "Luna - Dental cleaning scheduled" },
      { date: "2024-07-30", activity: "Luna - Follow-up examination" }
    ],
  },
  {
    id: "2",
    name: "Michael Davis",
    email: "m.davis@email.com",
    phone: "(555) 234-5678",
    address: "456 Oak Avenue, Somewhere, ST 54321",
    memberSince: "January 2022",
    totalAppointments: 12,
    pets: [
      {
        id: "1",
        name: "Max",
        image: goldenRetriever.src,
        breed: "Golden Retriever",
        age: "5 years",
        gender: "Male",
        lastVisit: "2024-09-10"
      },
    ],
    recentActivity: [
      { date: "2024-09-10", activity: "Max - Annual Checkup completed" },
      { date: "2024-08-15", activity: "Max - Vaccination reminder sent" },
    ],
  },
  {
    id: "3",
    name: "Jennifer Wilson",
    email: "jen.wilson@email.com",
    phone: "(555) 345-6789",
    address: "456 Oak Avenue, Somewhere, ST 54321",
    memberSince: "January 2022",
    totalAppointments: 12,
    pets: [
      {
        id: "3",
        name: "Rocky", 
        image: goldenRetriever.src,
        breed: "German Shepherd",
        age: "5 years",
        gender: "Male",
        lastVisit: "2024-09-10"
      },
      {
        id: "4",
        name: "Bella",
        image: borderCollie.src, 
        breed: "Border Collie",
        age: "4 years",
        gender: "Female",
        lastVisit: "2024-08-22"
      }
    ],
    recentActivity: [
      { date: "2024-09-10", activity: "Rocky - Annual Checkup completed" },
      { date: "2024-08-22", activity: "Bella - Dental cleaning scheduled" },
      { date: "2024-08-15", activity: "Rocky - Vaccination reminder sent" },
      { date: "2024-07-30", activity: "Bella - Follow-up examination" }
    ]
  }
];

export default function PetOwnerProfileView() {
  const { id: petOwnerId } = useParams();
  const router = useRouter();

  const handlePetClick = (petId: string) => {
    router.push(`/pets/${petId}`);
  };

  const petOwner = petOwners.find((owner) => owner.id === petOwnerId);

  if (!petOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-muted-foreground mb-4">Pet Owner Not Found</h1>
        <Button onClick={() => router.back()}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {petOwner.name.split(' ').map(n => n.charAt(0)).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-primary">{petOwner.name}</h1>
              <p className="text-lg text-muted-foreground">Pet Owner</p>
              <Badge variant="secondary" className="mt-1">
                Member since {petOwner.memberSince}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Owner Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{petOwner.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{petOwner.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{petOwner.address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{petOwner.pets.length}</p>
                    <p className="text-sm text-muted-foreground">Pets</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-secondary">{petOwner.totalAppointments}</p>
                    <p className="text-sm text-muted-foreground">Total Visits</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {petOwner.recentActivity.map((activity, index) => (
                    <div key={index} className="border-l-2 border-primary/20 pl-4 pb-3 last:pb-0">
                      <p className="text-sm font-medium">{activity.activity}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pets List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Pets ({petOwner.pets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {petOwner.pets.map((pet) => (
                    <div
                      key={pet.id}
                      onClick={() => handlePetClick(pet.id)}
                      className="p-6 border rounded-lg hover:shadow-md cursor-pointer transition-all hover:border-primary/50"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={pet.image} alt={pet.name} />
                          <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-primary mb-2">{pet.name}</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Breed:</span>
                              <span>{pet.breed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Age:</span>
                              <span>{pet.age}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Gender:</span>
                              <span>{pet.gender}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Visit:</span>
                              <span className="text-secondary">{pet.lastVisit}</span>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3 w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePetClick(pet.id);
                            }}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
