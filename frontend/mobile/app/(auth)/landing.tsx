import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { X, FileText, ShieldCheck } from 'lucide-react-native';
import * as React from 'react';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Terms & Conditions Content
const TERMS_AND_CONDITIONS = `Thank you for your interest in the Spoodle application, we are incredibly excited for you to get a taste of our platform! Attached below is a set of important information to consider when using the Spoodle Platform.

The following terms and conditions (the "Terms of Use" or the "Agreement") constitute an agreement between you and Spoodle, Inc. ("Spoodle," "we," or "us"), the operator of spoodle.co and related websites, applications, services and mobile applications, and all associated services (collectively, the "Services") provided by Spoodle and on/in which these Terms of Use are posted or referenced. Some Services may require you to agree to additional terms specific to those Services, which terms will be presented to you prior to your use of those Services and are deemed part of these Terms of Use. For the purposes of these Terms of Use, the "Services" include, without limitation, scheduling pages maintained by Spoodle on behalf of third parties, appointment scheduling technology integrated into third party websites, and video services for the purposes of telehealth appointments.

This Agreement constitutes a contract between you and us that governs your access and use of the Services. That means you agree to all the terms and conditions of this Agreement by accessing and/or using our Services. If you do not agree, then you may not use the Services. As used in this Agreement, "you" means any visitor, user, or other person who accesses our Services; whether or not such person registered for a Spoodle Account (as defined in Section 1).
If your use of the Services is terminated for any reason, then: (a) this Agreement will continue to apply and be binding upon you with regard to your prior use of the Services (as well as any subsequent and unauthorized use of the Services), including your indemnification obligations as described herein; and (b) any rights or licenses granted to us under this Agreement will survive such termination.

You can find Spoodle's Privacy Policy here

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

4. AUTHORIZATION AND ACKNOWLEDGEMENT; IMPORTANT INFORMATION ABOUT HEALTHCARE PROVIDER RELATIONSHIPS AND HEALTHCARE PROVIDER LISTS

In connection with using the Services to schedule appointments with Healthcare Providers, you understand that:

YOU ARE RESPONSIBLE FOR CHOOSING YOUR OWN HEALTHCARE PROVIDER, INCLUDING WITHOUT LIMITATION, DETERMINING WHETHER THE APPLICABLE HEALTHCARE PROVIDER IS SUITABLE FOR YOUR HEALTHCARE NEEDS BASED ON SPECIALTY, EXPERIENCE, QUALIFICATION, LICENSES AND OTHER IMPORTANT FACTS AND CIRCUMSTANCES THAT COULD IMPACT YOUR CARE.

Spoodle or its designee takes certain limited steps to (a) verify that Healthcare Providers participating in the Services hold certain active licenses, certifications or registrations required by law to practice the specialties of the services offered by them through the Services. Spoodle may also exclude Healthcare Providers from our Services who, in Spoodle's discretion or have engaged in inappropriate or unprofessional conduct.

While all qualified providers are eligible to use our Services, Spoodle's lists of Healthcare Providers are not exhaustive. Healthcare Providers choose whether to participate in the Services, what appointment availability, if any, to advertise on their Spoodle profiles, and may also choose to set a maximum amount that they want to spend on new patient bookings received through Spoodle. This means that regardless of whether they participate in the Services, Healthcare Providers may have additional availability beyond what's listed through the Services if you contact them directly. Healthcare Providers listed through the Services may enter into contracts with us, and may pay us fees in order to be marketed through or to use the Services. If you book an appointment with a Healthcare Provider through the Services, Spoodle may receive a commission.

To help you find Healthcare Providers who may be suitable for your needs, and enable the maximum choice and diversity of Healthcare Providers participating in the Services, we will provide you with lists and/or profiles of Healthcare Providers. Any search results are based on information that you provide to us, such as insurance information, geographical location, and healthcare specialty and/or services they provide. They may also be partially based on other criteria (including, for example, Healthcare Provider availability, past selections by and/or ratings of Healthcare Providers by you or by other Spoodle users, and past experiences of Spoodle users with Healthcare Providers). Please note that there may be other Healthcare Providers who meet your search criteria but are not available through Spoodle.

Spoodle (a) does not employ, refer, recommend, or endorse any Healthcare Providers, (b) does not make any representations or warranties with respect to these Healthcare Providers or the quality of the services they may provide, (c) is not responsible for ensuring that information (including credentials) a Healthcare Provider provides about himself or herself is accurate or up-to-date, (d) is not responsible for making sure that Healthcare Providers' services are actually provided or are up to a certain standard of quality, and (e) does not receive any additional fees from Healthcare Providers for featuring them (i.e., higher or better placement on lists) through the Services (subject to Sponsored Results as described below). We don't control the actions of any Healthcare Providers and Healthcare Providers are not our employees. Note, however, to the extent that you use the Services as provided by your employer, Spoodle may provide lists and/or profile previews based also on criteria determined by your employer and your employer's agents or advisors. In addition, to the extent that Spoodle serves as a platform for, or provides technical support to, the provider directory associated with your health coverage, Healthcare Providers will appear in the directory based on criteria determined by your health plan or plan sponsor, as applicable.

We may show you advertisements or sponsored search results ("Sponsored Results") through the Services, including above, next to, or interspersed within the other search results. Spoodle receives additional fees from Healthcare Providers for including them in Sponsored Results, and such Sponsored Results are not, and should not be considered, an endorsement, referral or recommendation by Spoodle of the Healthcare Provider. Sponsored Results are conspicuously labeled as "Sponsored" or "Paid Ad" across the Services.

5. THE SERVICES AND CONTENT ARE INFORMATIONAL AND EDUCATIONAL RESOURCES

The Services are an informational and educational resource for consumers and Healthcare Providers. We may, but have no obligation to, publish Content through the Services that is reviewed by our editorial personnel. No party (including Spoodle) involved in the preparation or publication of such works guarantees that the Content is timely, accurate or complete, and they will not be responsible or liable for any errors or omissions in, or for the results obtained from the use of, such Content.

Healthcare Provider Content:

Content related to Healthcare Providers and their practices ("Healthcare Provider Content") is intended for general reference purposes only. Healthcare Provider Content may be provided by the Healthcare Provider and/or office staff, and collected from multiple other data sources that may not be confirmed by the Healthcare Provider. While we make efforts to confirm Healthcare Provider Content and keep it up to date, it can change frequently and may become out of date, incomplete or inaccurate at any time. Spoodle does not provide any advice or certification regarding the qualifications of any particular Healthcare Provider.

Procedures/Products/Services:

Procedures, products, services and devices discussed and/or marketed through the Services are not applicable to all individuals, patients or all clinical situations. Any procedures, products, services or devices represented through the Services by advertisers, sponsors, and other participants of the Services, either paid or unpaid, are presented for your awareness and do not necessarily imply, and we make no claims as to, safety or appropriateness for any particular individual or prediction of effectiveness, outcome or success.

AI Content

We may make available through the Services certain features or content powered by artificial intelligence ("AI", and such features, the "AI Features").

Without limiting anything else herein, we make no representations or warranties whatsoever regarding the AI Features, which are provided "AS IS" and should be used at your own risk. Before interacting with the AI Features, you are responsible for making your own determination that the AI Features are suitable, and you are responsible for any reliance on the accuracy, completeness, or usefulness of any AI Features. You should not act or refrain from acting on the basis of any information made available through the Services, including the AI Features. We are not responsible for monitoring any interactions between you and the AI Features. You should evaluate the accuracy of any information produced from an AI Feature as appropriate for your use case. The AI Features may provide incomplete, incorrect, or offensive information that does not represent our views. If any information from an AI Feature references any third party products or services, it doesn't mean the third party endorses or is affiliated with us.

Under no circumstances will we be liable in any way for the AI Features or any information generated by the AI Features, including, but not limited to, infringement of intellectual property rights, for any errors or omissions, or for any loss or damage of any kind incurred as a result of your interaction with the AI Features.

6. MEDICAL INFORMATION

You may elect to enter certain medical information into the Services, including by requesting an appointment or filling out appointment forms provided for the Provider through Spoodle ("Pet Medical Information Form") on behalf of yourself or a third party from whom you have authorization to provide such information. You acknowledge and agree that such information will be reviewed and approved by you or someone authorized by you at the time of your appointment to ensure its accuracy. You also acknowledge that Spoodle may use the data or information you provide in a Pet Medical Information Form in accordance with our Privacy Policy.

7. YOUR RESPONSIBILITIES

7.1 Your Spoodle Account Credentials

When you create a Spoodle Account, you will provide an email address and create a password (collectively, "Credentials"). You should keep your Credentials private and not share your Credentials with anyone else. You must immediately notify us if your password has been stolen or compromised by sending an email to jjvo@spoodle.co. You promise to provide us with accurate, complete, and updated registration information about yourself. You may also be able to connect to the Services maintained by a third party company, such as Meta Platforms, Inc., Google LLC ("Google") or Apple Inc. ("Apple"). If you connect to the Services through a third party service, you give us permission to access and use your information from such third party service as permitted by such third party service, and to store your log-in credentials for such third party service. You are ultimately in control of how much information is accessible to us and may exercise such control by adjusting your privacy settings on such third party service. Spoodle has no control over, and assumes no responsibility for, the services, content, accuracy, privacy policies, or practices of or opinions expressed by any such third party.

7.2 Your Responsibilities Generally

While it's free to create a Spoodle Account and download our app, you are still responsible for your healthcare expenses. Any charges for any medical or related services rendered by Healthcare Providers will apply and will be entirely your responsibility. You are responsible for ensuring that all information that you provide to Spoodle is accurate and up-to-date, including your insurance information. Some Services may not be available through Spoodle or your Healthcare Provider depending upon a number of factors, including your insurance participation. Ultimately, you must resolve any dispute between you or any Healthcare Provider arising from any transaction hereunder directly with the Healthcare Provider.

You are responsible for all use of the Services and for all use of your Credentials, including use by others to whom you have given your Credentials. You may only use the Services for lawful, non-commercial purposes. If your use of the Services is prohibited by applicable laws, then you aren't authorized to use the Services. You may not use the Services in any manner that could damage, disable, overburden, or impair our servers or networks, or interfere with any other party's use and enjoyment of the Services. You may not attempt to gain unauthorized access to or to exceed your authorized access to any of the Services, user accounts, or computer systems or networks, through any means. You may not accumulate or index, directly or indirectly, any Content or portion of the Services (including, without limitation, Healthcare Provider Content, appointment availability, price information, or Insurance Content) for any purpose whatsoever.

In addition to our rights in these Terms of Use, we may take any legal action and implement any technological measures to prevent violations of the restrictions hereunder and to enforce these Terms of Use, our Acceptable Use Policy, and our Community Standards.

7.3 Responsibilities of Healthcare Providers and Others in the Healthcare or Medical Industries

If you are a Healthcare Provider or other person or entity in the healthcare or medical industries, regardless of whether you maintain a Spoodle Account or whether you schedule or intend to schedule appointments through the Services, you acknowledge and agree that:

(a) You will not use the Services to view, access or otherwise use, directly or indirectly, price, availability, or other Content for any purpose other than your own personal use as a patient or prospective patient;

(b) You will not use the Services to establish, attempt to establish, or enforce, directly or indirectly, any agreement or coordination of the prices charged for any product or service; the kinds, frequencies or amounts of any product or service offered; or the customer or customer categories for any product or service, or otherwise engage or attempt to engage in price fixing, output restriction, or customer or market allocation; and

(c) You will not use the Services, directly or indirectly, to engage in any anti-competitive, deceptive or unfair practices (including but not limited to booking fraudulent healthcare appointments or manipulating any review or rating data), or otherwise violate applicable antitrust, competition or consumer protection laws, or regulations.

7.4 Disputes Between Users

If there is a dispute between participants on this site or Services, or between users and any third party (including but not limited to Healthcare Providers), you agree that Spoodle is under no obligation to become involved. In the event that you have a dispute with one or more other users or Healthcare Providers, you release Spoodle, its directors, officers, employees, agents, and successors from claims, demands, and damages of every kind or nature, known or unknown, suspected or unsuspected, disclosed or undisclosed, arising out of or in any way related to such disputes and/or our Services.

9. THIRD PARTY LINKS AND SERVICES

9.1 Links to Other Websites

While using the Services, you may encounter links to other websites. These links are provided for your convenience only and we do not endorse these sites or the products and services they provide. You acknowledge and agree that we are not responsible or liable for the content or accuracy of these other websites. Although we attempt to link to trustworthy websites, it is possible that they will contain materials that are objectionable, unlawful, or inaccurate and we will not be responsible or liable for the legality or decency of material contained in or accessed through such other websites. By using the Services, you release and hold us harmless from any and all liability arising from your use of any third-party website or service. Your interactions with organizations and/or individuals found on or through the Services, including payment and delivery of goods or services, and any other terms, conditions, warranties or representations associated with such dealing, are solely between you and such organizations and/or individuals. You should make whatever investigation you feel necessary or appropriate before proceeding with any online or offline transaction with any of these third parties. You agree that Spoodle will not be responsible or liable for any loss or damage of any sort incurred as the result of any such dealings.

9.2 Third Party Software

We may incorporate third party software as part of certain Services, including without limitation open source third party software. Your use of such third party software is subject to any and all applicable additional terms and conditions governing such use provided by the third party software provider. Where applicable, additional notices relating to the third party software may be provided by us, which for example may contain attribution and disclaimer notices applicable to the third party software.

9.3 Application Stores

You acknowledge and agree that the availability of our mobile application is dependent on the third party stores from which you download the application (e.g., the Apple App Store, Google Play or other store or distribution platform (each, an "Application Provider")). Each Application Provider may have its own terms and conditions to which you must agree before downloading mobile applications from such store. You agree to comply with, and your license to use our application is conditioned upon your compliance with, such Application Provider terms and conditions. To the extent such other terms and conditions from such Application Provider are less restrictive than, or otherwise conflict with, the terms and conditions of these Terms of Use, the more restrictive or conflicting terms and conditions in these Terms of Use apply.

If you are accessing the Services via an application (an "Application") through an Application Provider, you and us acknowledge and agree that: (i) these Terms of Use are between you and us, and not the Application Provider, and that we are responsible for the Application, not the Application Provider; (ii) the Application is licensed to you on a limited, non-exclusive, non-transferrable, non-sublicensable basis, solely to be used in connection with the Services, subject to all the terms and conditions of these Terms of Use as they are applicable to the Services; (iii) with respect to Apple as the Application Provider, you will only use the Application in connection with an Apple device that you own or control; (iv) the Application Provider has no obligation to furnish maintenance and support services or handle any warranty claims with respect to the Application; (v) in the event of any failure of the Application to conform to any applicable warranty, including those implied by law, you may notify the Application Provider of such failure; upon notification, the Application Provider's sole warranty obligation to you will be to refund to you the purchase price, if any, of the Application; (vi) we, and not the Application Provider, are responsible for addressing any claims you or any third party have relating to the Application; (vii) in your use of the Application, you will comply with any applicable third-party terms of agreement which may affect or be affected by such use; (viii) the Application Provider and its subsidiaries are third party beneficiaries of these Terms of Use as related to your use of the Application, and that upon your acceptance of these Terms of Use, the Application Provider will have the right (and will be deemed to have accepted the right) to enforce these Terms of Use as related to your use of the Application against you as the third-party beneficiary; (ix) in the event of any third-party claim that the Application or your possession and use of the Application infringes that third party's intellectual property rights, Spoodle, and not Application Provider, will be responsible for the investigation, defense, settlement, and discharge of any such infringement claim; and (x) you are not located in a country subject to a U.S. government embargo, or that has been designated by the U.S. government as a "terrorist supporting" country, and that you are not listed on any U.S. government list of prohibited or restricted parties. The foregoing terms apply to your use of all the Services, including the Application.

11. REVIEWS AND OTHER CONTENT YOU POST OR SUBMIT

You will have the opportunity to submit feedback regarding your experiences with Healthcare Providers you find through the Services, to submit inquiries concerning possible medical needs, and to participate in the other interactive or community features of the Services (collectively, "Posted Information"). It is important that you act responsibly when providing Posted Information. Your Posted Information must comply with our Acceptable Use Policy, and your Healthcare Provider reviews must comply with our posted guidelines, as well as any internal policies we may develop and implement from time to time. Please note that while Spoodle may moderate Posted Information (including but not limited to Healthcare Provider reviews) for compliance with the requirements in this paragraph, Spoodle does not endorse or confirm the accuracy of any statements made in such Posted Information; Posted Information reflects solely the views or opinions of the author, and not of Spoodle.

Please note that all of the following licenses are subject to our Privacy Policy to the extent they relate to Posted Information that is also your personally-identifiable information.

By posting Posted Information through the Services, you agree to and hereby grant, and you represent and warrant that you have the right to grant, to Spoodle and its affiliates, agents, and contractors an irrevocable, perpetual, royalty-free, fully sublicensable, fully paid up, worldwide license to use, copy, publicly perform, digitally perform, publicly display, and distribute such Posted Information and to adapt, edit, translate, prepare derivative works of, incorporate into other works, and otherwise fully exploit such Posted Information. You represent and warrant that you have all rights to grant such licenses to us without infringement or violation of any third party rights, including without limitation any privacy rights, publicity rights, copyrights, trademarks, contract rights, or any other intellectual property or proprietary rights. You may not post Posted Information which is false or fraudulent, or which otherwise does not accurately represent your opinions and experiences.

You understand and agree that Spoodle, in performing the required technical steps to provide the Services to our users (including you), may need to make changes to your Posted Information to conform and adapt that Posted Information to the technical requirements of connection networks, devices, services, or media, and the foregoing licenses include the rights to do so.

Posted Information is the sole responsibility of the person from whom such Posted Information originated and does not reflect the opinion of Spoodle. Spoodle does not assume liability for Posted Information or for any claims, liabilities, or losses resulting from any Posted Information.

We also welcome and encourage you to provide feedback, comments and suggestions for improvements to the Services ("Feedback"). You may submit Feedback by emailing us, reaching out to our social networking accounts, or by other means of communication. Any Feedback you submit to us will be considered non-confidential and non-proprietary to you. By submitting Feedback to us, you grant us a non-exclusive, worldwide, royalty-free, irrevocable, sub-licensable, perpetual license to use and publish such Feedback for any purpose, without compensation to you.

12. YOUR USE OF CONTENT

All of the Content is owned by us or our licensors and is protected by copyright, trademark, patent, and trade secret laws, other proprietary rights, and international treaties. You acknowledge that the Services and any underlying technology or software used in connection with the Services contain Spoodle's proprietary information. We give you permission to use the Content for personal, non-commercial purposes only and do not transfer any intellectual property rights to you by virtue of permitting your use of the Services. You may print, download, and store information from the Services for your own convenience, but you may not copy, distribute, republish (except as expressly permitted herein), sell, or exploit any of the Content, or exploit the Services in whole or in part, for any commercial gain or purpose whatsoever. Except as expressly provided herein, neither Spoodle nor its suppliers grant you any express or implied rights, and all rights in the Services not expressly granted by Spoodle to you are retained by Spoodle.

13. DISCLAIMER

We created Spoodle to improve patients' healthcare experiences, and we want your experience with Spoodle to be exceptional. While we work hard to make that happen, you acknowledge that we have no control over, and no duty to take any action regarding: (a) which users gain access to the Services, (b) what Content you access, (c) what effect the Content may have on you, (d) how you may interpret or use the Content, or (e) what actions you may take as a result of having been exposed to the Content. You release us from all liability for your use or inability to use any Content. We and our licensors, suppliers, partners, parent, subsidiaries or affiliated entities, and each of their respective officers, directors, members, employees, consultants, contract employees, representatives, and agents, and each of their respective successors and assigns (Spoodle and all such parties together, the "Spoodle Parties") make no representations or warranties regarding suggestions or recommendations of services or products offered or purchased through the Services, and the Spoodle Parties will not be responsible or liable for the accuracy, copyright compliance, legality, or decency of material contained in or accessed through the Services. We have no special relationship with or fiduciary duty to you.

WE (AND OUR LICENSORS AND SUPPLIERS) PROVIDE THE SERVICES "AS IS" AND "AS AVAILABLE." WE MAKE NO EXPRESS OR IMPLIED WARRANTIES OR GUARANTEES ABOUT THE CONTENT OR SERVICES. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE HEREBY DISCLAIM ALL SUCH WARRANTIES, INCLUDING ALL STATUTORY WARRANTIES, WITH RESPECT TO THE SERVICES, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES THAT THE SERVICES ARE MERCHANTABLE, OF SATISFACTORY QUALITY, ACCURATE, FIT FOR A PARTICULAR PURPOSE OR NEED, OR NON-INFRINGING. WE DO NOT GUARANTEE THAT THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE SERVICES WILL BE EFFECTIVE, RELIABLE OR ACCURATE OR WILL MEET YOUR REQUIREMENTS. WE DO NOT GUARANTEE THAT YOU WILL BE ABLE TO USE THE SERVICES (EITHER DIRECTLY OR THROUGH THIRD-PARTY NETWORKS) AT TIMES OR LOCATIONS OF YOUR CHOOSING. WE ARE NOT RESPONSIBLE FOR THE ACCURACY, RELIABILITY, TIMELINESS OR COMPLETENESS OF INFORMATION PROVIDED BY USERS OF THE SERVICES OR ANY OTHER DATA OR INFORMATION PROVIDED OR RECEIVED THROUGH THE SERVICES. EXCEPT AS EXPRESSLY SET FORTH HEREIN, SPOODLE MAKES NO WARRANTIES ABOUT THE INFORMATION SYSTEMS, SOFTWARE AND FUNCTIONS MADE ACCESSIBLE THROUGH THE SERVICES OR ANY OTHER SECURITY ASSOCIATED WITH THE TRANSMISSION OF SENSITIVE INFORMATION. SPOODLE DOES NOT WARRANT THAT THE SERVICES WILL OPERATE UNINTERRUPTED, ERROR-FREE, BUG-FREE OR FREE FROM DEFECTS, THAT LOSS OF DATA WILL NOT OCCUR, OR THAT THE SERVICES OR SOFTWARE ARE FREE OF COMPUTER VIRUSES, CONTAMINANTS OR OTHER HARMFUL ITEMS.

14. GENERAL LIMITATION OF LIABILITY

YOUR SOLE AND EXCLUSIVE REMEDY FOR ANY DISPUTE WITH US IS THE CANCELLATION OF YOUR SPOODLE ACCOUNT. IN NO EVENT SHALL OUR CUMULATIVE LIABILITY TO YOU FOR ANY AND ALL CLAIMS RELATING TO OR ARISING OUT OF YOUR USE OF THE SERVICES, REGARDLESS OF THE FORM OF ACTION, EXCEED THE GREATER OF (I) ONE-HUNDRED ($100) DOLLARS OR (II) THE TOTAL AMOUNT OF FEES, IF ANY, THAT YOU ACTUALLY PAID TO SPOODLE AND WHICH SPOODLE RETAINED IN THE SIX MONTHS PRIOR TO THE EVENT GIVING RISE TO THE APPLICABLE CLAIM.

TO THE FULLEST EXTENT ALLOWED BY APPLICABLE LAW, IN NO EVENT AND UNDER NO LEGAL THEORY (INCLUDING, WITHOUT LIMITATION, TORT, CONTRACT, STRICT LIABILITY, OR OTHERWISE) SHALL ANY OF THE SPOODLE PARTIES BE LIABLE TO YOU (OR TO ANY THIRD PARTY CLAIMING UNDER OR THROUGH YOU) FOR ANY INDIRECT, SPECIAL, INCIDENTAL, PUNITIVE, CONSEQUENTIAL OR EXEMPLARY DAMAGES ARISING FROM YOUR USE OF, OR INABILITY TO USE, THE SERVICES. THESE EXCLUSIONS APPLY TO ANY CLAIMS FOR LOST PROFITS, LOST DATA, LOSS OF GOODWILL, BUSINESS INTERRUPTION, WORK STOPPAGE, ACCURACY OF RESULTS, COMPUTER FAILURE OR MALFUNCTION, ANY OTHER COMMERCIAL DAMAGES OR LOSSES, ANY SUBSTITUTE GOODS, SERVICES, OR TECHNOLOGY, OR MEDICAL MALPRACTICE OR NEGLIGENCE OF HEALTHCARE PROVIDERS UTILIZED THROUGH USE OF THE SERVICES, OR ANY MATTER BEYOND OUR REASONABLE CONTROL, EVEN IF WE KNEW OR SHOULD HAVE KNOWN OF THE POSSIBILITY OF SUCH DAMAGES. BECAUSE SOME STATES OR JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR THE LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, IN SUCH STATES OR JURISDICTIONS, OUR LIABILITY SHALL BE LIMITED IN ACCORDANCE HEREIN TO THE MAXIMUM EXTENT PERMITTED BY LAW.

YOU SHALL AND HEREBY WAIVE YOUR RIGHTS WITH RESPECT TO CALIFORNIA CIVIL CODE SECTION 1542 OR ANY SIMILAR LAW OF ANY JURISDICTION, WHICH SAYS IN SUBSTANCE THAT "A GENERAL RELEASE DOES NOT EXTEND TO CLAIMS THAT THE CREDITOR OR RELEASING PARTY DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR HER FAVOR AT THE TIME OF EXECUTING THE RELEASE, AND THAT, IF KNOWN BY HIM OR HER, WOULD HAVE MATERIALLY AFFECTED HIS OR HER SETTLEMENT WITH THE DEBTOR OR RELEASED PARTY."

15. TERMINATION

We reserve the right, in our sole discretion, to terminate, suspend and/or deactivate your Spoodle Account immediately, without notice, if there has been a violation of this Agreement, our Acceptable Use Policy, our Community Standards, or other policies and terms posted through the Services by you or by someone using your Credentials without authorization. We may also terminate, suspend or deactivate your Spoodle Account for any other reason, including inactivity for an extended period. Spoodle shall not be liable to you or any third party for any termination, suspension or deactivation of your access to the Services. Further, you agree not to attempt to use the Services after any such termination, suspension or deactivation (except where deactivation is due solely to inactivity, and you are permitted to create another Spoodle Account). Account termination may result in destruction of any content associated with your Spoodle Account. Sections 1 - 6, 9 - 18, and any other provisions that, by their nature, should survive termination of these Terms of Use shall survive any termination or expiration of these Terms of Use.

Spoodle reserves the right to investigate and, at our discretion, take appropriate legal action against anyone who violates these Terms of Use or applicable law related to the Services, including without limitation, removing any offending communication from the Services, terminating the Spoodle Account of such violators, and or blocking your use of the Services.

16. INDEMNIFICATION

Upon a request by us, you agree to defend, indemnify, and hold harmless the Spoodle Parties from all liabilities, claims, damages (actual and consequential), demands, and expenses, including reasonable attorney's fees, that arise from or are related to (a) your use of the Services; or (b) the violation of this Agreement (including without limitation these Terms of Use, the Acceptable Use Policy, and Community Standards); or (c) the violation of any intellectual property or other right of any person or entity; or (d) by any person using your Credentials without authorization. The foregoing indemnification obligation does not apply to liabilities, claims and expenses arising as a result of our own gross negligence or intentional misconduct.

17. ARBITRATION AGREEMENT

We hope that we can work out any disagreements you might have with Spoodle. But if there is a dispute that needs to be further resolved, that process will take place according to this section. Please read the following ARBITRATION AGREEMENT carefully, because it requires you to arbitrate certain disputes and claims with Spoodle and limits the manner in which you can seek relief from Spoodle. Both you and Spoodle acknowledge and agree that for the purpose of any dispute arising out of relating to the subject matter of these Terms of Use, Spoodle's officers, directors, employees, and independent contractors ("Personnel") are third-party beneficiaries of these Terms of Use, and that upon your acceptance of these Terms of Use, Personnel will have the right (and will be deemed to have accepted the right) to enforce these Terms of Use against you as a third-party beneficiary hereof.

17.1 Arbitration Rules; Applicability of Arbitration Agreement

The parties shall use their best efforts to settle any dispute, claim, question, or disagreement arising out of or relating to the subject matter of these Terms directly through good-faith negotiations, which shall be a precondition to either party initiating arbitration. If such negotiations do not resolve the dispute, it shall be finally settled by binding arbitration in New York County, New York. The arbitration will proceed in the English language, in accordance with the JAMS Streamlined Arbitration Rules and Procedures (the "Rules") then in effect, by one commercial arbitrator with substantial experience in resolving intellectual property and commercial contract disputes. The arbitrator shall be selected from the appropriate list of JAMS arbitrators in accordance with such Rules. Judgment upon the award rendered by such arbitrator may be entered in any court of competent jurisdiction.

17.2 Cost of Arbitration

The Rules will govern payment of all arbitration fees. Spoodle will pay all arbitration fees for claims less than $400 dollars. Spoodle will not seek its attorneys' fees and costs in arbitration unless the arbitrator determines that your claim is frivolous.

17.3 Small Claims Court; Infringement

Either you or Spoodle may assert claims, if they qualify, in small claims court in New York County, New York or any United States county where you live or work. Furthermore, notwithstanding the foregoing obligation to arbitrate disputes, each party shall have the right to pursue injunctive or other equitable relief at any time, from any court of competent jurisdiction, to prevent the actual or threatened infringement, misappropriation or violation of a party's copyrights, trademarks, trade secrets, patents or other intellectual property rights.

17.4 Waiver of Jury Trial

YOU AND SPOODLE WAIVE ANY CONSTITUTIONAL AND STATUTORY RIGHTS TO GO TO COURT AND HAVE A TRIAL IN FRONT OF A JUDGE OR JURY. You and Spoodle are instead choosing to have claims and disputes resolved by arbitration. Arbitration procedures are typically more limited, more efficient, and less costly than rules applicable in court and are subject to very limited review by a court. In any litigation between you and Spoodle over whether to vacate or enforce an arbitration award, YOU AND SPOODLE WAIVE ALL RIGHTS TO A JURY TRIAL, and elect instead to have the dispute be resolved by a judge.

17.5 Waiver of Class or Consolidated Actions

ALL CLAIMS AND DISPUTES WITHIN THE SCOPE OF THIS ARBITRATION AGREEMENT MUST BE ARBITRATED OR LITIGATED ON AN INDIVIDUAL BASIS AND NOT ON A CLASS BASIS. CLAIMS OF MORE THAN ONE CUSTOMER OR USER CANNOT BE ARBITRATED OR LITIGATED JOINTLY OR CONSOLIDATED WITH THOSE OF ANY OTHER CUSTOMER OR USER. If however, this waiver of class or consolidated actions is deemed invalid or unenforceable, neither you nor Spoodle is entitled to arbitration; instead all claims and disputes will be resolved in a court as set forth in (g) below.

17.6 Opt-out

You have the right to opt out of the provisions of this Section by sending written notice of your decision to opt out to the following address: Spoodle, Attn: 76 Bellevue Avenue, Rye New York 10580, postmarked within thirty (30) days of first accepting these Terms. You must include (i) your name and residence address, (ii) the email address and/or telephone number associated with your account, and (iii) a clear statement that you want to opt out of these Terms' arbitration agreement.

17.7 Exclusive Venue

If you send the opt-out notice in Section 17.6, and/or in any circumstances where the foregoing arbitration agreement permits either you or Spoodle to litigate any dispute arising out of or relating to the subject matter of these Terms in court, then the foregoing arbitration agreement will not apply to either party, and both you and Spoodle agree that any judicial proceeding (other than small claims actions) will be brought in the state or federal courts located in, respectively, New York County, New York, or the federal district in which that county falls.
17.8 Severability
If the prohibition against class actions and other claims brought on behalf of third parties contained above is found to be unenforceable, then all of the preceding language in this Arbitration Agreement section will be null and void. This arbitration agreement will survive the termination of your relationship with Spoodle.

18. MISCELLANEOUS

18.1 Electronic Contracting; Copyright Dispute

Your affirmative act of using the Services and/or creating a Spoodle Account constitutes your electronic signature to this Agreement, which includes our Privacy Policy, Acceptable Use Policy and Community Standards. This Agreement and any other documents to be delivered in connection with the Services may be electronically signed, and any electronic signatures appearing on this Agreement or such other documents are the same as handwritten signatures for the purposes of validity, enforceability, and admissibility.

Please visit our Acceptable Use Policy to review our copyright dispute policy.

Phone/ Text Communications

(a) Transactional Communications. By voluntarily providing your mobile phone number to Spoodle and agreeing to receive text messages, you expressly agree that Spoodle may contact you by telephone, SMS, or MMS messages (or successor protocols or technologies) for transactional, operational, or informational purposes, including appointment confirmations, appointment reminders, and post-appointment feedback requests, at the phone number provided. Message and data rates may apply. Message frequency varies. Reply STOP to cancel or HELP for help.

(b) Marketing Communications. By opting in to receive recurring automated marketing calls or text messages (such as SMS, MMS, or successor protocols or technologies) from Spoodle, you expressly agree to receive messages concerning the marketing and sale of our products, services, offers, promotions, and events, as well as your relationship with us, including your orders and the products and services that you have inquired about. You understand that consent is not required to make any purchase from us. Message and data rates may apply. Message frequency varies. Reply STOP to cancel or HELP for help.

(c) Representations; Indemnity: You represent and warrant that mobile number provided to us is true and accurate, and that each person you register for the Services or for whom you provide a wireless phone number has consented to receive communications from Spoodle. You agree to indemnify and hold Spoodle harmless from and against any and all claims, liabilities, damages (actual and consequential), losses and expenses (including attorneys' fees) arising from or in any way related to your breach of the foregoing, including claims under the Federal Telephone Consumer Protection Act or any state law equivalents, as well as claims relating to your voluntary provision of a telephone number that is not owned by you and/or your failure to update your account information for any changes in your mobile telephone number.

(d) Participation Requirements. You must have a wireless device of your own, capable of two-way messaging, be using a participating wireless carrier, and be a wireless service subscriber with text messaging service. Not all mobile devices may be supported and our messages may not be deliverable in all areas. Message and data rates from your mobile telephone service provider may apply and are subject to the terms and conditions imposed by your provider.

(e) Opt-Out Instructions: You can opt out of receiving transactional and/or marketing text messages at any time by adjusting your notification settings in your account, replying STOP, END, CANCEL, UNSUBSCRIBE, or QUIT to any message that you receive from us, or otherwise following the given instructions for doing so. You acknowledge and agree to accept a final text message confirming your opt-out. Note that opting out of receiving all texts may impact your use of the Services.

(f) Accurate Account Information: If you change the phone number(s), you should update your Spoodle account information and the phone number(s) attached to your account to assure we have up-to-date contact information, and any new phone number(s) you attach to your account may receive Spoodle's standard SMS messages unless you also unsubscribe via the above procedures.

18.3 Limitation of Claims

No action arising under or in connection with this Agreement, regardless of the form, may be brought by you more than one (1) year after the cause of action arose; actions brought thereafter are forever barred.

18.4 Severability

In the event any one or more of the provisions of this Agreement shall for any reason be held to be invalid, illegal or unenforceable, the remaining provisions of this Agreement shall be unimpaired. Further, the invalid, illegal or unenforceable provision shall be replaced by a provision that comes closest to the intention of the parties that underlie the invalid, illegal or unenforceable provision, except to the extent no such provision is valid, legal and enforceable, in which case such invalid, illegal or unenforceable provision shall be limited or eliminated to the minimum extent necessary so that the other provisions of this Agreement remain in full force and effect and enforceable.

18.5 Governing Law; Language

This Agreement shall be deemed to have been entered into and shall be construed and enforced in accordance with the Federal Arbitration Act, applicable federal law, and the laws of the State of New York as applied to contracts made and to be performed entirely within New York, without giving effect to the state's conflicts of law statute. This Agreement and all documents referenced herein were drafted in the English language and any translations thereof shall not be binding on either party to the extent they conflict with the English versions.

18.6 Entire Agreement; Waiver

This Agreement and any supplemental terms, policies, rules and guidelines posted through the Services, each of which are incorporated herein by reference, including the Privacy Policy, the Acceptable Use Policy and the Community Standards, constitute the entire agreement between you and us and supersede all previous written or oral agreements. The failure of either party to exercise in any respect any right provided for herein shall not be deemed a waiver of any further rights hereunder.

18.7 Headings

The headings of the sections of this Agreement are for convenience only, do not form a part hereof, and in no way limit, define, describe, modify, interpret or construe the meaning, scope or intent of this Agreement or any terms or conditions therein.

18.8 Assignment

We may assign this Agreement at any time, including, without limitation, to any parent, subsidiary, or any affiliated company, or as part of the sale to, merger with, or other transfer of our business or any assets to another entity. You may not assign, transfer or sublicense this Agreement to anyone else and any attempt to do so in violation of this section shall be null and void.

18.9 Eligibility

You must be 18 years of age or over, or the legal age to form a binding contract in your jurisdiction if that age is greater than 18 years of age, to create a Spoodle Account or use the Services on your own. Those under the age of 13 may not use the Services. If you are between the ages of 13 and 18 or the applicable legal age in your jurisdiction, you can use the Services only under the supervision of your parent or guardian who has agreed to these Terms of Use. By using the Services on behalf of a minor child, you represent and warrant that you are the parent or legal guardian of such child, and that all references in these Terms of Use to "you" shall refer to such child or such other individual on whose behalf you have authorization to enter into these Terms of Use and you in your capacity as the parent or legal guardian of such child or as the authorized party of such individual.

If you do not qualify under these Terms of Use, you may not use the Services. Use of the Services is void where prohibited by applicable law, and the right to access the Services is revoked in such jurisdictions. By using the Services, you represent and warrant that you have the right, authority, and capacity to enter into these Terms of Use. The Services are administered in the U.S. and intended for U.S. users only; any use outside of the U.S. or use related to activities outside of the U.S. is prohibited and at the user's own risk. Users are responsible for compliance with any local, state or federal laws applicable to their use of the Services.`;

