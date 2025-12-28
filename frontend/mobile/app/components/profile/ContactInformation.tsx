import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Mail, Phone, MapPin, Pen, Save, X } from 'lucide-react-native';

interface ContactInformationProps {
  email: string;
  phone: string | null;
  address: string | null;
  isEditing: boolean;
  isSaving: boolean;
  editedPhone: string;
  editedAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onPhoneChange: (text: string) => void;
  onAddressChange: (field: 'street' | 'city' | 'state' | 'zip', text: string) => void;
}

export function ContactInformation({
  email,
  phone,
  address,
  isEditing,
  isSaving,
  editedPhone,
  editedAddress,
  onEdit,
  onSave,
  onCancel,
  onPhoneChange,
  onAddressChange,
}: ContactInformationProps) {
  return (
    <View style={styles.contactCard}>
      <View style={styles.contactTitleRow}>
        <Text style={styles.contactTitle}>Contact Information</Text>
        {isEditing ? (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Save size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={onEdit}>
            <Pen size={18} color="#4559A7" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.contactItem}>
        <View style={styles.contactIconContainer}>
          <Mail size={20} color="#4559A7" />
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactValue}>{email}</Text>
          <Text style={styles.contactLabel}>Email Address</Text>
        </View>
      </View>

      {isEditing ? (
        <View style={styles.contactItem}>
          <View style={styles.contactIconContainer}>
            <Phone size={20} color="#4559A7" />
          </View>
          <View style={styles.contactDetails}>
            <TextInput
              style={styles.addressInput}
              value={editedPhone}
              onChangeText={onPhoneChange}
              placeholder="Phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
            <Text style={styles.contactLabel}>Phone Number</Text>
          </View>
        </View>
      ) : phone ? (
        <View style={styles.contactItem}>
          <View style={styles.contactIconContainer}>
            <Phone size={20} color="#4559A7" />
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactValue}>{phone}</Text>
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

      <View style={[styles.contactItem, { marginBottom: 0, alignItems: 'flex-start' }]}>
        <View style={[styles.contactIconContainer, { marginTop: 4 }]}>
          <MapPin size={20} color="#4559A7" />
        </View>
        <View style={styles.contactDetails}>
          {isEditing ? (
            <View style={styles.addressInputContainer}>
              <TextInput
                style={styles.addressInput}
                value={editedAddress.street}
                onChangeText={(text) => onAddressChange('street', text)}
                placeholder="Street Address"
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={styles.addressInput}
                value={editedAddress.city}
                onChangeText={(text) => onAddressChange('city', text)}
                placeholder="City"
                placeholderTextColor="#9CA3AF"
              />
              <View style={styles.addressRow}>
                <TextInput
                  style={[styles.addressInput, { flex: 1, marginRight: 8 }]}
                  value={editedAddress.state}
                  onChangeText={(text) => onAddressChange('state', text)}
                  placeholder="State"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  style={[styles.addressInput, { flex: 1 }]}
                  value={editedAddress.zip}
                  onChangeText={(text) => onAddressChange('zip', text)}
                  placeholder="Zip Code"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              </View>
            </View>
          ) : (
            address ? (
              <View>
                {(() => {
                  const parts = address.split(',').map(p => p.trim());
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
              </View>
            ) : (
              <Text style={styles.contactValuePlaceholder}>No address added</Text>
            )
          )}
          <Text style={styles.contactLabel}>Home Address</Text>
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
  addressInputContainer: {
    width: '100%',
    gap: 8,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addressInput: {
    fontSize: 16,
    color: '#4559A7',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ADD7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 50,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#3BB272',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#C62828',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

