'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth, useOrganization } from '@clerk/nextjs';

interface SessionUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

interface SessionOrganization {
  id: string;
  name: string;
}

interface SessionContextType {
  user: SessionUser | null;
  organization: SessionOrganization | null;
  isLoading: boolean;
  isSignedIn: boolean;
  hasOrganization: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, signOut: clerkSignOut } = useAuth();
  const { organization, membership, isLoaded: orgLoaded } = useOrganization();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [sessionOrganization, setSessionOrganization] = useState<SessionOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Transform Clerk user to our session user format
  useEffect(() => { 
    if (userLoaded && orgLoaded) {
      if (user && isSignedIn) {
        const transformedUser: SessionUser = {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          fullName: user.fullName || undefined,
        };
        setSessionUser(transformedUser);
      } else {
        setSessionUser(null);
      }

        // Transform Clerk organization to our session organization format
        if (organization) {
          const transformedOrganization: SessionOrganization = {
            id: organization.id,
            name: organization.name,
          };
          setSessionOrganization(transformedOrganization);
        } else {
          setSessionOrganization(null);
        }

      setIsLoading(false);
    }
  }, [user, organization, membership, isSignedIn, userLoaded, orgLoaded]);

  const handleSignOut = async () => {
    try {
      await clerkSignOut();
      setSessionUser(null);
      setSessionOrganization(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshSession = () => {
    // Force re-evaluation of user and organization data
    if (user) {
      const transformedUser: SessionUser = {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        fullName: user.fullName || undefined,
      };
      setSessionUser(transformedUser);
    }

    if (organization) {
      const transformedOrganization: SessionOrganization = {
        id: organization.id,
        name: organization.name,
      };
      setSessionOrganization(transformedOrganization);
    }
  };

  const value: SessionContextType = {
    user: sessionUser,
    organization: sessionOrganization,
    isLoading,
    isSignedIn: !!sessionUser,
    hasOrganization: !!sessionOrganization,
    signOut: handleSignOut,
    refreshSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// Custom hook to use the session context
export function useSessionContext() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
