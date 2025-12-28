import { Mars, Venus, Heart } from "lucide-react-native";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface BiologicalSexSelectorProps {
  selectedSex: 'male' | 'female';
  onSelect: (sex: 'male' | 'female') => void;
}

export function getBiologicalSexIcon(sex?: string) {
  const normalizedSex = (sex || 'male').toLowerCase();
  if (normalizedSex === 'male') {
    return <Mars size={20} color="#4F46E5" />;
  } else if (normalizedSex === 'female') {
    return <Venus size={20} color="#4F46E5" />;
  }
  return <Heart size={20} color="#4F46E5" />;
}

export function BiologicalSexSelector({ selectedSex, onSelect }: BiologicalSexSelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          selectedSex === 'male' && styles.buttonActive
        ]}
        onPress={() => onSelect('male')}
      >
        <Text style={[
          styles.buttonText,
          selectedSex === 'male' && styles.buttonTextActive
        ]}>Male</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          selectedSex === 'female' && styles.buttonActive
        ]}
        onPress={() => onSelect('female')}
      >
        <Text style={[
          styles.buttonText,
          selectedSex === 'female' && styles.buttonTextActive
        ]}>Female</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  buttonActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#4F46E5",
  },
  buttonText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  buttonTextActive: {
    color: "#4F46E5",
    fontWeight: "700",
  },
});

