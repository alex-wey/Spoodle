'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ClipboardList, ExternalLink, Plus, Send, Loader2, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Label } from "../../../../components/ui/label";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { createFormInvite, type FormSubmission } from "@/lib/api";
import { useSessionContext } from "@/components/SessionContext";

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

interface PatientFormsSectionProps {
  formInvites: FormInvite[];
  formInvitesLoading: boolean;
  formSubmissions: FormSubmission[];
  formSubmissionsLoading: boolean;
  patientId: string;
  onRefreshInvites?: () => void;
}

const formOptions = [
  {
    label: 'Morning of Surgery Questionnaire',
    url: 'https://tally.so/r/Y50xYz',
  },
  {
    label: 'Pre-Surgery Instructions',
    url: 'https://tally.so/r/RGDvYj',
  },
  {
    label: 'Medication Protocol for a Stress-Free Recovery',
    url: 'https://tally.so/r/xXJ4y5',
  },
];

export function PatientFormsSection({
  formInvites,
  formInvitesLoading,
  formSubmissions,
  formSubmissionsLoading,
  patientId,
  onRefreshInvites,
}: PatientFormsSectionProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const { clinicId } = useSessionContext();
  const [sendFormDialogOpen, setSendFormDialogOpen] = useState(false);
  const [selectedFormUrls, setSelectedFormUrls] = useState<string[]>([]);
  const [sendingForms, setSendingForms] = useState(false);
  const [sendFormsError, setSendFormsError] = useState<string | null>(null);
  const [sendFormsSuccess, setSendFormsSuccess] = useState(false);

  const handleFormToggle = (url: string, checked: boolean) => {
    if (checked) {
      setSelectedFormUrls(prev => [...prev, url]);
    } else {
      setSelectedFormUrls(prev => prev.filter(u => u !== url));
    }
  };

  const handleSendForms = async () => {
    if (selectedFormUrls.length === 0) return;

    setSendingForms(true);
    setSendFormsError(null);
    setSendFormsSuccess(false);

    try {
      const token = await getToken();
      if (!token) {
        setSendFormsError('Unable to authenticate. Please sign in again.');
        return;
      }

      let successCount = 0;
      let existingCount = 0;

      for (const formUrl of selectedFormUrls) {
        try {
          const selectedForm = formOptions.find(form => form.url === formUrl);
          const formName = selectedForm?.label || 'Form';

          const result = await createFormInvite(
            formUrl,
            formName,
            patientId,
            token
          );

          if (result.success) {
            if (result.message?.includes('already exists')) {
              existingCount++;
            } else {
              successCount++;
            }
          } else {
            console.warn('Failed to create form invite:', result.error || result.message);
          }
        } catch (formError) {
          console.error('Error creating form invite:', formError);
        }
      }

      if (successCount > 0 || existingCount > 0) {
        setSendFormsSuccess(true);
        onRefreshInvites?.();
        setTimeout(() => {
          setSendFormDialogOpen(false);
          setSelectedFormUrls([]);
          setSendFormsSuccess(false);
        }, 1500);
      } else {
        setSendFormsError('Failed to send forms. Please try again.');
      }
    } catch (err) {
      console.error('Send forms error', err);
      setSendFormsError(err instanceof Error ? err.message : 'Failed to send forms');
    } finally {
      setSendingForms(false);
    }
  };

  const handleCloseSendFormDialog = () => {
    if (!sendingForms) {
      setSendFormDialogOpen(false);
      setSelectedFormUrls([]);
      setSendFormsError(null);
      setSendFormsSuccess(false);
    }
  };

  const handleViewSubmission = (submission: FormSubmission) => {
    if (submission.form?.id) {
      router.push(`/forms/${submission.form.id}/submission/${submission.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Invites Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                Form Invites
              </CardTitle>
              <Badge variant="default">{formInvites.length}</Badge>
            </div>
            <Button
              size="icon"
              onClick={() => setSendFormDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formInvitesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading form invites...</p>
              </div>
            </div>
          ) : formInvites.length > 0 ? (
            <div className="space-y-2">
              {formInvites.map((invite) => (
                <Button
                  key={invite.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-2 whitespace-normal text-left"
                  onClick={() => window.open(invite.formLink, '_blank', 'noopener,noreferrer')}
                >
                  <ClipboardList className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{invite.formName}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                </Button>
              ))}
              <p className="text-xs text-muted-foreground pt-2">
                Last sent {new Date(formInvites[0].createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">
                No forms sent yet. Click the + button to send forms to the client.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Submissions Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              Form Submissions
            </CardTitle>
            <Badge variant="default">{formSubmissions.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {formSubmissionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading submissions...</p>
              </div>
            </div>
          ) : formSubmissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Form</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      {submission.form?.title || 'Unknown Form'}
                    </TableCell>
                    <TableCell>
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSubmission(submission)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">
                No form submissions yet. Submissions will appear here when the client completes a form.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Forms Dialog */}
      <Dialog open={sendFormDialogOpen} onOpenChange={handleCloseSendFormDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Forms to Patient</DialogTitle>
            <DialogDescription>
              Select the forms you want to send to the patient&apos;s owner.
            </DialogDescription>
          </DialogHeader>

          {sendFormsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{sendFormsError}</AlertDescription>
            </Alert>
          )}

          {sendFormsSuccess && (
            <Alert>
              <AlertDescription className="text-green-600">Forms sent successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Select Forms</Label>
              <div className="space-y-2">
                {formOptions.map((form) => {
                  const alreadySent = formInvites.some(invite => invite.formName === form.label);
                  return (
                    <div key={form.url} className="flex items-center space-x-2">
                      <Checkbox
                        id={`patient-form-${form.url}`}
                        checked={selectedFormUrls.includes(form.url)}
                        onCheckedChange={(checked) => handleFormToggle(form.url, checked === true)}
                        disabled={sendingForms}
                      />
                      <Label
                        htmlFor={`patient-form-${form.url}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {form.label}
                        {alreadySent && (
                          <span className="text-xs text-muted-foreground ml-2">(already sent)</span>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseSendFormDialog} disabled={sendingForms}>
              Cancel
            </Button>
            <Button
              onClick={handleSendForms}
              disabled={sendingForms || selectedFormUrls.length === 0}
            >
              {sendingForms ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Forms
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
