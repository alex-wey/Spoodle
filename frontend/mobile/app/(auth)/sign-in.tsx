import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View, StyleSheet, KeyboardAvoidingView, Platform, Animated, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export default function Page() {
  const { signIn, isLoaded, setActive } = useSignIn()
  const router = useRouter()

  const [phoneNumber, setPhoneNumber] = React.useState('')
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [showToast, setShowToast] = React.useState(false)
  const toastOpacity = React.useRef(new Animated.Value(0)).current

  // Show toast notification
  const showErrorToast = (message: string) => {
    setError(message)
    setShowToast(true)
    
    // Fade in
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()

    // Auto dismiss after 2 seconds
    setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowToast(false)
        setError('')
      })
    }, 2000)
  }

  // Validate phone number format (US format: 10 digits)
  const isValidPhoneNumber = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '')
    return digitsOnly.length === 10
  }

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    // Validate phone number
    if (!phoneNumber.trim()) {
      showErrorToast('Please enter your phone number')
      return
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      showErrorToast('Please enter a valid 10-digit phone number')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Format phone number to E.164 format
      const digitsOnly = phoneNumber.replace(/\D/g, '')
      const formattedPhone = `+1${digitsOnly}`

      // Start sign-in process using phone number
      const signInAttempt = await signIn.create({
        identifier: formattedPhone,
      })

      // Check if sign-in is already complete (no verification needed)
      if (signInAttempt.status === 'complete') {
        try {
          await setActive({ session: signInAttempt.createdSessionId })
          router.replace('/')
          return
        } catch (setActiveError: any) {
          console.error('Failed to set session active:', setActiveError)
          showErrorToast('Failed to complete sign in. Please try again.')
          return
        }
      }

      // Check if phone verification is needed
      // Get the phone number ID from supported first factors
      const phoneFactor = signInAttempt.supportedFirstFactors?.find(
        (factor) => factor.strategy === 'phone_code'
      ) as { strategy: 'phone_code'; phoneNumberId: string } | undefined

      if (phoneFactor) {
        // Prepare phone verification
        await signIn.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId: phoneFactor.phoneNumberId,
        })
      } else {
        showErrorToast('Phone verification is not available. Please try again.')
        return
      }

      // Navigate to verify contact screen
      router.push({
        pathname: '/(auth)/verify-contact',
        params: { 
          phone: formattedPhone,
          flow: 'sign-in'
        }
      })
    } catch (err: any) {
      console.error(err)
      showErrorToast(err?.errors?.[0]?.message || 'Sign in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={['#4559A7', '#5B6FB8', '#3A4A8F']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>
              Welcome back! Sign in to your account
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                placeholder="Enter phone number"
                placeholderTextColor="#9CA3AF"
                onChangeText={(phone) => setPhoneNumber(phone)}
                keyboardType="phone-pad"
                autoComplete="tel"
                spellCheck={false}
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
              onPress={onSignInPress}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast Notification */}
      {showToast && (
        <Animated.View 
          style={[
            styles.toastContainer,
            { opacity: toastOpacity }
          ]}
        >
          <View style={styles.toast}>
            <Ionicons name="alert-circle" size={20} color="#FCA5A5" />
            <Text style={styles.toastText}>{error}</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 150,
    paddingBottom: 40,
    justifyContent: 'flex-start',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 24,
    zIndex: 100,
    padding: 8,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 0,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 20,
    color: '#1F2937',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#4559A7',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toastContainer: {
    position: 'absolute',
    top: 100,
    left: 24,
    right: 24,
    zIndex: 1000,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  linkText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
})