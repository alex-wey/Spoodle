import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { FileText, ChevronRight, Settings } from "lucide-react-native";
import type { Pet } from "../../../../types";
import { getPetAgeString, getGenderSymbol } from "../../../../lib/utils";
import { getSafeImageSource } from "../../../../lib/imageUtils";

interface PetCardProps {
  pet: Pet;
  onPress: () => void;
  onPetRecords: () => void;
  onEditPet: () => void;
}

export function PetCard({ pet, onPress, onPetRecords, onEditPet }: PetCardProps) {
  const genderColor = pet.gender === "female" ? "#EC4899" : "#3B82F6";
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <View style={styles.header}>
        <Image
          source={getSafeImageSource(pet.imageUrl, pet.name)}
          style={styles.image}
          onError={(error) => {
            console.log('PetCard image load error:', error);
          }}
        />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{pet.name}</Text>
            <View style={[styles.genderBadge, { backgroundColor: `${genderColor}15` }]}>
              <Text style={[styles.genderText, { color: genderColor }]}>
                {getGenderSymbol(pet.gender)}
              </Text>
            </View>
          </View>
          <Text style={styles.breed}>{pet.breed}</Text>
          <Text style={styles.age}>{getPetAgeString(pet.age)}</Text>
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
            <Settings size={18} color="#4559A7" />
          </TouchableOpacity>
          <ChevronRight size={20} color="#9CA3AF" />
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
        <FileText size={18} color="#4F46E5" />
        <Text style={styles.actionText}>Pet Records</Text>
      </TouchableOpacity>

      {/* Quick Info Pills */}
      {(pet.allergies?.length || pet.medications?.length) ? (
        <View style={styles.quickInfo}>
          {pet.allergies && pet.allergies.length > 0 && (
            <View style={styles.infoPill}>
              <View style={[styles.infoDot, { backgroundColor: "#EF4444" }]} />
              <Text style={styles.infoPillText}>
                {pet.allergies.length} {pet.allergies.length === 1 ? "Allergy" : "Allergies"}
              </Text>
            </View>
          )}
          {pet.medications && pet.medications.length > 0 && (
            <View style={styles.infoPill}>
              <View style={[styles.infoDot, { backgroundColor: "#10B981" }]} />
              <Text style={styles.infoPillText}>
                {pet.medications.length} {pet.medications.length === 1 ? "Medication" : "Medications"}
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
    backgroundColor: "white",
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
    backgroundColor: "#F3F4F6",
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
    backgroundColor: "#F3F4F6",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
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
    color: "#4B5563",
    marginTop: 2,
  },
  age: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  weight: {
    fontSize: 13,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
    marginHorizontal: -16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  actionText: {
    color: "#4F46E5",
    fontSize: 13,
    fontWeight: "600",
  },
  quickInfo: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F9FAFB",
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
    color: "#6B7280",
  },
});


