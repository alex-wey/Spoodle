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
          <ArrowLeft size={28} color="#4559A7" />
        </TouchableOpacity>
        <Text style={styles.title}>Bug Report</Text>
        <View style={{ width: 28 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Report a Bug</Text>
        <Text style={styles.sectionDescription}>
          Help us improve Spoodle by reporting any issues you encounter.
        </Text>

        {/* Title Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Title of the issue"
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
                  <IconComponent size={20} color={option.color} />
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
            {['General', 'UI Issue', 'Performance', 'Authentication', 'Data Sync', 'Other'].map((cat) => (
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
          <Send size={22} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ADD7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4559A7",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4559A7",
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 18,
    color: "#4559A7",
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 26,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
    color: "#4559A7",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ADD7EB",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    backgroundColor: "#FFFFFF",
    color: "#4559A7",
  },
  textArea: {
    height: 140,
    textAlignVertical: "top",
  },
  severityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  severityOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
  },
  severityOptionSelected: {
    backgroundColor: "#DCEBF5",
  },
  severityText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#ADD7EB",
    backgroundColor: "#FFFFFF",
  },
  categoryButtonSelected: {
    backgroundColor: "#3BB272",
    borderColor: "#3BB272",
  },
  categoryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4559A7",
  },
  categoryButtonTextSelected: {
    color: "#FFFFFF",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#3BB272",
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: "#ADD7EB",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});
