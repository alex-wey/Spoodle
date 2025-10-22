import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { X, MessageCircle, Phone, Mail } from 'lucide-react-native';

interface Pet {
  id: string;
  name: string;
  species: string;
}

interface ChatbotIntroModalProps {
  visible: boolean;
  onClose: () => void;
  pet: Pet;
  onStartChat: () => void;
}

export default function ChatbotIntroModal({
  visible,
  onClose,
  pet,
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
              I'm Spoodle, your AI assistant for {pet.name}. I'm here to help you with questions about your pet's health, care, and any concerns you might have.
            </Text>
            <Text style={styles.description}>
              Feel free to ask me anything - from feeding schedules to behavioral questions!
            </Text>
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Need more help?</Text>
            <View style={styles.contactOptions}>
              <TouchableOpacity style={styles.contactOption}>
                <Phone size={20} color="#4559A7" />
                <Text style={styles.contactOptionText}>Call Vet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactOption}>
                <Mail size={20} color="#4559A7" />
                <Text style={styles.contactOptionText}>Email Support</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.contactButton} onPress={onStartChat}>
            <MessageCircle size={20} color="#FFFFFF" />
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
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: '#4559A7',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 40,
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
  contactSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactOptionText: {
    fontSize: 14,
    color: '#4559A7',
    marginLeft: 8,
    fontWeight: '500',
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
