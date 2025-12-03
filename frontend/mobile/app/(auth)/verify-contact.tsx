import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSignUp, useSignIn } from '@clerk/clerk-expo'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export default function VerifyContactScreen() {
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp()
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn()
  const router = useRouter()
  const params = useLocalSearchParams()
  const phoneNumber = params.phone as string
  const flow = (params.flow as 'sign-in' | 'sign-up') || 'sign-up'

  const isLoaded = flow === 'sign-in' ? isSignInLoaded : isSignUpLoaded

  const [code, setCode] = React.useState('')
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

  // Send phone verification code on mount (if not already sent)
  React.useEffect(() => {
    const sendPhoneVerificationCode = async () => {
      if (!isLoaded) return
      
      try {
        if (flow === 'sign-in' && signIn) {
          // Get the phone number ID from supported first factors
          const phoneFactor = signIn.supportedFirstFactors?.find(
            (factor) => factor.strategy === 'phone_code'
          ) as { strategy: 'phone_code'; phoneNumberId: string } | undefined

          if (phoneFactor) {
            await signIn.prepareFirstFactor({
              strategy: 'phone_code',
              phoneNumberId: phoneFactor.phoneNumberId,
            })
          }
        } else if (flow === 'sign-up' && signUp) {
          await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' })
        }
      } catch (err: any) {
        console.error('Error sending phone verification code:', err)
        // Don't show error toast on mount, as code might already be sent
      }
    }

    sendPhoneVerificationCode()
  }, [signUp, signIn, isLoaded, flow])

  // Handle phone verification
  const onVerifyPhonePress = async (codeToVerify?: string) => {
    if (!isLoaded) return

    const codeValue = codeToVerify || code

    if (codeValue.length !== 6) {
      showErrorToast('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (flow === 'sign-in' && signIn) {
        // Handle sign-in verification
        // Get the phone number ID from supported first factors
        const phoneFactor = signIn.supportedFirstFactors?.find(
          (factor) => factor.strategy === 'phone_code'
        ) as { strategy: 'phone_code'; phoneNumberId: string } | undefined

        if (!phoneFactor) {
          showErrorToast('Phone verification is not available. Please try again.')
          return
        }

        const signInAttempt = await signIn.attemptFirstFactor({
          strategy: 'phone_code',
          code: codeValue,
        })

        if (signInAttempt.status === 'complete') {
          try {
            await setSignInActive({ session: signInAttempt.createdSessionId })
            router.replace('/')
          } catch (setActiveError: any) {
            console.error('Failed to set session active:', setActiveError)
            showErrorToast('Failed to complete sign in. Please try again.')
          }
        } else {
          showErrorToast('Phone verification failed. Please check your code and try again.')
        }
      } else if (flow === 'sign-up' && signUp) {
        // Handle sign-up verification
        const signUpAttempt = await signUp.attemptPhoneNumberVerification({
          code: codeValue,
        })

        const phoneVerified = signUpAttempt.verifications?.phoneNumber?.status === 'verified' ||
                             signUpAttempt.status === 'complete'
        
        if (phoneVerified || signUpAttempt.status === 'complete') {
          try {
            await setSignUpActive({ session: signUpAttempt.createdSessionId })
            router.push('/(auth)/select-clinic')
          } catch (setActiveError: any) {
            console.error('Failed to set session active:', setActiveError)
            showErrorToast('Failed to complete signup. Please try again.')
          }
        } else {
          showErrorToast('Phone verification failed. Please check your code and try again.')
        }
      }
    } catch (err: any) {
      // Handle specific verification errors
      if (err?.errors?.[0]?.code === 'verification_already_verified') {
        // If already verified, try to complete the flow
        try {
          if (flow === 'sign-in' && signIn?.createdSessionId) {
            await setSignInActive({ session: signIn.createdSessionId })
            router.replace('/')
          } else if (flow === 'sign-up' && signUp?.createdSessionId) {
            await setSignUpActive({ session: signUp.createdSessionId })
            router.push('/(auth)/select-clinic')
          }
        } catch (setActiveError: any) {
          console.error('Failed to set session active:', setActiveError)
          showErrorToast('Your phone number is already verified.')
        }
      } else if (err?.errors?.[0]?.code === 'form_code_incorrect') {
        showErrorToast('Invalid verification code. Please check and try again.')
      } else if (err?.errors?.[0]?.code === 'form_code_expired') {
        showErrorToast('Verification code has expired. Please request a new one.')
      } else {
        showErrorToast(err?.errors?.[0]?.message || 'Verification failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle code input change with auto-verification
  const handleCodeChange = (newCode: string) => {
    // Only allow digits
    const digitsOnly = newCode.replace(/\D/g, '')
    setCode(digitsOnly)
    
    // Auto-verify when 6 digits are entered
    if (digitsOnly.length === 6 && !isLoading && isLoaded) {
      // Use the digitsOnly value directly to avoid state update timing issues
      onVerifyPhonePress(digitsOnly)
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
        >
          <View style={styles.content}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.header}>
              <Text style={styles.title}>
                Verify your phone
              </Text>
              <Text style={styles.subtitle}>
                We&apos;ve sent a verification code to {phoneNumber}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={code}
                  placeholder="Enter verification code"
                  placeholderTextColor="#6B7280"
                  onChangeText={handleCodeChange}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  maxLength={6}
                  autoFocus={true}
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
                onPress={() => onVerifyPhonePress()}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  Verify Phone
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 160,
    paddingBottom: 24,
    justifyContent: 'flex-start',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  header: {
    marginBottom: 40,
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
    textAlign: 'center',
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#4559A7',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
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
})

