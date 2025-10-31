import { Redirect } from "expo-router";
import { useAuth } from '@clerk/clerk-expo';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    console.log('[Index] Clerk is loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#E75325" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  console.log('[Index] Clerk loaded. isSignedIn:', isSignedIn);

  // Redirect based on authentication status
  if (isSignedIn) {
    return <Redirect href="/(tabs)/pets" />;
  }
  
  return <Redirect href="/(auth)/landing" />;
}
