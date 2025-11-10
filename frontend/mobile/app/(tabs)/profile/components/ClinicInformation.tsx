import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Mail, Phone, MapPin, Hospital } from 'lucide-react-native';

interface Clinic {
  id: string;
  clerkOrgId: string;
  name: string;
  slug: string;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  imageUrl?: string | null;
}

interface ClinicInformationProps {
  clinic: Clinic;
  clinicImageError: boolean;
  onImageError: () => void;
}

export function ClinicInformation({
  clinic,
  clinicImageError,
  onImageError,
}: ClinicInformationProps) {
  return (
    <View style={styles.contactCard}>
      <Text style={styles.contactTitle}>{clinic.name}</Text>
      
      {clinic.email ? (
        <View style={styles.contactItem}>
          <View style={styles.contactIconContainer}>
            <Mail size={20} color="#4559A7" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactValue}>{clinic.email}</Text>
            <Text style={styles.contactLabel}>Email Address</Text>
          </View>
        </View>
      ) : (
        <View style={styles.contactItem}>
          <View style={styles.contactIconContainer}>
            <Mail size={20} color="#4559A7" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactValuePlaceholder}>No email address added</Text>
            <Text style={styles.contactLabel}>Email Address</Text>
          </View>
        </View>
      )}

      {clinic.phoneNumber ? (
        <View style={styles.contactItem}>
          <View style={styles.contactIconContainer}>
            <Phone size={20} color="#4559A7" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactValue}>{clinic.phoneNumber}</Text>
            <Text style={styles.contactLabel}>Phone Number</Text>
          </View>
        </View>
      ) : (
        <View style={styles.contactItem}>
          <View style={styles.contactIconContainer}>
            <Phone size={20} color="#4559A7" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactValuePlaceholder}>No phone number added</Text>
            <Text style={styles.contactLabel}>Phone Number</Text>
          </View>
        </View>
      )}

      {clinic.address ? (
        <View style={[styles.contactItem, { marginBottom: 0, alignItems: 'flex-start' }]}>
          <View style={[styles.contactIconContainer, { marginTop: 4 }]}>
            <MapPin size={20} color="#4559A7" />
          </View>
          <View style={styles.contactDetails}>
            {(() => {
              const parts = clinic.address.split(',').map(p => p.trim());
              const street = parts[0] || '';
              const city = parts[1] || '';
              const state = parts[2] || '';
              const zip = parts[3] || '';
              
              return (
                <>
                  <Text style={styles.contactValue}>{street}</Text>
                  <Text style={styles.contactValue}>{city}, {state} {zip}</Text>
                </>
              );
            })()}
            <Text style={styles.contactLabel}>Address</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.contactItem, { marginBottom: 0 }]}>
          <View style={styles.contactIconContainer}>
            <MapPin size={20} color="#4559A7" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactValuePlaceholder}>No address added</Text>
            <Text style={styles.contactLabel}>Address</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contactCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ADD7EB',
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4559A7',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ADD7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactValue: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4559A7',
    marginBottom: 4,
  },
  contactValuePlaceholder: {
    fontSize: 18,
    color: '#4559A7',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 16,
    color: '#4559A7',
    opacity: 0.7,
  },
  clinicIconImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
});

