import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { MessageCircle, Dog, Clock, Bug, Heart, Apple, Activity, Bell } from "lucide-react-native";
import { useRouter } from "expo-router";
import { usePetStore } from "../../store/pets";
import { useChatStore } from "../../store/chat";
import PetSelectionModal from "../../components/PetSelectionModal";
import ChatInterfaceModal from "../../components/ChatInterfaceModal";
import { FAB } from "../../components/FAB";

export default function ChatScreen() {
  const router = useRouter();
  const { pets } = usePetStore();
  const { chatSessions, loadChatSessions } = useChatStore();
  const [petSelectionVisible, setPetSelectionVisible] = useState(false);
  const [chatInterfaceVisible, setChatInterfaceVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);

  useEffect(() => {
    // Load chat sessions when component mounts
    loadChatSessions();
  }, []);

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

  const handleResumeChat = (pet: any) => {
    setSelectedPet(pet);
    setChatInterfaceVisible(true);
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
            <Dog size={40} color="#E75325" />
            <Text style={styles.noPetsTitle}>No pets added yet</Text>
            <Text style={styles.noPetsDescription}>
              Add a pet to start chatting with Spoodle about their care
            </Text>
          </View>
        )}

        {/* Active Chat Sessions */}
        {Object.keys(chatSessions).length > 0 && (
          <View style={styles.activeChatsSection}>
            <Text style={styles.activeChatsTitle}>Continue Previous Chats</Text>
            {Object.values(chatSessions).map((session) => (
              <TouchableOpacity
                key={session.petId}
                style={styles.chatSessionCard}
                onPress={() => handleResumeChat({ id: session.petId, name: session.petName })}
              >
                <View style={styles.chatSessionInfo}>
                  <View style={styles.chatSessionHeader}>
                    <Dog size={24} color="#4559A7" />
                    <Text style={styles.chatSessionPetName}>{session.petName}</Text>
                  </View>
                  <View style={styles.chatSessionMeta}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.chatSessionTime}>
                      {formatLastActivity(session.lastActivity)}
                    </Text>
                    <Text style={styles.chatSessionCount}>
                      {session.messages.length} messages
                    </Text>
                  </View>
                </View>
                <MessageCircle size={24} color="#4559A7" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What can Spoodle help with?</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Heart size={24} color="#4559A7" />
              <Text style={styles.featureTitle}>Health Questions</Text>
            </View>
            <Text style={styles.featureDescription}>
              Ask about symptoms, medications, and general health concerns
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Apple size={24} color="#4559A7" />
              <Text style={styles.featureTitle}>Nutrition Advice</Text>
            </View>
            <Text style={styles.featureDescription}>
              Get recommendations on diet, treats, and feeding schedules
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Activity size={24} color="#4559A7" />
              <Text style={styles.featureTitle}>Behavior Tips</Text>
            </View>
            <Text style={styles.featureDescription}>
              Learn about training, socialization, and behavioral issues
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Bell size={24} color="#4559A7" />
              <Text style={styles.featureTitle}>Care Reminders</Text>
            </View>
            <Text style={styles.featureDescription}>
              Stay on top of vet visits, vaccinations, and grooming
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bug Report FAB */}
      <FAB
        icon={<Bug size={20} color="white" />}
        onPress={() => router.push("/support")}
        style={styles.fab}
        size="small"
      />

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
    padding: 24,
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
    fontSize: 18,
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
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#FED7D7",
  },
  noPetsTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#E75325",
    marginTop: 16,
    marginBottom: 12,
  },
  noPetsDescription: {
    fontSize: 16,
    color: "#4559A7",
    textAlign: "center",
  },
  activeChatsSection: {
    marginBottom: 5,
  },
  activeChatsTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4559A7",
    marginBottom: 20,
  },
  chatSessionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ADD7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatSessionInfo: {
    flex: 1,
  },
  chatSessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  chatSessionPetName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4559A7",
    marginLeft: 10,
  },
  chatSessionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chatSessionTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  chatSessionCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  featuresSection: {
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4559A7",
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ADD7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4559A7",
    marginLeft: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: "#4559A7",
    opacity: 0.7,
    lineHeight: 24,
  },
  fab: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#DC2626",
  },
});

