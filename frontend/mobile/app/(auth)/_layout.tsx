import { Redirect, Stack, useSegments } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthLayout() {
  const { isSignedIn } = useAuth()
  const segments = useSegments()

  // Allow access to select-clinic even when signed in
  const isSelectingClinic = (segments as string[]).includes('select-clinic')

  if (isSignedIn && !isSelectingClinic) {
    return <Redirect href={'/'} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="landing" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="verify-contact" />
      <Stack.Screen name="select-clinic" />
    </Stack>
  )
}