// Privacy Policy Content
const PRIVACY_POLICY = `As a digital platform, Spoodle's main priority is to protect your privacy and the information you provide to the platform. The agreement below outlines how we manage any data that we collect through users or third parties and store on the platform. We actively work to protect any User Data from you across our web application and our mobile application (termed "The Platform") as discussed in the Privacy Policy.

The Privacy Policy below will provide context for users on the Platform on how we manage users' information.

BY USING OR ACCESSING THE SERVICES IN ANY MANNER, YOU ACKNOWLEDGE THAT YOU ACCEPT THE PRACTICES AND POLICIES OUTLINED IN THIS PRIVACY POLICY, AND YOU HEREBY CONSENT THAT WE WILL COLLECT, USE, AND SHARE YOUR INFORMATION IN THE WAYS DESCRIBED HEREIN. IF YOU DO NOT AGREE WITH THIS PRIVACY POLICY, YOU MAY NOT USE THE SERVICES. IF YOU USE THE SERVICES ON BEHALF OF SOMEONE ELSE (SUCH AS YOUR CHILD), YOU REPRESENT THAT YOU ARE AUTHORIZED BY SUCH INDIVIDUAL TO ACCEPT THIS PRIVACY POLICY ON THE INDIVIDUAL'S BEHALF.

Platform use will be subject to the Agreement (as "Agreement" is defined in our Terms & Conditions, which also includes this Privacy Policy).

We plan to

User Data

In the tables below, the groups of User Data that Spoodle captures are outlined below that we have gathered. "Personal Data" refers to any information we might collect on an individual that is commonly  referenced as "personally identifiable information" and " personally identifiable information"  in relevant data privacy laws, rules, and regulations. "Personal Data" will also refer to information related to an individual's pet as well. In the section below, we identify representative examples of the specific personal data which we collect along with what we use the data for and whom we might share the personal data with. The list is by no means exhaustive; the data we collect is not limited to what is described below.


Types Of Personal Data Spoodle Collects

1. Personal Identifiers

First and last name
E-mail address
Phone number
Mailing address
Zip code

2. Commercial Information
Payment card type
Last four digits of payment card
Billing contact
Billing email

3. Online Identifiers
IP Address
Device ID
Domain server
Type of device/operating system/browser used to access the Services
     
4. Internet Activity
Webpage interactions
Web analytics
Referring webpage/source through which you access the Services
Non-identifiable request IDs
Statistics associated with the interaction between your device or browser and the Services

5. Geolocation Data
IP address-based location information

6. User Demographic Data 
Age
Date of birth
Zip code

7. Booking Appointment Data
Appointment date/time
Provider information
Appointment procedure
Whether or not user is a new patient for a particular provider

8. Sensitive Pet Personal Information
Health information, such as:
Health conditions
Healthcare Providers visited
Reasons for visit
Dates of visit
Medical history and health information you provide us
Health Insurance information

9. Other Identifying Information That You Voluntarily Choose to Provide
Unique identifiers such as passwords
Personal Data in emails, letters, or other communications you send to us
Social Network Data (for accounts you chose to link to the Services)


Categories of Sources of Personal Data From You

1. When You Provide Information Directly to Us
When you make your profiles
When you search for appointments with healthcare providers
When you provide information through screenings process of appointments with healthcare providers
Information through surveys
Contacting Spoodle via any means of communication, through the app, phone number and email

2. When Personal Data is Automatically Collected When You Use the Services
Cookies (defined below).
Any information your device transmits through the use of our platform
We can receive location info from use of the mobile application


Categories of Sources of Personal Data From Third Parties

1. Service Providers
We may work with service providers to understand typical pet owner interactions for platform improvements
We may engage service providers to find new pet owners

2. Analytics Partners
Looking for website traffic data

3. Healthcare Providers
We may receive certain data from your Healthcare Provider(s) to facilitate booking appointments and billing for services such as virtual care.

4. Social Networks
We may pool information from social media profiles linked to the Spoodle profile with Spoodle user information

5. Advertising Partners
Any partners we might work with to advertise Spoodle, or partners who Spoodle advertises on our platform


Reasons Spoodle Collects Personal Data

Seamless Function On Our Platform And Data To Improve Upon Our Offerings
Being able to show your profile and the profile for your pet on your app and to healthcare providers screening appointments
Billing/Payments
Identity Verification on behalf of healthcare provides
Application Personalization
Improving on our services, offering, product development, and debugging process
Marketing
Advertising based on your interests and online behaviors
Creating de-identified datasets
We will not re-identify our datasets following choosing to de-identify any personal data
Correspondence
Sending you information with content we believe you might find useful, including updates on healthcare providers
Legal Requirements
Cooperating on any legal obligations we might have
Protecting Spoodle and your rights and property
Enforcing mutual agreements between users and Spoodle


Third Parties That We May Choose To Disclose Information To: Service Providers

1. Payment Processors
We will share your information with future payment processors once we add the functionality to the platform

2. Security and Fraud Prevention Consultants
In order to provide security on the platform and protect against suspicious/malicious activity

3. Hosting, Technology and Communications Providers;
In order to fix technical errors on the platform
Undertaking internal research for technological development and demonstration.

4. Communications Providers; Fulfillment Providers; Data Storage Providers; Analytics Providers; Insurance Verification Providers;
Undertaking activities to verify or maintain the quality or safety of our Services.


Third Parties That We May Choose To Disclose Information To: Selected Third Party Recipients

1. Ad Networks
Providing data to build ads
Impressions and the auditing of impressions

2. Healthcare Providers
The healthcare providers of the select pet owners

3. PIMS Software Systems
To update the healthcare providers on relevant owner and pet information for which they are the point of care

4. Other Uses that You Authorize
Any information that you may reveal in a review posting or online discussion, or forum is intentionally open to the public and is not in any way private. We recommend that you carefully consider whether to disclose any Personal Data in any public posting or forum. What you have written may be seen and/or collected by third parties and may be used by others in ways we are unable to control or predict.

5. Third-Party Business Partners You Access Through the Services
We will disclose certain Personal Data if you choose to use any service to log in to the Services. This includes logging in via social media platforms such as a Google or Facebook account.
To meet or fulfill the reason you provided the information to us.


Legal Obligations


We may disclose any Personal Data that we collect with third parties in conjunction with any of the activities set forth under "How We Disclose Your Personal Data" sections above.


Business Transfers

All Personal Data may be transferred to a third party if we undergo a merger, acquisition, bankruptcy, or other transaction in which that third party assumes control of our business (in whole or in part). Should one of these events occur, we will make reasonable efforts to notify you before your information becomes subject to different privacy and security policies and practices.


Data that is Not Personal Data

We may create aggregated and/or de-identified data from the Personal Data we collect, including by removing information that makes the data personally identifiable to a particular user. We may use such aggregated, de-identified, or anonymized data and share it with third parties for our lawful business purposes, including to analyze, build, and improve the Services and promote our business, provided that we will not share such data in a manner that could identify you.

We may also use screen recording tools in order to understand and analyze how individuals navigate and use our website. This technology will record mouse movements, clicks and similar actions, but we do not disclose any personal data with the screen recording tools and we do not link such information to your personal data.

In addition, we may use artificial intelligence ("AI") tools to enhance or operate certain functions of the site, such as chat and customer service features.


Tracking Tools, Advertising, and Opt-Out

The following sections provide additional information about how we collect your Personal Data.


Information Collected Automatically

The Services use cookies and similar technologies such as pixel tags, web beacons, clear GIFs, mobile identifiers, and JavaScript (collectively, "Cookies") to enable our servers to recognize your device and web browser and tell us how and when you visit and use our Services. We do this to analyze trends, learn about and advertise to our user base, and operate and improve our Services. For example, we use Cookies to tailor the Services or customize advertisements on and off of our Service by tracking navigation habits, measuring performance, storing authentication status so re-entering credentials is not required, customizing user experiences with the Services, and for analytics and fraud prevention. Cookies are small pieces of data – usually text files – placed on your computer, tablet, phone, or similar device when you use that device to visit our Services. We may also supplement the information we collect from you with information received from third parties, including third parties that have placed their own Cookies on your device(s).


We use the following types of Cookies:
Essential Cookies. Essential Cookies are required to provide you with features or services you have requested. For example, certain Cookies enable you to log into the secure areas of our Services. Disabling these Cookies may make certain features and services unavailable.
Functional Cookies. Functional Cookies are used to record your choices and settings regarding our Services, maintain your preferences over time and recognize you when you return to our Services. These Cookies help us to personalize our content for you, greet you by name, and remember your preferences (for example, your choice of language or region).
Performance/Analytical Cookies. Performance/Analytical Cookies allow us to understand how visitors use our Services such as by collecting information about the number of visitors to the Services, what pages visitors view on our Services, how long visitors are viewing pages on the Services, mouse clicks, mouse movements, scrolling activity, and text typed into the Services. Performance/Analytical Cookies also help us measure the performance of our advertising campaigns to help us improve our campaigns and the content for those who engage with our advertising. For example, Google LLC ("Google") uses cookies in connection with its Google Analytics services. Google's ability to use and share information collected by Google Analytics about your visits to the Services is subject to the Google Analytics Terms of Use and the Google Privacy Policy. You have the option to opt-out of Google's use of cookies by visiting the Google advertising opt-out page or the Google Analytics Opt-out Browser Add-on page.
Retargeting/Advertising Cookies. Retargeting/Advertising Cookies collect data about your online activity and identify your interests to provide advertising on and off of our Service that we believe is relevant to you. For more information about this, please see the section below titled "Information about Interest-Based Advertisements."
Web Beacons. Web Beacons (e.g., clear GIFs or pixel tags) are tiny graphic image files embedded in a webpage or email that may be used to collect information about the use of our Services, the web services of selected advertisers, and the emails, special promotions, or newsletters that we send. The information collected by Web Beacons allows us to analyze how many people are using the Services, using selected publishers' web services or opening emails, and for what purpose. Also, it allows us to enhance our interest-based advertising (discussed further below).
Mobile Device Identifiers. Mobile device identifiers help Spoodle learn more about our Users' demographics and internet behaviors. Mobile device identifiers are data stored on mobile devices that may track mobile devices and data, activities occurring on and through it, and the applications installed on it. Mobile device identifiers enable the collection of Personal Data, such as media access control, address, location, and tracking data, including without limitation IP address, domain server, type of device(s) used to access the Services, web browser(s) used to access the Services, referring webpage or other source through which you accessed the Services, other statistics, and information associated with the interaction between your browser or device and the Services.
Cross Device Matching. To determine if users have interacted with content across multiple devices and to match such devices, we may work with partners who analyze device activity data and/or rely on your information (including demographic, geographic, and interest-based data). We may also provide de-identified data to these partners to supplement this analysis. Based on this data, we may display targeted advertisements across devices that we believe are associated or use this data to further analyze usage of Services across devices.


You may also be able to reject mobile device identifiers by activating the appropriate setting on your mobile device. You can also delete all Cookies that are already on your device. Although you are not required to accept Spoodle Cookies, if you block, reject, or delete them, you may have to manually adjust some preferences every time you access the Services, as some functionalities may not work.


Information about Interest-Based Advertisements

We may serve advertisements and allow third-party ad networks, including third-party ad servers, ad agencies, ad technology vendors and research firms, to collect data on the Services and serve advertisements on and off of the Services. These advertisements may be targeted to users who fit certain general profile categories or display certain preferences or behaviors ("Interest-Based Ads"). Information for Interest-Based Ads (including Personal Data) may be provided to us by you or derived or inferred from the online activity or usage patterns of particular users on the Services and/or services of third parties. Such information may include IP address, mobile device ID, operating system, browser, webpage interactions, geographic location, and demographic information, such as gender and age range. Such information may be gathered through tracking users' activities across time and unaffiliated properties, including when you leave the Services. To accomplish this, we or our service providers may deliver Cookies, including Web Beacons, from an ad network to you through the Services. Web Beacons allow ad networks to provide anonymized, aggregated auditing, research and reporting for us and for advertisers. This information helps Spoodle learn more about our Users' demographics and internet behaviors. Web Beacons also enable ad networks to serve targeted advertisements to you when you visit other websites. Web Beacons allow ad networks to view, edit or set their own Cookies on your browser, just as if you had requested a webpage from their site.


Data Retention

We retain Personal Data about you as necessary to provide our Services or to perform our business or commercial purposes for collecting your Personal Data. When establishing a retention period for specific categories of data, we consider who we collected the data from, our need for the Personal Data, why we collected the Personal Data, and the sensitivity of the Personal Data. In some cases, we retain Personal Data for longer, if doing so is necessary to comply with our legal obligations, resolve disputes or collect fees owed, provide our Services, or is otherwise permitted or required by applicable law, rule or regulation.


Children's Privacy

The Services are not directed to or intended for use by children under 13 years of age. If you are a child under the age of 13, please do not attempt to register for or otherwise use the Services or send us any Personal Data. By accessing, using, and/or submitting information to or through the Services, you represent that you are over the age of 13. As noted in the Terms of Use, we do not knowingly collect or solicit Personal Data from children under the age of 13. If we learn that we have received any Personal Data directly from a child under age 13 without first receiving their parent's verified consent, we will use that Personal Data only to respond directly to that child (or their parent or legal guardian) to inform the child that they cannot use the Services. We will then subsequently delete that child's Personal Data. If you believe that a child under 13 may have provided us with Personal Data, please contact us at jjvo@spoodle.co.

If you are between the age 13 and the age of majority in your place of residence, you may use the Services only with the consent of or under the supervision of your parent or legal guardian. If you are a parent or legal guardian of a minor child, you may, in compliance with the Agreement, use the Services on behalf of such minor child. Any information that you provide us while using the Services on behalf of your minor child will be treated as Personal Data as otherwise provided herein.

If you use the Services on behalf of another person, regardless of age, you agree that Spoodle  may contact you for any communication made in connection with providing the Services or any legally required communications. You further agree to forward or share any such communication with any person for whom you are using the Services on behalf.`;

