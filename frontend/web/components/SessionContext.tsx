'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth, useOrganization } from '@clerk/nextjs';
import { apiRequest } from '@/lib/api';

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

interface Clinic {
  id: string;
  clerkOrgId: string;
  name: string;
  slug: string;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  imageUrl?: string | null;
}

interface SessionContextType {
  user: SessionUser | null;
  organization: SessionOrganization | null;
  clinic: Clinic | null;
  clinicId: string | null;
  userType: 'petOwner' | 'staff' | null;
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
  const { isSignedIn, signOut: clerkSignOut, getToken } = useAuth();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [sessionOrganization, setSessionOrganization] = useState<SessionOrganization | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [userType, setUserType] = useState<'petOwner' | 'staff' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from backend to get userType
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userLoaded || !orgLoaded || !isSignedIn || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const sessionToken = await getToken();
        if (!sessionToken) {
          setIsLoading(false);
          return;
        }

        // Fetch user type from backend
        const userResponse = await apiRequest<{
          id: string;
          email: string;
          firstName?: string;
          lastName?: string;
          userType: 'petOwner' | 'staff' | null;
        }>('/api/auth/me', {
          method: 'GET',
        }, sessionToken);

        if (userResponse.success && userResponse.data) {
          // Set user info
          const transformedUser: SessionUser = {
            id: userResponse.data.id,
            email: userResponse.data.email || user.primaryEmailAddress?.emailAddress || '',
            firstName: userResponse.data.firstName || user.firstName || undefined,
            lastName: userResponse.data.lastName || user.lastName || undefined,
            fullName: userResponse.data.firstName && userResponse.data.lastName 
              ? `${userResponse.data.firstName} ${userResponse.data.lastName}`.trim()
              : user.fullName || undefined,
          };
          setSessionUser(transformedUser);

          // Set user type
          setUserType(userResponse.data.userType);
        } else {
          console.warn('Failed to fetch user profile:', userResponse.error || userResponse.message);
          // Fallback to Clerk data if API fails
          const transformedUser: SessionUser = {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            fullName: user.fullName || undefined,
          };
          setSessionUser(transformedUser);
          setUserType(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to Clerk data
        const transformedUser: SessionUser = {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          fullName: user.fullName || undefined,
        };
        setSessionUser(transformedUser);
        setUserType(null);
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
    };

    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isSignedIn, userLoaded, orgLoaded, getToken]);

  // Fetch clinic information based on active organization from Clerk
  useEffect(() => {
    const fetchClinicByOrganization = async () => {
      if (!orgLoaded) {
        return; // Wait for organization to load
      }

      if (!organization || !isSignedIn) {
        setClinic(null);
        setClinicId(null);
        return;
      }

      try {
        const sessionToken = await getToken();
        if (!sessionToken) {
          console.warn('No session token available for clinic fetch');
          setClinic(null);
          setClinicId(null);
          return;
        }

        // Fetch clinic by organization ID
        const clinicResponse = await apiRequest<Clinic>(
          `/api/clinics/by-organization/${organization.id}`,
          {
            method: 'GET',
          },
          sessionToken
        );

        if (clinicResponse.success && clinicResponse.data) {
          setClinic(clinicResponse.data);
          setClinicId(clinicResponse.data.id);
        } else {
          console.warn('Failed to fetch clinic:', clinicResponse.error || clinicResponse.message);
          setClinic(null);
          setClinicId(null);
        }
      } catch (error) {
        console.error('Error fetching clinic by organization:', error);
        setClinic(null);
        setClinicId(null);
      }
    };

    fetchClinicByOrganization();
  }, [organization, organization?.id, isSignedIn, orgLoaded, getToken]);

  const handleSignOut = async () => {
    try {
      await clerkSignOut();
      setSessionUser(null);
      setSessionOrganization(null);
      setClinic(null);
      setClinicId(null);
      setUserType(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshSession = async () => {
    if (!isSignedIn || !user) {
      return;
    }

    try {
      const sessionToken = await getToken();
      if (!sessionToken) {
        return;
      }

      // Refresh user profile
      const userResponse = await apiRequest<{
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        userType: 'petOwner' | 'staff' | null;
      }>('/api/auth/me', {
        method: 'GET',
      }, sessionToken);

      if (userResponse.success && userResponse.data) {
        const transformedUser: SessionUser = {
          id: userResponse.data.id,
          email: userResponse.data.email || user.primaryEmailAddress?.emailAddress || '',
          firstName: userResponse.data.firstName || user.firstName || undefined,
          lastName: userResponse.data.lastName || user.lastName || undefined,
          fullName: userResponse.data.firstName && userResponse.data.lastName 
            ? `${userResponse.data.firstName} ${userResponse.data.lastName}`.trim()
            : user.fullName || undefined,
        };
        setSessionUser(transformedUser);
        setUserType(userResponse.data.userType);
      }

      // Refresh clinic based on active organization
      if (organization) {
        const clinicResponse = await apiRequest<Clinic>(
          `/api/clinics/by-organization/${organization.id}`,
          {
            method: 'GET',
          },
          sessionToken
        );

        if (clinicResponse.success && clinicResponse.data) {
          setClinic(clinicResponse.data);
          setClinicId(clinicResponse.data.id);
        } else {
          setClinic(null);
          setClinicId(null);
        }

        const transformedOrganization: SessionOrganization = {
          id: organization.id,
          name: organization.name,
        };
        setSessionOrganization(transformedOrganization);
      } else {
        setClinic(null);
        setClinicId(null);
        setSessionOrganization(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const value: SessionContextType = {
    user: sessionUser,
    organization: sessionOrganization,
    clinic,
    clinicId,
    userType,
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
