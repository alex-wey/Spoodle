'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { FileText, Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getClinicPets } from "@/lib/api";
import { useSessionContext } from "@/components/SessionContext";
import type { Pet as ApiPet } from "@/lib/types";
import PageLayout from "@/components/primitives/PageLayout";

interface Pet {
  id: string;
  name: string;
  imageUrl?: string | null;
  species?: string | null;
  breed?: string | null;
  dateOfBirth?: string | null;
  weight?: number | null;
  owner?: {
    name: string;
    email?: string;
    phone?: string | null;
    address?: string | null;
  } | null;
}

export default function Records() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const { clinicId } = useSessionContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPets = async () => {
      if (!isSignedIn) {
        setError('Please sign in to view pets');
        setLoading(false);
        return;
      }

      if (!clinicId) {
        setError('No clinic selected. Please select a clinic to view pets.');
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          setError('Unable to authenticate. Please try signing in again.');
          setLoading(false);
          return;
        }

        const result = await getClinicPets(token, clinicId);
        
        if (result.success && result.data) {
          // Transform backend pet data to match UI format
          // Backend now returns pets with owner information included
          const transformedPets: Pet[] = result.data.map((pet: ApiPet) => ({
            id: pet.id,
            name: pet.name,
            imageUrl: pet.imageUrl,
            species: pet.species,
            breed: pet.breed || 'Unknown',
            dateOfBirth: pet.dateOfBirth,
            weight: pet.weight,
            // Backend now includes owner data directly
            owner: pet.owner || null
          }));
          
          setAllPets(transformedPets);
          setError(null);
        } else {
          setError(result.message || result.error || 'Failed to fetch pets');
        }
      } catch (err) {
        console.error('Error fetching pets:', err);
        setError('An error occurred while fetching pets');
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [isSignedIn, getToken, clinicId]);

  const filteredPets = allPets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pet.owner?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (pet.species || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (pet.breed || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <PageLayout
      title="Pets"
      description="View all pets and their medical records"
    >
      {/* Pets Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <CardTitle>All Pets</CardTitle>
              <Badge variant="default">{loading ? '...' : filteredPets.length}</Badge>
            </div>
            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by pet name, owner, species, or breed..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading pets...</p>
              </div>
            </div>
          ) : !error ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Pet Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Species</TableHead>
                    <TableHead>Breed</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Medical Records</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPets.map((pet) => (
                    <TableRow 
                      key={pet.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/pets/${pet.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={pet.imageUrl || ''} alt={pet.name} />
                            <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{pet.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{pet.owner?.name || 'Unknown Owner'}</TableCell>
                      <TableCell>{pet.species || 'N/A'}</TableCell>
                      <TableCell>{pet.breed || 'Unknown'}</TableCell>
                      <TableCell>
                        {pet.dateOfBirth 
                          ? new Date(pet.dateOfBirth).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {pet.weight ? `${pet.weight} lbs` : 'N/A'}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/pets/${pet.id}?tab=records`)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Records
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredPets.length === 0 && !loading && (
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
          ) : null}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
