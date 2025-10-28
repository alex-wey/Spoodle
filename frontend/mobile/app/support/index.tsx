import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Send, AlertTriangle, Info, AlertCircle } from "lucide-react-native";
import { clerkApiClient } from "../lib/api";

export default function SupportScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [category, setCategory] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const severityOptions = [
    { value: 'low', label: 'Low', color: '#10B981', icon: Info },
    { value: 'medium', label: 'Medium', color: '#F59E0B', icon: AlertCircle },
    { value: 'high', label: 'High', color: '#EF4444', icon: AlertTriangle },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await clerkApiClient.submitBugReport({
        title: title.trim(),
        description: description.trim(),
        severity,
        category,
        deviceInfo: `Mobile App - ${Platform.OS}`,
        appVersion: '1.0.0'
      });

          if (response.success) {
            Alert.alert(
              'Bug Report Submitted! 🐾', 
              'Spoodle team will be solving the concern as soon as pawsible with paws!',
              [{ text: 'OK', onPress: () => router.back() }]
            );
        
        // Reset form
        setTitle('');
        setDescription('');
        setSeverity('medium');
        setCategory('General');
      } else {
        Alert.alert('Error', response.message || 'Failed to submit bug report. Please try again.');
      }
    } catch (error) {
      console.error('Bug report submission error:', error);
      Alert.alert('Error', 'Failed to submit bug report. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Bug Report</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Report a Bug</Text>
          <Text style={styles.sectionDescription}>
            Help us improve Spoodle by reporting any issues you encounter.
          </Text>

          {/* Title Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief description of the issue"
              value={title}
              onChangeText={setTitle}
              maxLength={200}
            />
          </View>

          {/* Severity Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Severity *</Text>
            <View style={styles.severityContainer}>
              {severityOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.severityOption,
                      severity === option.value && styles.severityOptionSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => setSeverity(option.value)}
                  >
                    <IconComponent size={16} color={option.color} />
                    <Text style={[styles.severityText, { color: option.color }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryContainer}>
              {['General', 'UI Issue', 'Performance', 'Sign-in/Auth', 'Data Sync', 'Other'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonSelected
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    category === cat && styles.categoryButtonTextSelected
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Please describe the issue in detail. Include steps to reproduce if possible."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              maxLength={2000}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Send size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#1F2937",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  severityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  severityOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  severityOptionSelected: {
    backgroundColor: "#F3F4F6",
  },
  severityText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  categoryButtonSelected: {
    backgroundColor: "#3BB272",
    borderColor: "#3BB272",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  categoryButtonTextSelected: {
    color: "#FFFFFF",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4559A7",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
