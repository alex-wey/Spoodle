import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { MessageCircle, Dog } from "lucide-react-native";
import { usePetStore } from "../../store/pets";
import PetSelectionModal from "../../components/PetSelectionModal";
import ChatInterfaceModal from "../../components/ChatInterfaceModal";

export default function ChatScreen() {
  const { pets } = usePetStore();
  const [petSelectionVisible, setPetSelectionVisible] = useState(false);
  const [chatInterfaceVisible, setChatInterfaceVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);

  const handleStartChat = () => {
    if (pets.length === 0) {
      // Show message to add a pet first
      return;
    }
    setPetSelectionVisible(true);
  };

  const handlePetSelect = (pet: any) => {
    setSelectedPet(pet);
    setPetSelectionVisible(false);
    // Skip intro modal and go directly to chat interface
    setChatInterfaceVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Spoodle Chatbot</Text>
          <Text style={styles.subtitle}>Your AI pet care assistant</Text>
        </View>
        
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <MessageCircle size={64} color="#4559A7" />
          </View>
          <Text style={styles.heroTitle}>Chat with Spoodle</Text>
          <Text style={styles.heroDescription}>
            Get instant answers about your pet's health, nutrition, behavior, and more from our AI assistant.
          </Text>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartChat}
          >
            <MessageCircle size={20} color="white" />
            <Text style={styles.startButtonText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>

        {pets.length === 0 && (
          <View style={styles.noPetsCard}>
            <Dog size={32} color="#E75325" />
            <Text style={styles.noPetsTitle}>No pets added yet</Text>
            <Text style={styles.noPetsDescription}>
              Add a pet to start chatting with Spoodle about their care
            </Text>
          </View>
        )}

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What can Spoodle help with?</Text>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🏥</Text>
            <Text style={styles.featureTitle}>Health Questions</Text>
            <Text style={styles.featureDescription}>
              Ask about symptoms, medications, and general health concerns
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🍖</Text>
            <Text style={styles.featureTitle}>Nutrition Advice</Text>
            <Text style={styles.featureDescription}>
              Get recommendations on diet, treats, and feeding schedules
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🎾</Text>
            <Text style={styles.featureTitle}>Behavior Tips</Text>
            <Text style={styles.featureDescription}>
              Learn about training, socialization, and behavioral issues
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>📅</Text>
            <Text style={styles.featureTitle}>Care Reminders</Text>
            <Text style={styles.featureDescription}>
              Stay on top of vet visits, vaccinations, and grooming
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <PetSelectionModal
        visible={petSelectionVisible}
        onClose={() => setPetSelectionVisible(false)}
        onSelectPet={handlePetSelect}
        pets={pets}
      />

      <ChatInterfaceModal
        visible={chatInterfaceVisible}
        onClose={() => setChatInterfaceVisible(false)}
        petName={selectedPet?.name || ""}
        petId={selectedPet?.id || ""}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4559A7",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4559A7",
    opacity: 0.7,
  },
  heroSection: {
    backgroundColor: "#DCEBF5",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4559A7",
    marginBottom: 12,
    textAlign: "center",
  },
  heroDescription: {
    fontSize: 16,
    color: "#4559A7",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3BB272",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  noPetsCard: {
    backgroundColor: "#FFF5F5",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FED7D7",
  },
  noPetsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E75325",
    marginTop: 12,
    marginBottom: 8,
  },
  noPetsDescription: {
    fontSize: 14,
    color: "#4559A7",
    textAlign: "center",
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4559A7",
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ADD7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4559A7",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#4559A7",
    opacity: 0.7,
    lineHeight: 20,
  },
});

