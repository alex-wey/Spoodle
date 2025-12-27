import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { getSafeImageSource } from '../../../lib/imageUtils';

interface Pet {
  id: string;
  name: string;
  imageUrl?: string | null;
  biologicalSex?: string | null;
}

interface PetSelectorProps {
  pets: Pet[];
  selectedPet: string | null;
  onSelectPet: (pet: Pet) => void;
}

export function PetSelector({ pets, selectedPet, onSelectPet }: PetSelectorProps) {
  if (pets.length === 0) return null;

  return (
    <View style={styles.petSelector}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.petSelectorContent}
      >
        {pets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            style={[
              styles.petChip,
              selectedPet === pet.id && styles.petChipSelected,
            ]}
            onPress={() => onSelectPet(pet)}
          >
            <Image
              source={getSafeImageSource(pet.imageUrl ?? undefined, pet.name, pet.biologicalSex ?? undefined)}
              style={[
                styles.petAvatar,
                selectedPet === pet.id && styles.petAvatarSelected,
              ]}
            />
            <Text
              style={[styles.petName, selectedPet === pet.id && styles.petNameSelected]}
              numberOfLines={1}
            >
              {pet.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  petSelector: {
    backgroundColor: '#4559A7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  petSelectorContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  petChip: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  petChipSelected: {},
  petAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E3A8A',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petAvatarSelected: {
    borderColor: '#FFFFFF',
  },
  petName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    maxWidth: 60,
  },
  petNameSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

