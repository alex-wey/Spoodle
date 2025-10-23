import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { FileText, ChevronRight, Settings } from "lucide-react-native";
import type { Pet } from "../../../../types";
import { getPetAgeString, getGenderSymbol, calculateAge } from "../../../../lib/utils";
import { getSafeImageSource } from "../../../../lib/imageUtils";

interface PetCardProps {
  pet: Pet;
  onPress: () => void;
  onPetRecords: () => void;
  onEditPet: () => void;
}

export function PetCard({ pet, onPress, onPetRecords, onEditPet }: PetCardProps) {
  const genderColor = pet.gender === "female" ? "#EC4899" : "#3B82F6";
  const petAge = pet.dateOfBirth ? calculateAge(pet.dateOfBirth) : 0;
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <View style={styles.header}>
        <Image
          source={getSafeImageSource(pet.imageUrl, pet.name, pet.gender)}
          style={styles.image}
          onError={(error) => {
            console.log('PetCard image load error:', error);
          }}
        />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{pet.name}</Text>
            <View style={[styles.genderBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Text style={[styles.genderText, { color: '#FFFFFF' }]}>
                {getGenderSymbol(pet.gender)}
              </Text>
            </View>
          </View>
          <Text style={styles.breed}>{pet.breed}</Text>
          <Text style={styles.age}>{getPetAgeString(petAge)}</Text>
          {pet.weight && (
            <Text style={styles.weight}>{pet.weight} lbs</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={(e) => {
              e.stopPropagation();
              onEditPet();
            }}
          >
            <Settings size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <ChevronRight size={20} color="rgba(255, 255, 255, 0.7)" />
        </View>
      </View>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.actionButton}
        onPress={(e) => {
          e.stopPropagation();
          onPetRecords();
        }}
      >
        <FileText size={20} color="#FFFFFF" />
        <Text style={styles.actionText}>Pet Records</Text>
      </TouchableOpacity>

      {/* Quick Info Pills */}
      {pet.allergies?.length ? (
        <View style={styles.quickInfo}>
          {pet.allergies && pet.allergies.length > 0 && (
            <View style={styles.infoPill}>
              <View style={[styles.infoDot, { backgroundColor: "#EF4444" }]} />
              <Text style={styles.infoPillText}>
                {pet.allergies.length} {pet.allergies.length === 1 ? "Allergy" : "Allergies"}
              </Text>
            </View>
          )}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#4559A7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  info: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  genderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  genderText: {
    fontSize: 14,
    fontWeight: "600",
  },
  breed: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  age: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  weight: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 12,
    marginHorizontal: -16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  quickInfo: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  infoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  infoPillText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
});


