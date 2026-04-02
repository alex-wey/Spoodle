import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mail, ArrowLeftRight } from 'lucide-react-native';

interface SpoodleInformationProps {
  showClinicSwitcher?: boolean;
  onClinicChange?: () => void;
}

export function SpoodleInformation({ showClinicSwitcher = false, onClinicChange }: SpoodleInformationProps) {
  return (
    <View style={styles.contactCard}>
      <View style={styles.contactTitleRow}>
        <Text style={styles.contactTitle}>Spoodle Information</Text>
        {showClinicSwitcher && onClinicChange && (
          <TouchableOpacity onPress={onClinicChange}>
            <ArrowLeftRight size={18} color="#4559A7" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={[styles.contactItem, { marginBottom: 0 }]}>
        <View style={styles.contactIconContainer}>
          <Mail size={20} color="#4559A7" />
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactValue}>support@spoodle.com</Text>
          <Text style={styles.contactLabel}>Email Address</Text>
        </View>
      </View>
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
  },
  contactTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  contactLabel: {
    fontSize: 16,
    color: '#4559A7',
    opacity: 0.7,
  },
});

