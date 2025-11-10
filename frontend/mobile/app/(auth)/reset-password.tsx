import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View, StyleSheet, KeyboardAvoidingView, Platform, Animated, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSignIn } from '@clerk/clerk-expo'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export default function ResetPasswordScreen() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()
  const params = useLocalSearchParams()
  const emailAddress = params.email as string

  const [code, setCode] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [showToast, setShowToast] = React.useState(false)
  const [resetStep, setResetStep] = React.useState<'code' | 'password'>('code')
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

  // Resend reset code
  const onResendCodePress = async () => {
    if (!isLoaded || !signIn) return

    setIsLoading(true)
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      })
      showErrorToast('New code sent! Check your email.')
    } catch (err: any) {
      showErrorToast(err?.errors?.[0]?.message || 'Failed to resend code')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle code verification
  const onVerifyCodePress = async (codeToVerify?: string) => {
    if (!isLoaded || !signIn) return

    const codeValue = codeToVerify || code

    if (!codeValue.trim()) {
      showErrorToast('Please enter the verification code')
      return
    }

    if (codeValue.length !== 6) {
      showErrorToast('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Attempt to verify the reset code
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: codeValue,
      })

      // Check if we can proceed to password reset
      if (result.status === 'needs_new_password') {
        setResetStep('password')
        setCode('') // Clear code for security
        setIsLoading(false) // Ensure loading is false for password inputs
      } else {
        showErrorToast('Verification failed. Please try again.')
      }
    } catch (err: any) {
      console.error('Code verification error:', err)
      
      if (err?.errors?.[0]?.code === 'form_code_incorrect') {
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
    if (digitsOnly.length === 6 && !isLoading && isLoaded && signIn) {
      // Use the digitsOnly value directly to avoid state update timing issues
      onVerifyCodePress(digitsOnly)
    }
  }

  // Handle password reset
  const onResetPasswordPress = async () => {
    if (!isLoaded || !signIn) return

    // Validate passwords
    if (!newPassword.trim()) {
      showErrorToast('Please enter a new password')
      return
    }

    if (!confirmPassword.trim()) {
      showErrorToast('Please confirm your password')
      return
    }

    if (newPassword !== confirmPassword) {
      showErrorToast('Passwords do not match')
      return
    }

    // Basic password strength check (Clerk will also validate)
    if (newPassword.length < 8) {
      showErrorToast('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Set the new password
      const result = await signIn.resetPassword({
        password: newPassword,
      })

      // Check if sign-in is complete
      if (result.status === 'complete') {
        // Set the active session
        await setActive({ session: result.createdSessionId })
        
        // Clear sensitive data
        setNewPassword('')
        setConfirmPassword('')
        
        // Navigate to home screen
        router.replace('/')
      } else {
        showErrorToast('Password reset incomplete. Please try again.')
      }
    } catch (err: any) {
      console.error('Password reset error:', err)
      
      // Clear sensitive data on error
      setNewPassword('')
      setConfirmPassword('')
      
      if (err?.errors?.[0]?.code === 'form_password_pwned') {
        showErrorToast('This password does not meet the requirements. Please choose a different one.')
      } else if (err?.errors?.[0]?.code === 'form_param_format_invalid') {
        showErrorToast('Password does not meet requirements. Please try a stronger password.')
      } else {
        showErrorToast(err?.errors?.[0]?.message || 'Failed to reset password. Please try again.')
      }
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.header}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                {resetStep === 'code' 
                  ? `Enter the verification code sent to ${emailAddress}`
                  : 'Create your new password'}
              </Text>
            </View>

            <View style={styles.form}>
              {resetStep === 'code' ? (
                <>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, styles.codeInput]}
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
                    onPress={() => onVerifyCodePress()}
                    disabled={isLoading}
                  >
                    <Text style={styles.primaryButtonText}>
                      Verify Code
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.resendButton}
                    onPress={onResendCodePress}
                    disabled={isLoading}
                  >
                    <Text style={styles.resendText}>
                      Didn&apos;t receive the code? Resend
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <TextInput
                      key="new-password"
                      style={styles.input}
                      value={newPassword}
                      placeholder="Enter password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={true}
                      onChangeText={(password) => setNewPassword(password)}
                      autoCapitalize="none"
                      autoComplete="password-new"
                      autoFocus={true}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <TextInput
                      key="confirm-password"
                      style={styles.input}
                      value={confirmPassword}
                      placeholder="Confirm password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={true}
                      onChangeText={(password) => setConfirmPassword(password)}
                      autoCapitalize="none"
                      autoComplete="password-new"
                    />
                  </View>

                  <View style={styles.passwordRequirements}>
                    <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                    <Text style={styles.requirementText}>• At least 8 characters</Text>
                    <Text style={styles.requirementText}>• Must not be a commonly used password</Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
                    onPress={onResetPasswordPress}
                    disabled={isLoading}
                  >
                    <Text style={styles.primaryButtonText}>
                      Reset Password
                    </Text>
                  </TouchableOpacity>
                </>
              )}
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
            pointerEvents="none"
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
    paddingTop: 170,
    paddingBottom: 40,
    justifyContent: 'flex-start',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
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
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.3,
    paddingHorizontal: 16,
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
  codeInput: {
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
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
  resendButton: {
    alignSelf: 'center',
    marginTop: -8,
  },
  resendText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  passwordRequirements: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: -8,
  },
  requirementsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 4,
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

