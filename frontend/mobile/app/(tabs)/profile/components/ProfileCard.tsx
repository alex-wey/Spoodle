import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { User, Camera, Pen, Save, X } from 'lucide-react-native';
import { TextInput } from 'react-native';

interface ProfileCardProps {
  name: string;
  memberSince: string;
  avatarUri: string | null;
  isUploadingImage: boolean;
  isEditingName: boolean;
  isSavingName: boolean;
  editedFirstName: string;
  editedLastName: string;
  onPickImage: () => void;
  onEditName: () => void;
  onSaveName: () => void;
  onCancelName: () => void;
  onFirstNameChange: (text: string) => void;
  onLastNameChange: (text: string) => void;
}

export function ProfileCard({
  name,
  memberSince,
  avatarUri,
  isUploadingImage,
  isEditingName,
  isSavingName,
  editedFirstName,
  editedLastName,
  onPickImage,
  onEditName,
  onSaveName,
  onCancelName,
  onFirstNameChange,
  onLastNameChange,
}: ProfileCardProps) {
  return (
    <View style={styles.profileCard}>
      {isEditingName && (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onSaveName}
            disabled={isSavingName}
          >
            {isSavingName ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Save size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancelName}
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.profileHeader}>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={onPickImage}
          disabled={isUploadingImage}
        >
          <View style={styles.avatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <User size={40} color="#FFFFFF" />
            )}
          </View>
          <View style={styles.cameraButton}>
            {isUploadingImage ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Camera size={16} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          {isEditingName ? (
            <View style={styles.nameEditContainer}>
              <TextInput
                style={styles.nameInput}
                value={editedFirstName}
                onChangeText={onFirstNameChange}
                placeholder="First name"
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={[styles.nameInput, { marginTop: 8 }]}
                value={editedLastName}
                onChangeText={onLastNameChange}
                placeholder="Last name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          ) : (
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{name}</Text>
              <TouchableOpacity onPress={onEditName} style={styles.nameEditButton}>
                <Pen size={18} color="#4559A7" />
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.profileEmail}>Member since {memberSince}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3BB272',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4559A7',
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nameEditButton: {
    padding: 4,
  },
  nameEditContainer: {
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4559A7',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ADD7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 16,
    color: '#4559A7',
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 16,
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

