'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FileText, Search } from "lucide-react";
import goldenRetriever from "@/assets/pets/golden-retriever.jpg";
import tabbycat from "@/assets/pets/tabby-cat.jpg";
import germanShepherd from "@/assets/pets/german-shepherd.jpg";
import borderCollie from "@/assets/pets/border-collie.jpg";

export default function Records() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // TODO: insert hook to fetch pets from the database

  // Mock pet data
  const allPets = [
    {
      petId: "1",
      petName: "Max",
      petImage: goldenRetriever,
      ownerName: "Sarah Johnson",
      breed: "Golden Retriever",
      dateOfBirth: "2019-03-15",
      weight: "32 kg",
      recordCount: 3
    },
    {
      petId: "2",
      petName: "Whiskers",
      petImage: tabbycat,
      ownerName: "Michael Chen",
      breed: "Tabby Cat",
      dateOfBirth: "2020-07-22",
      weight: "4.5 kg",
      recordCount: 1
    },
    {
      petId: "3",
      petName: "Buddy",
      petImage: germanShepherd,
      ownerName: "Emma Wilson",
      breed: "German Shepherd",
      dateOfBirth: "2018-11-08",
      weight: "38 kg",
      recordCount: 1
    },
    {
      petId: "4",
      petName: "Luna",
      petImage: borderCollie,
      ownerName: "David Brown",
      breed: "Border Collie",
      dateOfBirth: "2021-01-30",
      weight: "18 kg",
      recordCount: 1
    },
  ];

  const filteredPets = allPets.filter(pet => {
    const matchesSearch = pet.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pet.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pets</h2>
          <p className="text-muted-foreground">
            View all pets and their medical records
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by pet name, owner, or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Pets ({filteredPets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Medical Records</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPets.map((pet) => (
                <TableRow key={pet.petId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={pet.petImage.src} alt={pet.petName} />
                        <AvatarFallback>{pet.petName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{pet.petName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{pet.ownerName}</TableCell>
                  <TableCell>{pet.breed}</TableCell>
                  <TableCell>{pet.dateOfBirth}</TableCell>
                  <TableCell>{pet.weight}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/pets/${pet.petId}`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Records ({pet.recordCount})
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredPets.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No pets found</p>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Try adjusting your search criteria"
                  : "No pets have been added yet"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
