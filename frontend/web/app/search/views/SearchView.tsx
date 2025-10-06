'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Users, Heart } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import goldenRetriever from "@/assets/pets/golden-retriever.jpg";
import tabbycat from "@/assets/pets/tabby-cat.jpg";
import germanShepherd from "@/assets/pets/german-shepherd.jpg";
import borderCollie from "@/assets/pets/border-collie.jpg";

interface Pet {
  id: string;
  name: string;
  image: string;
  breed: string;
  age: string;
  ownerId: string;
}

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  image?: string;
  pets: Pet[];
}

// Mock data
const mockOwners: Owner[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    pets: [
      {
        id: "1",
        name: "Max",
        image: goldenRetriever.src,
        breed: "Golden Retriever", 
        age: "3 years",
        ownerId: "1"
      }
    ]
  },
  {
    id: "2", 
    name: "Michael Davis",
    email: "m.davis@email.com",
    phone: "(555) 234-5678",
    pets: [
      {
        id: "2",
        name: "Luna",
        image: tabbycat.src,
        breed: "Tabby Cat",
        age: "2 years",
        ownerId: "2"
      }
    ]
  },
  {
    id: "3",
    name: "Jennifer Wilson", 
    email: "jen.wilson@email.com",
    phone: "(555) 345-6789",
    pets: [
      {
        id: "3",
        name: "Rocky",
        image: germanShepherd.src,
        breed: "German Shepherd",
        age: "5 years", 
        ownerId: "3"
      },
      {
        id: "4",
        name: "Bella",
        image: borderCollie.src,
        breed: "Border Collie",
        age: "4 years",
        ownerId: "3"
      }
    ]
  }
];

export default function SearchView() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filteredData = mockOwners.filter(owner => {
    const searchTerm = searchQuery.toLowerCase();
    // Search in owner data
    const ownerMatch = owner.name.toLowerCase().includes(searchTerm) ||
                      owner.email.toLowerCase().includes(searchTerm) ||
                      owner.phone.includes(searchTerm);
    
    // Search in pet data
    const petMatch = owner.pets.some(pet => 
      pet.name.toLowerCase().includes(searchTerm) ||
      pet.breed.toLowerCase().includes(searchTerm)
    );
    
    return ownerMatch || petMatch;
  });

  const handlePetClick = (petId: string) => {
    router.push(`/pets/${petId}`);
  };

  const handleOwnerClick = (ownerId: string) => {
    router.push(`/pet-owners/${ownerId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header with green background and paw logo */}
      <div className="bg-gradient-to-r from-secondary to-secondary-light p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-full">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Pet & Owner Directory</h1>
        </div>
        
        {/* Single Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              placeholder="Search for pets, owners, or contact info..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/90 border-0 h-12 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} found
            </h2>
          </div>
          <div className="space-y-3">
            {filteredData.map((owner) => (
              <Card key={owner.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex">
                  {/* Owner Section */}
                  <div 
                    onClick={() => handleOwnerClick(owner.id)}
                    className="flex-1 p-4 hover:bg-muted/50 cursor-pointer transition-colors border-r border-border"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={owner.image} alt={owner.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {owner.name.split(' ').map(n => n.charAt(0)).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold text-primary truncate">{owner.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{owner.email}</p>
                        <p className="text-sm text-muted-foreground">{owner.phone}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {owner.pets.length} pet{owner.pets.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>

                  {/* Pets Section */}
                  <div className="flex-1 p-4 bg-muted/20">
                    <div className="space-y-3">
                      {owner.pets.map((pet) => (
                        <div
                          key={pet.id}
                          onClick={() => handlePetClick(pet.id)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-background cursor-pointer transition-colors"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={pet.image} alt={pet.name} />
                            <AvatarFallback className="text-xs">{pet.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Heart className="h-3 w-3 text-secondary" />
                              <h4 className="font-medium text-sm text-foreground truncate">{pet.name}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{pet.breed} • {pet.age}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
