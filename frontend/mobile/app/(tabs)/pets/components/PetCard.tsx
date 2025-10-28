import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { FileText, ChevronRight } from "lucide-react-native";
import type { Pet } from "../../../types";
import { calculateAge } from "../../../lib/utils";
import { getSafeImageSource } from "../../../lib/imageUtils";

interface PetCardProps {
  pet: Pet;
  onPress: () => void;
  onPetDocuments: () => void;
}

export function PetCard({ pet, onPress, onPetDocuments }: PetCardProps) {
  const petAge = pet.dateOfBirth ? calculateAge(pet.dateOfBirth) : 0;
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <View style={styles.header}>
        <Image
          source={getSafeImageSource(pet.imageUrl, pet.name, pet.biologicalSex)}
          style={styles.image}
          onError={(error) => {
            console.log('PetCard image load error:', error);
          }}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{pet.name}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailText}>{pet.breed}</Text>
            <Text style={styles.dividerText}>|</Text>
            <Text style={styles.detailText}>
              {petAge === 1 ? "1 yr" : `${petAge} yrs`}
            </Text>
            <Text style={styles.dividerText}>|</Text>
            <Text style={styles.detailText}>
              {pet.biologicalSex ? pet.biologicalSex.charAt(0).toUpperCase() + pet.biologicalSex.slice(1) : 'Unknown'}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <ChevronRight size={24} color="rgba(255, 255, 255, 0.9)" />
        </View>
      </View>

      {/* Quick Info Pills */}
      {(pet.allergies?.length > 0 || pet.dietaryRestrictions?.length > 0) && (
        <View style={styles.quickInfo}>
          {pet.allergies && pet.allergies.length > 0 && (
            <View style={styles.infoPill}>
              <View style={[styles.infoDot, { backgroundColor: "#EF4444" }]} />
              <Text style={styles.infoPillText}>
                {pet.allergies.length} {pet.allergies.length === 1 ? "Allergy" : "Allergies"}
              </Text>
            </View>
          )}
          {pet.dietaryRestrictions && pet.dietaryRestrictions.length > 0 && (
            <View style={styles.infoPill}>
              <View style={[styles.infoDot, { backgroundColor: "#F59E0B" }]} />
              <Text style={styles.infoPillText}>
                {pet.dietaryRestrictions.length} {pet.dietaryRestrictions.length === 1 ? "Dietary Restriction" : "Dietary Restrictions"}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.actionButton}
        onPress={(e) => {
          e.stopPropagation();
          onPetDocuments();
        }}
      >
        <FileText size={22} color="#FFFFFF" />
        <Text style={styles.actionText}>Pet Documents</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#4559A7",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  infoContainer: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  dividerText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "300",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    marginVertical: 16,
    marginHorizontal: -20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  quickInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  infoDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  infoPillText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
});


