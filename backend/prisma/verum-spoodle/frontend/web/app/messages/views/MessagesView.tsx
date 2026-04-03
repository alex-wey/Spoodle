'use client';

import { MessageSquare, Send, Users, Zap, AlertCircle } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import PageLayout from "@/components/primitives/PageLayout";

export default function MessagesView() {
  // TODO: Implement real-time messaging with WebSocket or similar
  // const { getToken, isSignedIn } = useAuth();
  // const { clinicId } = useSessionContext();
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  return (
    <PageLayout
      title="Messages"
      description="Communicate seamlessly with pet owners"
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-2xl w-full space-y-6 text-center">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
              <div className="relative bg-primary/10 p-6 rounded-full">
                <MessageSquare className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Coming Soon</h2>
            <p className="text-muted-foreground">
              A powerful messaging platform to communicate seamlessly with pet owners, share updates, and provide quick consultations.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-4 pb-4 space-y-1">
                <div className="flex justify-center">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">Instant Messaging</h3>
                <p className="text-xs text-muted-foreground">
                  Real-time chat with pet owners
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-4 pb-4 space-y-1">
                <div className="flex justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">Group Conversations</h3>
                <p className="text-xs text-muted-foreground">
                  Collaborate with your team
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-4 pb-4 space-y-1">
                <div className="flex justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">Quick Replies</h3>
                <p className="text-xs text-muted-foreground">
                  Save time with templates
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
              <AlertCircle className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">In Development</span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
