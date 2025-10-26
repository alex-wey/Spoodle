import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Animated } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export default function SignUpScreen() {
  const { isLoaded, signUp } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
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

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate phone number format (US format: 10 digits)
  const isValidPhoneNumber = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '')
    return digitsOnly.length === 10
  }

  // Validate all fields
  const validateFields = () => {
    const missingFields = []
    
    if (!firstName.trim()) missingFields.push('first name')
    if (!lastName.trim()) missingFields.push('last name')
    if (!emailAddress.trim()) missingFields.push('email')
    if (!phoneNumber.trim()) missingFields.push('phone number')
    if (!password.trim()) missingFields.push('password')

    if (missingFields.length > 0) {
      showErrorToast(`Please fill out: ${missingFields.join(', ')}`)
      return false
    }

    // Validate email format
    if (!isValidEmail(emailAddress)) {
      showErrorToast('Please enter a valid email address')
      return false
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phoneNumber)) {
      showErrorToast('Please enter a valid 10-digit phone number')
      return false
    }

    return true
  }

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Validate fields before submitting
    if (!validateFields()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Format phone number to E.164 format
      const digitsOnly = phoneNumber.replace(/\D/g, '')
      const formattedPhone = `+1${digitsOnly}`

      // Start sign-up process using email and password
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
        phoneNumber: formattedPhone,
      });

        // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Navigate to verify contact screen
      router.push({
        pathname: '/(auth)/verify-contact',
        params: { 
          email: emailAddress,
          phone: formattedPhone
        }
      })
    } catch (err: any) {
      console.error(err)
      showErrorToast(err?.errors?.[0]?.message || 'Sign up failed. Please try again.')
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
      >
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>
              Create your account to get started
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, styles.nameField]}>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  placeholder="First name"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={(name) => setFirstName(name)}
                  autoComplete="given-name"
                  autoCapitalize="words"
                />
              </View>
              <View style={[styles.inputContainer, styles.nameField]}>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  placeholder="Last name"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={(name) => setLastName(name)}
                  autoComplete="family-name"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Enter email"
                placeholderTextColor="#9CA3AF"
                onChangeText={(email) => setEmailAddress(email)}
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                placeholder="Enter phone number"
                placeholderTextColor="#9CA3AF"
                onChangeText={(phone) => setPhoneNumber(phone)}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={password}
                placeholder="Enter password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
                autoComplete="password"
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
              onPress={onSignUpPress}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Creating Account...' : 'Continue'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
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
    paddingTop: 80,
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
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
    marginTop: 40,
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
