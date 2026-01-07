'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import { 
  FileText, 
  Search, 
  AlertCircle,
  Calendar,
  User,
  Mail,
  ArrowLeft,
  ChevronRight,
  Dog
} from "lucide-react";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { getForms, getFormSubmissions, type Form, type FormSubmission } from "@/lib/api";
import { useSessionContext } from "@/components/SessionContext";

export default function FormsView() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const { clinicId } = useSessionContext();
  const [searchQuery, setSearchQuery] = useState("");
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

        const result = await getFormSubmissions(selectedForm.id, token);
        
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
  }, [selectedForm, isSignedIn, getToken]);

  const filteredForms = forms.filter(form => {
    const searchTerm = searchQuery.toLowerCase();
    return form.title.toLowerCase().includes(searchTerm) ||
           (form.description && form.description.toLowerCase().includes(searchTerm));
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const renderAnswer = (answer: any) => {
    if (typeof answer === 'string') {
      return answer;
    }
    if (typeof answer === 'object' && answer !== null) {
      if (answer.value !== undefined) {
        return answer.value;
      }
      if (answer.label !== undefined) {
        return answer.label;
      }
      return JSON.stringify(answer);
    }
    return String(answer);
  };

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
    <div className="flex h-screen bg-background">
      {/* Forms List */}
      <div className="w-96 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="lg:hidden"
              onClick={() => router.push("/home")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Forms</h1>
            <Badge variant="secondary" className="ml-auto">
              {forms.length}
            </Badge>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-2">
            {filteredForms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No forms found</p>
              </div>
            ) : (
              filteredForms.map((form) => (
                <Card
                  key={form.id}
                  className={`mb-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedForm?.id === form.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => setSelectedForm(form)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                          <h3 className="font-semibold text-sm truncate">{form.title}</h3>
                        </div>
                        {form.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {form.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {form._count?.submissions || 0} submissions
                          </Badge>
                          {form.isActive ? (
                            <Badge variant="default" className="text-xs">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Submissions View */}
      <div className="flex-1 flex flex-col">
        {selectedForm ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedForm.title}</h2>
                  {selectedForm.description && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedForm.description}</p>
                  )}
                </div>
                <Badge variant="secondary">
                  {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            {/* Submissions List */}
            {loadingSubmissions ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading submissions...</p>
                </div>
              </div>
            ) : submissions.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <h2 className="text-xl font-semibold mb-2">No submissions yet</h2>
                  <p className="text-muted-foreground">
                    Form submissions will appear here when pet owners complete this form.
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {submissions.map((submission) => {
                    const answers = submission.submissionData?.answers || {};
                    const answerKeys = Object.keys(answers);
                    
                    return (
                      <Card key={submission.id} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {submission.petOwner?.user?.firstName && submission.petOwner?.user?.lastName
                                    ? `${submission.petOwner.user.firstName.charAt(0)}${submission.petOwner.user.lastName.charAt(0)}`.toUpperCase()
                                    : submission.respondentName 
                                    ? submission.respondentName.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
                                    : submission.respondentEmail?.charAt(0).toUpperCase() || 'U'
                                  }
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold">
                                  {submission.petOwner?.user 
                                    ? `${submission.petOwner.user.firstName} ${submission.petOwner.user.lastName}`.trim()
                                    : submission.respondentName || submission.respondentEmail || 'Anonymous'
                                  }
                                </h3>
                                <div className="flex flex-col gap-1 mt-1">
                                  {submission.petOwner?.user?.email && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Mail className="h-3 w-3" />
                                      {submission.petOwner.user.email}
                                    </div>
                                  )}
                                  {submission.pet && (
                                    <div className="flex items-center gap-1 text-sm text-primary font-medium">
                                      <Dog className="h-3 w-3" />
                                      {submission.pet.name} {submission.pet.species && `(${submission.pet.species})`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                                <Calendar className="h-3 w-3" />
                                {formatRelativeTime(submission.createdAt)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(submission.createdAt)}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {answerKeys.length === 0 ? (
                              <p className="text-sm text-muted-foreground italic">No answers provided</p>
                            ) : (
                              answerKeys.map((key) => {
                                const answer = answers[key];
                                const questionLabel = answer?.label || key;
                                const answerValue = renderAnswer(answer);
                                
                                return (
                                  <div key={key} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-primary" />
                                      <h4 className="font-medium text-sm text-foreground">
                                        {questionLabel}
                                      </h4>
                                    </div>
                                    <div className="ml-6 pl-4 border-l-2 border-muted">
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {answerValue}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <h2 className="text-xl font-semibold mb-2">Select a form</h2>
              <p className="text-muted-foreground">
                Choose a form from the list to view submissions from pet owners.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

