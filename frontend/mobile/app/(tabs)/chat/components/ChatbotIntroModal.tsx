import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, BotMessageSquare } from 'lucide-react-native';


interface ChatbotIntroModalProps {
  visible: boolean;
  onClose: () => void;
  petName: string;
  onStartChat: () => void;
}

export default function ChatbotIntroModal({
  visible,
  onClose,
  petName,
  onStartChat,
}: ChatbotIntroModalProps) {
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
            <Text style={styles.modalTitle}>Chat with Spoodle</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#4559A7" />
            </TouchableOpacity>
          </View>

          <View style={styles.introSection}>
            <View style={styles.spoodAvatar}>
              <Text style={styles.spoodInitial}>S</Text>
            </View>
            <Text style={styles.greeting}>Hi there! 👋</Text>
            <Text style={styles.description}>
              I&apos;m Spoodle, your AI assistant for {petName}. I&apos;m here to help you with questions about your pet&apos;s health, care, and any concerns you might have.
            </Text>
            <Text style={styles.description}>
              Feel free to ask me anything - from feeding schedules to behavioral questions!
            </Text>
          </View>


          <TouchableOpacity style={styles.contactButton} onPress={onStartChat}>
            <BotMessageSquare size={20} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Start Chatting</Text>
          </TouchableOpacity>
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
  introSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: 'center',
    backgroundColor: '#4559A7',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 30,
  },
  spoodAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4559A7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  spoodInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3BB272',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
