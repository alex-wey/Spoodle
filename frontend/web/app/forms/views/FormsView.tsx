'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { 
  FileText, 
  AlertCircle,
  ExternalLink
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { getForms, getFormSubmissions, type Form, type FormSubmission } from "@/lib/api";
import { useSessionContext } from "@/components/SessionContext";

export default function FormsView() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const { clinicId } = useSessionContext();
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all forms for the clinic
  useEffect(() => {
    const fetchForms = async () => {
      if (!isSignedIn) {
        setError('Please sign in to view forms');
        setLoading(false);
        return;
      }

      if (!clinicId) {
        setError('No clinic selected. Please select a clinic to view forms.');
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

        const result = await getForms(token);
        
        if (result.success && result.data) {
          setForms(result.data);
          // Auto-select Morning of Surgery Questionnaire if present, else first
          const morning = result.data.find((f) => f.title === "Morning of Surgery Questionnaire");
          setSelectedForm(morning || result.data[0] || null);
          setError(null);
        } else {
          setError(result.message || result.error || 'Failed to fetch forms');
        }
      } catch (err) {
        console.error('Error fetching forms:', err);
        setError('An error occurred while fetching forms');
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [isSignedIn, clinicId, getToken]);

  // Fetch submissions when a form is selected
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedForm || !isSignedIn) {
        setSubmissions([]);
        return;
      }

      try {
        setLoadingSubmissions(true);
        const token = await getToken();
        if (!token) {
          return;
        }

        const result = await getFormSubmissions(selectedForm.id, token, clinicId || undefined);
        
        if (result.success && result.data) {
          setSubmissions(result.data);
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [selectedForm, isSignedIn, getToken, clinicId]);

  type RawField = {
    type?: string;
    label?: string;
    value?: unknown;
  };

  const petNameForRow = (submission: FormSubmission) => {
    if (submission.pet?.name) return submission.pet.name;
    const rawData = submission.submissionData?.rawData as { data?: { fields?: unknown } } | undefined;
    const rawFields = rawData?.data?.fields;
    const fields: RawField[] = Array.isArray(rawFields) ? rawFields : [];
    const hiddenPetName = fields.find(
      (f) => f.type === "HIDDEN_FIELDS" && f.label?.trim() === "petName"
    );
    if (typeof hiddenPetName?.value === "string") {
      return hiddenPetName.value;
    }
    if (Array.isArray(hiddenPetName?.value)) {
      return hiddenPetName?.value.filter(Boolean).join(", ");
    }
    if (hiddenPetName?.value != null) {
      return String(hiddenPetName.value);
    }
    return "Unknown pet";
  };

  const ownerNameForRow = (submission: FormSubmission) => {
    if (submission.petOwner?.user) {
      const { firstName, lastName } = submission.petOwner.user;
      const full = `${firstName || ""} ${lastName || ""}`.trim();
      if (full) return full;
    }
    return submission.respondentEmail || "Unknown owner";
  };

  const submissionLink = (submission: FormSubmission) => {
    if (!selectedForm) return "#";
    return `/forms/${selectedForm.id}/submission/${submission.id}`;
  };

  const rows = submissions.map((s) => ({
    id: s.id,
    pet: petNameForRow(s),
    owner: ownerNameForRow(s),
    href: submissionLink(s),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading forms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Forms</h2>
          <p className="text-muted-foreground">
            Select a form to view submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedForm?.id || undefined}
            onValueChange={(val) => {
              const form = forms.find((f) => f.id === val) || null;
              setSelectedForm(form);
            }}
          >
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Choose a form" />
            </SelectTrigger>
            <SelectContent>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="default">{forms.length} form{forms.length !== 1 ? "s" : ""}</Badge>
        </div>
      </div>

      {!selectedForm ? (
        <Card className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
          <h2 className="text-lg font-semibold mb-1">Select a form</h2>
          <p className="text-sm text-muted-foreground">Choose a form to see submissions.</p>
        </Card>
      ) : loadingSubmissions ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading submissions...</p>
          </div>
        </div>
      ) : submissions.length === 0 ? (
        <Card className="p-6 text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <h2 className="text-lg font-semibold mb-1">No submissions yet</h2>
          <p className="text-sm text-muted-foreground">
            Form submissions will appear here when pet owners complete this form.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h2 className="text-lg font-semibold">{selectedForm.title}</h2>
              <p className="text-sm text-muted-foreground">
                {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Pet</TableHead>
                  <TableHead className="w-1/3">Pet Owner</TableHead>
                  <TableHead className="w-1/3 text-right">Form Submission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.pet}</TableCell>
                    <TableCell>{row.owner}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(row.href)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}

