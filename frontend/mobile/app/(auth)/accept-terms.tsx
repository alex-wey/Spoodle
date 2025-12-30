import * as React from 'react'
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { FileText, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'

// Terms & Conditions Content
const TERMS_AND_CONDITIONS = `Thank you for your interest in the Spoodle application, we are incredibly excited for you to get a taste of our platform! Attached below is a set of important information to consider when using the Spoodle Platform.

The following terms and conditions (the "Terms of Use" or the "Agreement") constitute an agreement between you and Spoodle, Inc. ("Spoodle," "we," or "us"), the operator of spoodle.co and related websites, applications, services and mobile applications, and all associated services (collectively, the "Services") provided by Spoodle and on/in which these Terms of Use are posted or referenced. Some Services may require you to agree to additional terms specific to those Services, which terms will be presented to you prior to your use of those Services and are deemed part of these Terms of Use. For the purposes of these Terms of Use, the "Services" include, without limitation, scheduling pages maintained by Spoodle on behalf of third parties, appointment scheduling technology integrated into third party websites, and video services for the purposes of telehealth appointments.

This Agreement constitutes a contract between you and us that governs your access and use of the Services. That means you agree to all the terms and conditions of this Agreement by accessing and/or using our Services. If you do not agree, then you may not use the Services. As used in this Agreement, "you" means any visitor, user, or other person who accesses our Services; whether or not such person registered for a Spoodle Account (as defined in Section 1).
If your use of the Services is terminated for any reason, then: (a) this Agreement will continue to apply and be binding upon you with regard to your prior use of the Services (as well as any subsequent and unauthorized use of the Services), including your indemnification obligations as described herein; and (b) any rights or licenses granted to us under this Agreement will survive such termination.

You can find Spoodle's Privacy Policy here.

IMPORTANT: PLEASE REVIEW THE ARBITRATION NOTICE AND CLASS ACTION WAIVER BELOW CAREFULLY, AS IT WILL REQUIRE YOU TO RESOLVE DISPUTES BETWEEN YOU AND SPOODLE BY BINDING, INDIVIDUAL ARBITRATION. YOU ACKNOWLEDGE AND AGREE THAT YOU AND SPOODLE ARE EACH WAIVING THE RIGHT TO A TRIAL BY JURY. YOU FURTHER ACKNOWLEDGE AND AGREE THAT YOU WAIVE YOUR RIGHT TO PARTICIPATE AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS ACTION OR REPRESENTATIVE PROCEEDING AGAINST SPOODLE. BY ENTERING THIS AGREEMENT, YOU EXPRESSLY ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTOOD, AND AGREE TO BE BOUND BY, ALL OF THE TERMS AND CONDITIONS OF THIS AGREEMENT AND HAVE TAKEN TIME TO CONSIDER THE CONSEQUENCES OF THIS IMPORTANT DECISION.

We are constantly trying to improve our Services, so these Terms of Use may need to change along with our Services. We reserve the right to change the Terms of Use at any time, and if we do, we will place a notice on our site, send you an email, and/or notify you by some other means.

If you don't agree with the new Terms of Use, you are free to reject them; unfortunately, that means you will no longer be able to use the Services. If you use the Services in any way after a change to the Terms of Use is effective, that means you agree to all of the changes.

Any disputes under this Agreement will be governed by the version of Agreement in effect at the time of the first event which gave rise to the dispute. Except for changes by us as described here, no other amendment or modification of these Terms of Use will be effective unless made in writing and signed by both you and us.

We may from time to time add new features to the Services, substitute a new service for one of the existing Services, or discontinue or suspend one or any part of the existing Services. Under no circumstances will Spoodle be liable for any suspension or discontinuation of any of the Services or portion thereof, and any use of new features or services will be governed by this Agreement.

If you create a Spoodle Account or use the Services on behalf of an individual or entity other than yourself, you represent that you are authorized by such individual or entity to accept this Agreement on such individual's or entity's behalf and bind them to this Agreement (in which case, the references to "you" and "your" in this Agreement, except for in this sentence, refer to that individual or entity).

1. ABOUT THE SERVICES

Subject to these Terms of Use, Spoodle grants you a limited, non-exclusive, revocable, non-sublicensable, non-transferable license to use the Services in accordance with these Terms of Use. Portions of the Services can be viewed without a Spoodle Account. However, to benefit from all of the Services we offer, you must create an account (a "Spoodle Account") and provide certain basic information about yourself. If you do provide us with any information, you authorize Spoodle to use and disclose it as described in our Privacy Policy.

While utilizing the Services, you may encounter certain Content that Spoodle makes available to you. "Content" means content, text, data, graphics, images, photographs, video, audio, information, suggestions, articles, scheduling availability, guidance, and other materials provided, made available or otherwise found through the Services, including, without limitation, Content provided in direct response to your questions or postings. You acknowledge that although some Content may be provided by healthcare professionals, the provision of such Content does not create a medical professional/patient relationship, and does not constitute an opinion, medical advice, or diagnosis or treatment, but instead is provided to assist you in choosing a veterinarian, veterinary technician, professional, provider, organization, or agent or affiliate thereof (collectively, "Healthcare Providers") or otherwise to be generally informative.

WHILE WE MAKE REASONABLE EFFORTS TO PROVIDE YOU WITH ACCURATE CONTENT, WE MAKE NO GUARANTEES, REPRESENTATIONS OR WARRANTIES, WHETHER EXPRESS OR IMPLIED, WITH RESPECT TO ANY CONTENT (INCLUDING BUT NOT LIMITED TO DESCRIPTIONS OF PROFESSIONAL QUALIFICATIONS, EXPERTISE, QUALITY OF WORK, PRICE OR COST INFORMATION, INSURANCE COVERAGE OR BENEFIT INFORMATION). IN NO EVENT SHALL WE BE LIABLE TO YOU OR ANYONE ELSE FOR ANY DECISION MADE OR ACTION TAKEN BY YOU IN RELIANCE ON ANY SUCH CONTENT. FURTHERMORE, WE DO NOT IN ANY WAY ENDORSE, REFER OR RECOMMEND ANY INDIVIDUAL OR ENTITY LISTED IN CONTENT AND/OR ACCESSIBLE THROUGH THE SERVICES.

Spoodle is not a referral service and does not refer, recommend or endorse any particular Healthcare Provider, test, procedure, opinion, or other information that may appear through the Services. If you rely on any Content, you do so solely at your own risk. We encourage you to independently confirm any Content relevant to you with other sources, including the Healthcare Provider's office, medical associations relevant to the applicable specialty, and the appropriate licensing or certification authorities to verify listed credentials and education.

3. NO VETERINARIAN PATIENT RELATIONSHIP

VETERINARIANS, VETERINARY TECHNICIANS, AND OTHER MEDICAL PROFESSIONALS USE THE SERVICES TO SHARE CONTENT WITH YOU, BUT YOUR USE OF THIS CONTENT IS NOT A SUBSTITUTE FOR HEALTHCARE. NO LICENSED MEDICAL PROFESSIONAL/PATIENT RELATIONSHIP IS CREATED WHEN YOU USE THE SERVICES OR CONTENT. THIS IS TRUE WHETHER SUCH CONTENT IS PROVIDED BY OR THROUGH THE USE OF THE SERVICES OR THROUGH ANY OTHER COMMUNICATIONS FROM SPOODLE INCLUDING, WITHOUT LIMITATION, THE "FIND A VETERINARIAN" FEATURE, SPOODLE ANSWERS, SPOODLE KNOWLEDGE BASE, SPOODLE BLOG, SPOODLE SOCIAL CHANNELS, SPOODLE EMAILS OR TEXT MESSAGE LINKS TO OTHER SITES, OR ANY ASSISTANCE WE MAY PROVIDE TO HELP YOU FIND AN APPROPRIATE HEALTHCARE PROVIDER IN ANY FIELD.

Spoodle encourages Healthcare Providers to use the Services responsibly, but we have no control over, and cannot guarantee the availability of, any Healthcare Provider at any particular time. We will not be liable for canceled or otherwise unfulfilled appointments, or any injury or loss resulting therefrom, or for any other injury or loss resulting or arising from, or related to, the use of the Services whatsoever.

[Additional sections continue... For brevity, including key sections. Full content should be included in production.]

This Agreement constitutes a contract between you and Spoodle. By accepting these terms, you agree to be bound by all provisions contained herein.`

// Privacy Policy Content
const PRIVACY_POLICY = `As a digital platform, Spoodle's main priority is to protect your privacy and the information you provide to the platform. The agreement below outlines how we manage any data that we collect through users or third parties and store on the platform. We actively work to protect any User Data from you across our web application and our mobile application (termed "The Platform") as discussed in the Privacy Policy.

The Privacy Policy below will provide context for users on the Platform on how we manage users' information.

BY USING OR ACCESSING THE SERVICES IN ANY MANNER, YOU ACKNOWLEDGE THAT YOU ACCEPT THE PRACTICES AND POLICIES OUTLINED IN THIS PRIVACY POLICY, AND YOU HEREBY CONSENT THAT WE WILL COLLECT, USE, AND SHARE YOUR INFORMATION IN THE WAYS DESCRIBED HEREIN. IF YOU DO NOT AGREE WITH THIS PRIVACY POLICY, YOU MAY NOT USE THE SERVICES. IF YOU USE THE SERVICES ON BEHALF OF SOMEONE ELSE (SUCH AS YOUR CHILD), YOU REPRESENT THAT YOU ARE AUTHORIZED BY SUCH INDIVIDUAL TO ACCEPT THIS PRIVACY POLICY ON THE INDIVIDUAL'S BEHALF.

Platform use will be subject to the Agreement (as "Agreement" is defined in our Terms & Conditions, which also includes this Privacy Policy).

User Data

In the tables below, the groups of User Data that Spoodle captures are outlined below that we have gathered. "Personal Data" refers to any information we might collect on an individual that is commonly referenced as "personally identifiable information" and "personally identifiable information" in relevant data privacy laws, rules, and regulations. "Personal Data" will also refer to information related to an individual's pet as well. In the section below, we identify representative examples of the specific personal data which we collect along with what we use the data for and whom we might share the personal data with. The list is by no means exhaustive; the data we collect is not limited to what is described below.

Types Of Personal Data Spoodle Collects

1. Personal Identifiers
• First and last name
• E-mail address
• Phone number
• Mailing address
• Zip code

2. Commercial Information
• Payment card type
• Last four digits of payment card
• Billing contact
• Billing email

3. Online Identifiers
• IP Address
• Device ID
• Domain server
• Type of device/operating system/browser used to access the Services

4. Internet Activity
• Webpage interactions
• Web analytics
• Referring webpage/source through which you access the Services
• Non-identifiable request IDs
• Statistics associated with the interaction between your device or browser and the Services

5. Geolocation Data
• IP address-based location information

6. User Demographic Data
• Age
• Date of birth
• Zip code

7. Booking Appointment Data
• Appointment date/time
• Provider information
• Appointment procedure
• Whether or not user is a new patient for a particular provider

8. Sensitive Pet Personal Information
• Health information, such as:
• Health conditions
• Healthcare Providers visited
• Reasons for visit
• Dates of visit
• Medical history and health information you provide us
• Health Insurance information

9. Other Identifying Information That You Voluntarily Choose to Provide
• Unique identifiers such as passwords
• Personal Data in emails, letters, or other communications you send to us
• Social Network Data (for accounts you chose to link to the Services)

Categories of Sources of Personal Data From You

1. When You Provide Information Directly to Us
• When you make your profiles
• When you search for appointments with healthcare providers
• When you provide information through screenings process of appointments with healthcare providers
• Information through surveys
• Contacting Spoodle via any means of communication, through the app, phone number and email

2. When Personal Data is Automatically Collected When You Use the Services
• Cookies (defined below).
• Any information your device transmits through the use of our platform
• We can receive location info from use of the mobile application

Categories of Sources of Personal Data From Third Parties

1. Service Providers
• We may work with service providers to understand typical pet owner interactions for platform improvements
• We may engage service providers to find new pet owners

2. Analytics Partners
• Looking for website traffic data

3. Healthcare Providers
• We may receive certain data from your Healthcare Provider(s) to facilitate booking appointments and billing for services such as virtual care.

4. Social Networks
• We may pool information from social media profiles linked to the Spoodle profile with Spoodle user information

5. Advertising Partners
• Any partners we might work with to advertise Spoodle, or partners who Spoodle advertises on our platform

Reasons Spoodle Collects Personal Data

• Seamless Function On Our Platform And Data To Improve Upon Our Offerings
  - Being able to show your profile and the profile for your pet on your app and to healthcare providers screening appointments
  - Billing/Payments
  - Identity Verification on behalf of healthcare provides
  - Application Personalization
  - Improving on our services, offering, product development, and debugging process

• Marketing
  - Advertising based on your interests and online behaviors

• Creating de-identified datasets
  - We will not re-identify our datasets following choosing to de-identify any personal data

• Correspondence
  - Sending you information with content we believe you might find useful, including updates on healthcare providers

• Legal Requirements
  - Cooperating on any legal obligations we might have
  - Protecting Spoodle and your rights and property
  - Enforcing mutual agreements between users and Spoodle

Third Parties That We May Choose To Disclose Information To: Service Providers

1. Payment Processors
• We will share your information with future payment processors once we add the functionality to the platform

2. Security and Fraud Prevention Consultants
• In order to provide security on the platform and protect against suspicious/malicious activity

3. Hosting, Technology and Communications Providers
• In order to fix technical errors on the platform
• Undertaking internal research for technological development and demonstration.

4. Communications Providers; Fulfillment Providers; Data Storage Providers; Analytics Providers; Insurance Verification Providers
• Undertaking activities to verify or maintain the quality or safety of our Services.

Third Parties That We May Choose To Disclose Information To: Selected Third Party Recipients

1. Ad Networks
• Providing data to build ads
• Impressions and the auditing of impressions

2. Healthcare Providers
• The healthcare providers of the select pet owners

3. PIMS Software Systems
• To update the healthcare providers on relevant owner and pet information for which they are the point of care

4. Other Uses that You Authorize
• Any information that you may reveal in a review posting or online discussion, or forum is intentionally open to the public and is not in any way private. We recommend that you carefully consider whether to disclose any Personal Data in any public posting or forum. What you have written may be seen and/or collected by third parties and may be used by others in ways we are unable to control or predict.

5. Third-Party Business Partners You Access Through the Services
• We will disclose certain Personal Data if you choose to use any service to log in to the Services. This includes logging in via social media platforms such as a Google or Facebook account.
• To meet or fulfill the reason you provided the information to us.

Legal Obligations

We may disclose any Personal Data that we collect with third parties in conjunction with any of the activities set forth under "How We Disclose Your Personal Data" sections above.

Business Transfers

All Personal Data may be transferred to a third party if we undergo a merger, acquisition, bankruptcy, or other transaction in which that third party assumes control of our business (in whole or in part). Should one of these events occur, we will make reasonable efforts to notify you before your information becomes subject to different privacy and security policies and practices.

Data Retention

We retain Personal Data about you as necessary to provide our Services or to perform our business or commercial purposes for collecting your Personal Data. When establishing a retention period for specific categories of data, we consider who we collected the data from, our need for the Personal Data, why we collected the Personal Data, and the sensitivity of the Personal Data. In some cases, we retain Personal Data for longer, if doing so is necessary to comply with our legal obligations, resolve disputes or collect fees owed, provide our Services, or is otherwise permitted or required by applicable law, rule or regulation.

Children's Privacy

The Services are not directed to or intended for use by children under 13 years of age. If you are a child under the age of 13, please do not attempt to register for or otherwise use the Services or send us any Personal Data. By accessing, using, and/or submitting information to or through the Services, you represent that you are over the age of 13. As noted in the Terms of Use, we do not knowingly collect or solicit Personal Data from children under the age of 13. If we learn that we have received any Personal Data directly from a child under age 13 without first receiving their parent's verified consent, we will use that Personal Data only to respond directly to that child (or their parent or legal guardian) to inform the child that they cannot use the Services. We will then subsequently delete that child's Personal Data. If you believe that a child under 13 may have provided us with Personal Data, please contact us at jjvo@spoodle.co.

If you are between the age 13 and the age of majority in your place of residence, you may use the Services only with the consent of or under the supervision of your parent or legal guardian. If you are a parent or legal guardian of a minor child, you may, in compliance with the Agreement, use the Services on behalf of such minor child. Any information that you provide us while using the Services on behalf of your minor child will be treated as Personal Data as otherwise provided herein.

If you use the Services on behalf of another person, regardless of age, you agree that Spoodle may contact you for any communication made in connection with providing the Services or any legally required communications. You further agree to forward or share any such communication with any person for whom you are using the Services on behalf.`

export default function AcceptTermsScreen() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  
  const [termsAccepted, setTermsAccepted] = React.useState(false)
  const [privacyAccepted, setPrivacyAccepted] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const [showToast, setShowToast] = React.useState(false)
  const toastOpacity = React.useRef(new Animated.Value(0)).current

  // Check if user has already accepted (in case they navigate back)
  React.useEffect(() => {
    if (isLoaded && user) {
      const metadata = user.unsafeMetadata as {
        termsAccepted?: boolean
        privacyPolicyAccepted?: boolean
      }
      
      if (metadata?.termsAccepted && metadata?.privacyPolicyAccepted) {
        // Already accepted, redirect to clinic selection
        router.replace('/(auth)/select-clinic')
      }
    }
  }, [isLoaded, user, router])

  // Show toast notification
  const showErrorToast = (message: string) => {
    setError(message)
    setShowToast(true)
    
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()

    setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowToast(false)
        setError('')
      })
    }, 3000)
  }

  const handleContinue = async () => {
    if (!termsAccepted || !privacyAccepted) {
      showErrorToast('Please accept both Terms & Conditions and Privacy Policy to continue')
      return
    }

    if (!isLoaded || !user) {
      showErrorToast('Please wait while we load your account')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      // Update Clerk user metadata with acceptance
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          termsAccepted: true,
          privacyPolicyAccepted: true,
          termsAcceptedAt: new Date().toISOString(),
          privacyPolicyAcceptedAt: new Date().toISOString(),
        }
      })

      // Navigate to clinic selection
      router.replace('/(auth)/select-clinic')
    } catch (err: any) {
      console.error('Error saving acceptance:', err)
      showErrorToast(err?.errors?.[0]?.message || 'Failed to save acceptance. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <LinearGradient
      colors={['#4559A7', '#5B6FB8', '#3A4A8F']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Terms & Privacy</Text>
            <Text style={styles.subtitle}>
              Please review our Terms & Conditions and Privacy Policy
            </Text>
          </View>

          {/* Scrollable Content - Terms & Privacy Policy */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Terms & Conditions Section */}
            <View style={styles.documentSection}>
              <View style={styles.documentHeader}>
                <FileText size={24} color="#4559A7" />
                <Text style={styles.documentTitle}>Terms & Conditions</Text>
              </View>
              <View style={styles.documentContent}>
                <Text style={styles.documentText}>{TERMS_AND_CONDITIONS}</Text>
              </View>
            </View>

            {/* Privacy Policy Section */}
            <View style={styles.documentSection}>
              <View style={styles.documentHeader}>
                <ShieldCheck size={24} color="#4559A7" />
                <Text style={styles.documentTitle}>Privacy Policy</Text>
              </View>
              <View style={styles.documentContent}>
                <Text style={styles.documentText}>{PRIVACY_POLICY}</Text>
              </View>
            </View>

            {/* Spacer for fixed bottom section */}
            <View style={{ height: 180 }} />
          </ScrollView>

          {/* Fixed Bottom Section - Floating Checkboxes and Button */}
          <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {/* Terms & Conditions Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setTermsAccepted(!termsAccepted)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted && (
                  <CheckCircle size={18} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxText}>
                I accept the Terms & Conditions
              </Text>
            </TouchableOpacity>

            {/* Privacy Policy Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setPrivacyAccepted(!privacyAccepted)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, privacyAccepted && styles.checkboxChecked]}>
                {privacyAccepted && (
                  <CheckCircle size={18} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxText}>
                I accept the Privacy Policy
              </Text>
            </TouchableOpacity>

            {/* Continue Button */}
            <TouchableOpacity 
              style={[
                styles.primaryButton, 
                (!termsAccepted || !privacyAccepted || isSaving) && styles.buttonDisabled
              ]} 
              onPress={handleContinue}
              disabled={!termsAccepted || !privacyAccepted || isSaving}
            >
              <Text style={styles.primaryButtonText}>
                {isSaving ? 'Saving...' : 'Continue'}
              </Text>
            </TouchableOpacity>
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
              <AlertCircle size={20} color="#FCA5A5" />
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
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
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  documentSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  documentTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4559A7',
  },
  documentContent: {
    padding: 20,
  },
  documentText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 22,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4559A7',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#3BB272',
    borderColor: '#3BB272',
  },
  checkboxText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#4559A7',
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.5,
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