export default function LandingScreen() {
  const router = useRouter();
  const [showTermsModal, setShowTermsModal] = React.useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = React.useState(false);

  return (
    <LinearGradient
      colors={['#4559A7', '#5B6FB8', '#3A4A8F']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../assets/images/spoodle_logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.subtitle}>Your Pet&apos;s Health Companion</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/(auth)/sign-in")}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/(auth)/sign-up")}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text 
                style={styles.linkText}
                onPress={() => setShowTermsModal(true)}
              >
                Terms and Conditions
              </Text>
              {' '}and{' '}
              <Text 
                style={styles.linkText}
                onPress={() => setShowPrivacyModal(true)}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <FileText size={24} color="#4559A7" />
                <Text style={styles.modalTitle}>Terms & Conditions</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowTermsModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalScrollView} 
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <Text style={styles.modalText}>{TERMS_AND_CONDITIONS}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <ShieldCheck size={24} color="#4559A7" />
                <Text style={styles.modalTitle}>Privacy Policy</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPrivacyModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalScrollView} 
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <Text style={styles.modalText}>{PRIVACY_POLICY}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 24,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: -20,
  },
  logoWrapper: {
    alignItems: "center",
    position: "relative",
  },
  logo: {
    width: 450,
    height: 450,
  },
  subtitle: {
    fontSize: 22,
    color: "rgba(255, 255, 255, 0.95)",
    marginTop: -160,
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    gap: 16,
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "white",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#4559A7",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  termsText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 15,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 22,
  },
  linkText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxWidth: 600,
    height: SCREEN_HEIGHT * 0.85,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    flexDirection: "column",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4559A7",
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 22,
  },
});


