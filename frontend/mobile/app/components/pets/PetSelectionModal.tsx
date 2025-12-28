import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Heart } from 'lucide-react-native';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
}

interface PetSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  pets: Pet[];
  onSelectPet: (pet: Pet) => void;
}

export default function PetSelectionModal({
  visible,
  onClose,
  pets,
  onSelectPet,
}: PetSelectionModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select a Pet</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#4559A7" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.petsList} showsVerticalScrollIndicator={false}>
            {pets.length === 0 ? (
              <View style={styles.emptyState}>
                <Heart size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>No pets found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Add a pet to get started with Spoodle
                </Text>
              </View>
            ) : (
              pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.petButton}
                  onPress={() => onSelectPet(pet)}
                >
                  <View style={styles.petInfo}>
                    <View style={styles.petAvatar}>
                      <Text style={styles.petInitial}>
                        {pet.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.petDetails}>
                      <Text style={styles.petName}>{pet.name}</Text>
                      <Text style={styles.petRole}>
                        {pet.species} • {pet.breed || 'Mixed Breed'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DCEBF5',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#DCEBF5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4559A7',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4559A7',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  petButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  petInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  petRole: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
