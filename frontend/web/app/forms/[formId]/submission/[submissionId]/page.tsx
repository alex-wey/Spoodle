'use client';

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { AlertCircle, ArrowLeft, FileText } from "lucide-react";
import { getFormSubmissions, type FormSubmission } from "@/lib/api";
import { useSessionContext } from "@/components/SessionContext";

interface FieldDisplay {
  label: string;
  value: string;
}

export default function SubmissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getToken, isSignedIn } = useAuth();
  const { clinicId } = useSessionContext();
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formId = params?.formId as string | undefined;
  const submissionId = params?.submissionId as string | undefined;

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!formId || !submissionId || !isSignedIn) {
        setLoading(false);
        return;
      }
      try {
        const token = await getToken();
        if (!token) {
          setError("Unable to authenticate.");
          setLoading(false);
          return;
        }
        // Use existing endpoint and filter client-side for the single submission.
        const result = await getFormSubmissions(formId, token, clinicId || undefined);
        if (result.success && result.data) {
          const found = result.data.find((s) => s.id === submissionId) || null;
          if (!found) {
            setError("Submission not found.");
          } else {
            setSubmission(found);
          }
        } else {
          setError(result.error || result.message || "Failed to fetch submission.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "An error occurred.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [formId, submissionId, isSignedIn, clinicId, getToken]);

  const fields: FieldDisplay[] = useMemo(() => {
    if (!submission?.submissionData?.rawData?.data?.fields) return [];
    const rawFields = submission.submissionData.rawData.data.fields as any[];
    return rawFields
      .filter((f) => f.type !== "HIDDEN_FIELDS")
      .map((f) => {
        const label = f.label || f.key || "Question";
        const val = f.value;
        if (Array.isArray(val) && Array.isArray(f.options)) {
          const mapped = val
            .map((id: string) => {
              const opt = f.options.find((o: any) => o.id === id || String(o.id) === String(id));
              return opt?.text || opt?.label || opt?.value || id;
            })
            .join(", ");
          return { label, value: mapped || "Not answered" };
        }
        if (val === null || val === undefined || val === "") {
          return { label, value: "Not answered" };
        }
        if (typeof val === "object") {
          if (val.label) return { label, value: String(val.label) };
          if (val.value) return { label, value: String(val.value) };
          return { label, value: JSON.stringify(val) };
        }
        return { label, value: String(val) };
      });
  }, [submission]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-muted-foreground">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Submission not found."}</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Form</p>
          <h1 className="text-2xl font-semibold">{submission.form?.title || "Form submission"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pet: {submission.pet?.name || "Unknown"} • Owner:{" "}
            {submission.petOwner?.user
              ? `${submission.petOwner.user.firstName} ${submission.petOwner.user.lastName}`.trim()
              : submission.respondentEmail || "Unknown"}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="p-5 space-y-4">
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">No answers provided.</p>
        ) : (
          fields.map((f, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-foreground">{f.label}</h3>
              </div>
              <div className="ml-6 pl-4 border-l">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{f.value}</p>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

