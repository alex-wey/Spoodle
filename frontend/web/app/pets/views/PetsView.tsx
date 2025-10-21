'use client';

import { useState, useEffect } from "react";
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

// API data interface
interface ApiPetData {
  petId: string;
  petName: string;
  breed: string;
  dateOfBirth: string;
  gender: string;
  owner?: string;
  age?: string;
  weight?: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    table: ApiPetData[];
    summary: Record<string, unknown>;
  };
}

interface Pet {
  petId: string;
  petName: string;
  petImage: string;
  ownerName: string;
  breed: string;
  dateOfBirth: string;
  weight: string;
  recordCount: number;
}

export default function Records() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch pets from the API
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/pet-table?includeOwner=true');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const result: ApiResponse = await response.json();
        
        if (result.success) {
          // Transform API data to match the table format
          const transformedPets: Pet[] = result.data.table.map(pet => ({
            petId: pet.petId,
            petName: pet.petName,
            petImage: '', // No default image from API
            ownerName: pet.owner || 'Unknown Owner',
            breed: pet.breed,
            dateOfBirth: pet.dateOfBirth,
            weight: pet.weight || 'N/A',
            recordCount: 0 // TODO: Get actual record count from API
          }));
          
          setAllPets(transformedPets);
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
        setAllPets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

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
          <CardTitle>All Pets ({loading ? '...' : filteredPets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading pets...</p>
              </div>
            </div>
          ) : (
            <>
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
                            <AvatarImage src={pet.petImage} alt={pet.petName} />
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
