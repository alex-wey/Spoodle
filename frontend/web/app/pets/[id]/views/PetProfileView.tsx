'use client';

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { useState, useEffect } from "react";
import { getPetById, getPetDocuments } from "@/lib/api";
import type { Document } from "@/lib/types";
import { Hero } from "../components/Hero";
import { PetRecordsSection } from "../components/PetRecordsSection";
import type { PetData, MedicalRecord } from "../components/types";
import { useSessionContext } from "@/components/SessionContext";

export default function PetProfileView() {
  const { id: petId } = useParams();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const { clinicId } = useSessionContext();
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPetDetails = async () => {
      if (!isSignedIn) {
        setError('Please sign in to view pet details');
        setLoading(false);
        return;
      }

      if (!petId) {
        setError('Pet ID is required');
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

        const result = await getPetById(petId as string, token, clinicId);
        
        if (result.success && result.data) {
          // Transform backend pet data to match UI format
          // Backend now provides owner directly, but keep fallback for backwards compatibility
          const ownerData = result.data.owner || (result.data.petOwner?.user ? {
            id: result.data.petOwner.user.id,
            name: `${result.data.petOwner.user.firstName || ''} ${result.data.petOwner.user.lastName || ''}`.trim() || 'Unknown',
            email: result.data.petOwner.user.email,
            phone: result.data.petOwner.user.phone,
            address: result.data.petOwner.user.address
          } : null);
          
          const petData: PetData = {
            id: result.data.id,
            name: result.data.name,
            species: result.data.species,
            breed: result.data.breed,
            dateOfBirth: result.data.dateOfBirth,
            biologicalSex: result.data.biologicalSex,
            weight: result.data.weight,
            spayedNeutered: result.data.spayedNeutered || false,
            imageUrl: result.data.imageUrl,
            owner: ownerData
          };
          
          console.log('Pet data:', petData);
          console.log('Owner data:', ownerData);
          
          setPet(petData);
          setError(null);
        } else {
          setError(result.message || result.error || 'Failed to fetch pet details');
        }
      } catch (err) {
        console.error('Error fetching pet details:', err);
        setError('An error occurred while fetching pet details');
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchPetDetails();
    }
  }, [petId, isSignedIn, getToken, clinicId]);

  // Fetch pet records
  useEffect(() => {
    const fetchRecords = async () => {
      if (!isSignedIn) {
        setRecordsError('Please sign in to view pet records');
        setRecordsLoading(false);
        return;
      }

      if (!petId) {
        setRecordsError('Pet ID is required');
        setRecordsLoading(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          setRecordsError('Unable to authenticate. Please try signing in again.');
          setRecordsLoading(false);
          return;
        }

        const result = await getPetDocuments(petId as string, token, clinicId);
        
        if (result.success && result.data) {
          // Transform backend document data to match UI format
          const transformedRecords: MedicalRecord[] = result.data.map((doc: Document) => ({
            id: doc.id,
            petId: doc.petId,
            category: doc.category,
            fileName: doc.fileName,
            filePath: doc.filePath,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            createdAt: doc.createdAt
          }));
          
          setMedicalRecords(transformedRecords);
          setRecordsError(null);
        } else {
          setRecordsError(result.message || result.error || 'Failed to fetch pet records');
        }
      } catch (err) {
        console.error('Error fetching pet records:', err);
        setRecordsError('An error occurred while fetching pet records');
      } finally {
        setRecordsLoading(false);
      }
    };

    if (petId) {
      fetchRecords();
    }
  }, [petId, isSignedIn, getToken, clinicId]);


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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/pets')}>Back to Pets</Button>
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
    <div className="flex-1 space-y-6 p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push('/pets')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Pet Profile</h2>
            <p className="text-muted-foreground">
              View and manage pet information and records
            </p>
          </div>
        </div>
      </div>

      <Hero pet={pet} />

      <PetRecordsSection 
        petRecords={medicalRecords}
        loading={recordsLoading}
        error={recordsError}
        onError={setRecordsError}
        petId={petId as string}
        onRefresh={() => {
          // Refetch pet records after upload
          if (petId) {
            const fetchRecords = async () => {
              if (!isSignedIn) return;
              try {
                const token = await getToken();
                if (!token) return;
                const result = await getPetDocuments(petId as string, token, clinicId);
                if (result.success && result.data) {
                  const transformedRecords: MedicalRecord[] = result.data.map((doc: Document) => ({
                    id: doc.id,
                    petId: doc.petId,
                    category: doc.category,
                    fileName: doc.fileName,
                    filePath: doc.filePath,
                    fileSize: doc.fileSize,
                    mimeType: doc.mimeType,
                    createdAt: doc.createdAt
                  }));
                  setMedicalRecords(transformedRecords);
                  setRecordsError(null);
                }
              } catch (err) {
                console.error('Error fetching pet records:', err);
              }
            };
            fetchRecords();
          }
        }}
      />
    </div>
  );
}
