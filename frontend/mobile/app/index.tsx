import { Redirect } from "expo-router";
import { useAuth } from '@clerk/clerk-expo';
import { View, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { clerkApiClient } from './lib/api';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const [checkingSetup, setCheckingSetup] = useState(false);
  const [hasClinic, setHasClinic] = useState<boolean | null>(null);

  // Check if user has completed clinic selection
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      checkClinicSetup();
    }
  }, [isSignedIn, isLoaded]);

  const checkClinicSetup = async () => {
    try {
      setCheckingSetup(true);
      console.log('[Index] Checking clinic setup...');
      const response = await clerkApiClient.getMyClinic();
      
      console.log('[Index] Clinic response:', response);
      if (response.success && response.data) {
        console.log('[Index] User has clinic:', response.data.name);
        setHasClinic(true);
      } else {
        console.log('[Index] No clinic data in response');
        setHasClinic(false);
      }
    } catch (error: any) {
      console.log('[Index] Clinic check error:', error.message || error);
      // If 404 or error, user needs to select clinic
      setHasClinic(false);
    } finally {
      setCheckingSetup(false);
      console.log('[Index] Clinic check complete');
    }
  };

  // Show loading while Clerk is initializing OR checking clinic setup
  if (!isLoaded || (isSignedIn && hasClinic === null)) {
    console.log('[Index] Loading... isLoaded:', isLoaded, 'isSignedIn:', isSignedIn, 'hasClinic:', hasClinic);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#4559A7" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  console.log('[Index] Clerk loaded. isSignedIn:', isSignedIn, 'hasClinic:', hasClinic);

  // Redirect based on authentication status and setup completion
  if (isSignedIn) {
    // Check if user has completed clinic selection
    if (hasClinic === false) {
      return <Redirect href={'/select-clinic'} />;
    }
    // hasClinic === true, user has clinic
    return <Redirect href="/(tabs)/pets" />;
  }
  
  return <Redirect href="/(auth)/landing" />;
}
