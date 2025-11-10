import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSignUp } from '@clerk/clerk-expo'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export default function VerifyContactScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  const params = useLocalSearchParams()
  const emailAddress = params.email as string
  const phoneNumber = params.phone as string

  const [code, setCode] = React.useState('')
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [showToast, setShowToast] = React.useState(false)
  const [verificationStep, setVerificationStep] = React.useState<'email' | 'phone'>('email')
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

  // Send phone verification code when moving to phone step
  const sendPhoneVerificationCode = async () => {
    if (!signUp) return
    
    try {
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' })
    } catch (err: any) {
      console.error('Error sending phone verification code:', err)
      showErrorToast(err?.errors?.[0]?.message || 'Failed to send verification code')
    }
  }

  // Handle email verification
  const onVerifyEmailPress = async (codeToVerify?: string) => {
    if (!isLoaded) return

    const codeValue = codeToVerify || code

    if (codeValue.length !== 6) {
      showErrorToast('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: codeValue,
      })

      // Check if email verification succeeded (either complete or email is verified)
      // The overall status might not be 'complete' yet if phone verification is still pending
      const emailVerified = signUpAttempt.verifications?.emailAddress?.status === 'verified' ||
                           signUpAttempt.status === 'complete'
      
      if (emailVerified) {
        // Email verified successfully, move to phone verification
        setCode('') // Clear the code for phone verification
        setVerificationStep('phone')
        await sendPhoneVerificationCode()
      } else {
        // Email verification failed
        showErrorToast('Email verification failed. Please check your code and try again.')
      }
    } catch (err: any) {
      // Handle specific verification errors
      if (err?.errors?.[0]?.code === 'verification_already_verified') {
        // If already verified, go to phone verification
        setCode('')
        setVerificationStep('phone')
        await sendPhoneVerificationCode()
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
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptPhoneNumberVerification({
        code: codeValue,
      })

      // Check if phone verification succeeded
      const phoneVerified = signUpAttempt.verifications?.phoneNumber?.status === 'verified' ||
                           signUpAttempt.status === 'complete'
      
      if (phoneVerified || signUpAttempt.status === 'complete') {
        // Phone verified successfully, complete signup
        await setActive({ session: signUpAttempt.createdSessionId })
        // Redirect to clinic selection instead of main app
        router.push('/select-clinic')
      } else {
        // Phone verification failed
        showErrorToast('Phone verification failed. Please check your code and try again.')
      }
    } catch (err: any) {
      // Handle specific verification errors
      if (err?.errors?.[0]?.code === 'verification_already_verified') {
        // If already verified, try to complete the signup
        try {
          await setActive({ session: signUp.createdSessionId })
          router.push('/select-clinic')
        } catch {
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
      if (verificationStep === 'email') {
        onVerifyEmailPress(digitsOnly)
      } else {
        onVerifyPhonePress(digitsOnly)
      }
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
                {verificationStep === 'email' ? 'Verify your email' : 'Verify your phone'}
              </Text>
              <Text style={styles.subtitle}>
                {verificationStep === 'email' 
                  ? `We've sent a verification code to ${emailAddress}`
                  : `We've sent a verification code to ${phoneNumber}`
                }
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
                onPress={() => verificationStep === 'email' ? onVerifyEmailPress() : onVerifyPhonePress()}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {verificationStep === 'email' ? 'Verify Email' : 'Verify Phone'}
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
    paddingTop: 210,
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

