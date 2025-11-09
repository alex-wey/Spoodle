import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send } from 'lucide-react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useChatStore, Message } from '../../../store/chat';
import { getApiBaseUrl } from '../../../lib/api';

// Get API base URL from environment
const API_BASE_URL = getApiBaseUrl();

interface ChatInterfaceModalProps {
  visible: boolean;
  onClose: () => void;
  petName: string;
  petId: string;
}

export default function ChatInterfaceModal({
  visible,
  onClose,
  petName,
  petId,
}: ChatInterfaceModalProps) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const { 
    chatSessions, 
    initializeChatSession,  
    addMessage, 
    setCurrentPet,
    loadChatSessions,
    setCurrentUser
  } = useChatStore();
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get current chat session
  const currentSession = chatSessions[petId];
  const messages = currentSession?.messages || [];

  useEffect(() => {
    // Set user namespace and then load chat sessions
    setCurrentUser(user?.id ?? null);
    loadChatSessions();
  }, [user?.id, setCurrentUser, loadChatSessions]);

  useEffect(() => {
    if (visible && petId) {
      // Initialize chat session for this pet when modal opens
      initializeChatSession(petId, petName);
      setCurrentPet(petId);
    }
  }, [visible, petId, petName, initializeChatSession, setCurrentPet]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleSendMessage = async () => {
    if (inputText.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isUser: true,
        timestamp: new Date(),
      };
      
      // Add user message to chat session
      addMessage(petId, userMessage);
      setInputText('');
      setIsLoading(true);
      
      try {
        const token = await getToken();
        // Send message to chatbot API
        const response = await fetch(`${API_BASE_URL}/api/chatbot/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: userMessage.text,
            petId: petId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: data.data.response,
            isUser: false,
            timestamp: new Date(),
          };
          // Add AI response to chat session
          addMessage(petId, aiResponse);
        } else {
          throw new Error(data.message || 'Failed to get response from chatbot');
        }
      } catch (error) {
        console.error('Chatbot error:', error);
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
          isUser: false,
          timestamp: new Date(),
        };
        // Add error response to chat session
        addMessage(petId, errorResponse);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chat with Spoodle - {petName}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#4559A7" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={[
              styles.messagesContent,
              { paddingBottom: keyboardHeight + 80 + insets.bottom }
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userMessage : styles.aiMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.isUser ? styles.userMessageText : styles.aiMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                  <Text
                    style={[
                      styles.timeText,
                      message.isUser ? styles.userTimeText : styles.aiTimeText,
                    ]}
                  >
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View 
            style={[
              styles.inputContainer,
              { 
                bottom: keyboardHeight > 0 ? keyboardHeight : insets.bottom,
                paddingBottom: keyboardHeight > 0 ? 8 : 12,
              }
            ]}
          >
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about your pet..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
              onPress={handleSendMessage}
              disabled={isLoading}
            >
              <Send size={20} color={isLoading ? "#9CA3AF" : "#FFFFFF"} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ADD7EB',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#ADD7EB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4559A7',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messagesContent: {
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#4559A7',
  },
  aiMessage: {
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#1F2937',
  },
  timeText: {
    fontSize: 12,
  },
  userTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiTimeText: {
    color: '#6B7280',
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#ADD7EB',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    color: '#1F2937',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3BB272',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
