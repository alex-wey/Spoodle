'use client';

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { useState, useEffect } from "react";
import { getPetById, getPetDocuments, getFormInvites, getFormSubmissionsByPet, type FormSubmission } from "@/lib/api";
import type { Document } from "@/lib/types";
import { Hero } from "../components/Hero";
import { AddEditPatientDialog, type PatientDialogPatient } from "@/components/primitives/AddEditPatientDialog";
import { EditClientDialog, type ClientData } from "@/components/primitives/EditClientDialog";
import { PatientRecordsSection } from "../components/PatientRecordsSection";
import { PatientFormsSection } from "../components/PatientFormsSection";
import type { PatientData, MedicalRecord } from "../components/types";
import { useSessionContext } from "@/components/SessionContext";
import PageLayout from "@/components/primitives/PageLayout";

interface FormInvite {
  id: string;
  formLink: string;
  formName: string;
  clinicId: string;
  petId: string;
  petOwnerId: string;
  createdAt: string;
  updatedAt: string;
}

export default function PatientProfileView() {
  const { id: patientId } = useParams();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const { clinicId } = useSessionContext();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEditClientDialog, setShowEditClientDialog] = useState(false);
  const [formInvites, setFormInvites] = useState<FormInvite[]>([]);
  const [formInvitesLoading, setFormInvitesLoading] = useState(true);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [formSubmissionsLoading, setFormSubmissionsLoading] = useState(true);

  useEffect(() => {
    const fetchPetDetails = async () => {
      if (!isSignedIn) {
        setError('Please sign in to view patient details');
        setLoading(false);
        return;
      }

      if (!patientId) {
        setError('Patient ID is required');
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

        const result = await getPetById(patientId as string, token, clinicId);
        
        if (result.success && result.data) {
          // Transform backend patient data to match UI format
          // Backend now provides client directly, but keep fallback for backwards compatibility
          const clientData = result.data.owner || (result.data.petOwner?.user ? {
            id: result.data.petOwner.user.id,
            name: `${result.data.petOwner.user.firstName || ''} ${result.data.petOwner.user.lastName || ''}`.trim() || 'Unknown',
            email: result.data.petOwner.user.email,
            phone: result.data.petOwner.user.phone,
            address: result.data.petOwner.user.address
          } : null);
          
          const patientData: PatientData = {
            id: result.data.id,
            name: result.data.name,
            species: result.data.species,
            breed: result.data.breed,
            dateOfBirth: result.data.dateOfBirth,
            biologicalSex: result.data.biologicalSex,
            weight: result.data.weight,
            spayedNeutered: result.data.spayedNeutered || false,
            allergies: result.data.allergies || [],
            dietaryRestrictions: result.data.dietaryRestrictions || [],
            imageUrl: result.data.imageUrl,
            client: clientData
          };
          
          console.log('Patient data:', patientData);
          console.log('Client data:', clientData);
          
          setPatient(patientData);
          setError(null);
        } else {
          setError(result.message || result.error || 'Failed to fetch patient details');
        }
      } catch (err) {
        console.error('Error fetching patient details:', err);
        setError('An error occurred while fetching patient details');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPetDetails();
    }
  }, [patientId, isSignedIn, getToken, clinicId]);

  // Fetch patient records
  useEffect(() => {
    const fetchRecords = async () => {
      if (!isSignedIn) {
        setRecordsError('Please sign in to view patient records');
        setRecordsLoading(false);
        return;
      }

      if (!patientId) {
        setRecordsError('Patient ID is required');
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

        const result = await getPetDocuments(patientId as string, token, clinicId);
        
        if (result.success && result.data) {
          // Transform backend document data to match UI format
          const transformedRecords: MedicalRecord[] = result.data.map((doc: Document) => ({
            id: doc.id,
            patientId: doc.petId,
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
          setRecordsError(result.message || result.error || 'Failed to fetch patient records');
        }
      } catch (err) {
        console.error('Error fetching patient records:', err);
        setRecordsError('An error occurred while fetching patient records');
      } finally {
        setRecordsLoading(false);
      }
    };

    if (patientId) {
      fetchRecords();
    }
  }, [patientId, isSignedIn, getToken, clinicId]);

  // Fetch form invites for this patient
  useEffect(() => {
    const fetchFormInvites = async () => {
      if (!isSignedIn || !patientId) {
        setFormInvitesLoading(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          setFormInvitesLoading(false);
          return;
        }

        const result = await getFormInvites(token, clinicId || undefined, patientId as string);
        if (result?.success && result?.data) {
          setFormInvites(result.data);
        }
      } catch (err) {
        console.error('Error fetching form invites:', err);
      } finally {
        setFormInvitesLoading(false);
      }
    };

    fetchFormInvites();
  }, [patientId, isSignedIn, getToken, clinicId]);

  // Fetch form submissions for this patient
  useEffect(() => {
    const fetchFormSubmissions = async () => {
      if (!isSignedIn || !patientId) {
        setFormSubmissionsLoading(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          setFormSubmissionsLoading(false);
          return;
        }

        const result = await getFormSubmissionsByPet(patientId as string, token);
        if (result?.success && result?.data) {
          setFormSubmissions(result.data);
        }
      } catch (err) {
        console.error('Error fetching form submissions:', err);
      } finally {
        setFormSubmissionsLoading(false);
      }
    };

    fetchFormSubmissions();
  }, [patientId, isSignedIn, getToken]);

  const refreshFormInvites = async () => {
    if (!isSignedIn || !patientId) return;
    try {
      const token = await getToken();
      if (!token) return;
      const result = await getFormInvites(token, clinicId || undefined, patientId as string);
      if (result?.success && result?.data) {
        setFormInvites(result.data);
      }
    } catch (err) {
      console.error('Error refreshing form invites:', err);
    }
  };

  const handlePatientUpdated = (updatedPatient: PatientDialogPatient) => {
    setPatient((prev: PatientData | null) => prev ? {
      ...prev,
      name: updatedPatient.name,
      species: updatedPatient.species,
      breed: updatedPatient.breed,
      biologicalSex: updatedPatient.biologicalSex,
      dateOfBirth: updatedPatient.dateOfBirth,
      weight: updatedPatient.weight,
      spayedNeutered: updatedPatient.spayedNeutered ?? false,
      allergies: updatedPatient.allergies || [],
      dietaryRestrictions: updatedPatient.dietaryRestrictions || [],
    } : null);
  };

  const handleClientUpdated = (updatedClient: ClientData) => {
    setPatient((prev: PatientData | null) => prev ? {
      ...prev,
      client: {
        id: updatedClient.id,
        name: updatedClient.name,
        email: updatedClient.email,
        phone: updatedClient.phone,
        address: updatedClient.address,
        imageUrl: updatedClient.imageUrl,
      }
    } : null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading patient profile...</p>
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
        <Button onClick={() => router.push('/patients')}>Back to Patients</Button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold text-muted-foreground mb-4">Patient Not Found</h1>
        <Button onClick={() => router.push('/patients')}>Back to Patients</Button>
      </div>
    );
  }

  return (
    <PageLayout
      title="Patient Profile"
      description="View and manage patient information and records"
      backAction={
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push('/patients')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      }
    >
      <Hero 
        patient={patient} 
        onEdit={() => setShowEditDialog(true)} 
        onEditClient={() => setShowEditClientDialog(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <PatientRecordsSection 
            patientRecords={medicalRecords}
            loading={recordsLoading}
            error={recordsError}
            onError={setRecordsError}
            patientId={patientId as string}
            onRefresh={() => {
              // Refetch patient records after upload
              if (patientId) {
                const fetchRecords = async () => {
                  if (!isSignedIn) return;
                  try {
                    const token = await getToken();
                    if (!token) return;
                    const result = await getPetDocuments(patientId as string, token, clinicId);
                    if (result.success && result.data) {
                      const transformedRecords: MedicalRecord[] = result.data.map((doc: Document) => ({
                        id: doc.id,
                        patientId: doc.petId,
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
                    console.error('Error fetching patient records:', err);
                  }
                };
                fetchRecords();
              }
            }}
          />
        </div>

        <div className="lg:col-span-2">
          <PatientFormsSection
            formInvites={formInvites}
            formInvitesLoading={formInvitesLoading}
          formSubmissions={formSubmissions}
          formSubmissionsLoading={formSubmissionsLoading}
          patientId={patientId as string}
            onRefreshInvites={refreshFormInvites}
          />
        </div>
      </div>

      <AddEditPatientDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        patient={patient}
        onEditSuccess={handlePatientUpdated}
        clinicId={clinicId}
      />

      <EditClientDialog
        open={showEditClientDialog}
        onOpenChange={setShowEditClientDialog}
        client={patient.client ? {
          id: patient.client.id,
          name: patient.client.name,
          email: patient.client.email,
          phone: patient.client.phone,
          address: patient.client.address,
          imageUrl: patient.client.imageUrl,
        } : null}
        onSuccess={handleClientUpdated}
        clinicId={clinicId}
      />
    </PageLayout>
  );
}
