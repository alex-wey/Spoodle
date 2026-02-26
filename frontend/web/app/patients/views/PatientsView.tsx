'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FileText, Search, AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getClinicPets } from "@/lib/api";
import { useSessionContext } from "@/components/SessionContext";
import type { Pet as ApiPet } from "@/lib/types";
import PageLayout from "@/components/primitives/PageLayout";
import { AddEditPatientDialog } from "@/components/primitives/AddEditPatientDialog";

interface Patient {
  id: string;
  name: string;
  imageUrl?: string | null;
  species?: string | null;
  breed?: string | null;
  dateOfBirth?: string | null;
  weight?: number | null;
  client?: {
    name: string;
    email?: string;
    phone?: string | null;
    address?: string | null;
  } | null;
}

export default function PatientsView() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const { clinicId, userType } = useSessionContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!isSignedIn) {
        setError('Please sign in to view patients');
        setLoading(false);
        return;
      }

      if (!clinicId) {
        setError('No clinic selected. Please select a clinic to view patients.');
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
          // Transform backend patient data to match UI format
          // Backend now returns patients with client information included
          const transformedPatients: Patient[] = result.data.map((patient: ApiPet) => ({
            id: patient.id,
            name: patient.name,
            imageUrl: patient.imageUrl,
            species: patient.species,
            breed: patient.breed || 'Unknown',
            dateOfBirth: patient.dateOfBirth,
            weight: patient.weight,
            client: patient.owner || null
          }));
          
          setAllPatients(transformedPatients);
          setError(null);
        } else {
          setError(result.message || result.error || 'Failed to fetch patients');
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('An error occurred while fetching patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [isSignedIn, getToken, clinicId]);

  const filteredPatients = allPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (patient.species || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (patient.breed || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handlePatientAdded = (newPatient: ApiPet) => {
    const transformedPatient: Patient = {
      id: newPatient.id,
      name: newPatient.name,
      imageUrl: newPatient.imageUrl,
      species: newPatient.species,
      breed: newPatient.breed || 'Unknown',
      dateOfBirth: newPatient.dateOfBirth,
      weight: newPatient.weight,
      client: newPatient.owner || null
    };
    setAllPatients((prevPatients) => [transformedPatient, ...prevPatients]);
    setShowAddPatientDialog(false);
  };

  return (
    <PageLayout
      title="Patients"
      description="View all patients and their medical records"
    >
      {/* Patients Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>All Patients</CardTitle>
                <Badge variant="default">{loading ? '...' : filteredPatients.length}</Badge>
              </div>
              <Button onClick={() => setShowAddPatientDialog(true)}>
                <Plus className="h-4 w-4" />
                New Patient
              </Button>
            </div>
            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, client, species, or breed..."
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
                <p className="text-muted-foreground">Loading patients...</p>
              </div>
            </div>
          ) : !error ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Species</TableHead>
                    <TableHead>Breed</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Medical Records</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow 
                      key={patient.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/patients/${patient.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={patient.imageUrl || ''} alt={patient.name} />
                            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{patient.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{patient.client?.name || 'Unknown Client'}</TableCell>
                      <TableCell>{patient.species || 'N/A'}</TableCell>
                      <TableCell>{patient.breed || 'Unknown'}</TableCell>
                      <TableCell>
                        {patient.dateOfBirth 
                          ? new Date(patient.dateOfBirth).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {patient.weight ? `${patient.weight} lbs` : 'N/A'}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/patients/${patient.id}?tab=records`)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Records
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredPatients.length === 0 && !loading && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No patients found</p>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "Try adjusting your search criteria"
                      : "No patients have been added yet"
                    }
                  </p>
                </div>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>

      <AddEditPatientDialog
        open={showAddPatientDialog}
        onOpenChange={setShowAddPatientDialog}
        onSuccess={handlePatientAdded}
        isStaff={userType === 'staff'}
        clinicId={clinicId}
      />
    </PageLayout>
  );
}
