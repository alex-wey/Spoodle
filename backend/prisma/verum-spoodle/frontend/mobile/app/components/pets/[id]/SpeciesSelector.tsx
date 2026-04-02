import { Dog, Cat, Heart } from "lucide-react-native";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface SpeciesSelectorProps {
  selectedSpecies: 'dog' | 'cat' | 'other';
  onSelect: (species: 'dog' | 'cat' | 'other') => void;
}

export function getSpeciesIcon(species?: string) {
  const normalizedSpecies = (species || 'other').toLowerCase() as 'dog' | 'cat' | 'other';
  switch(normalizedSpecies) {
    case 'dog':
      return <Dog size={20} color="#4F46E5" />;
    case 'cat':
      return <Cat size={20} color="#4F46E5" />;
    default:
      return <Heart size={20} color="#4F46E5" />;
  }
}

export function SpeciesSelector({ selectedSpecies, onSelect }: SpeciesSelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          selectedSpecies === 'dog' && styles.buttonActive
        ]}
        onPress={() => onSelect('dog')}
      >
        <Text style={[
          styles.buttonText,
          selectedSpecies === 'dog' && styles.buttonTextActive
        ]}>Dog</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          selectedSpecies === 'cat' && styles.buttonActive
        ]}
        onPress={() => onSelect('cat')}
      >
        <Text style={[
          styles.buttonText,
          selectedSpecies === 'cat' && styles.buttonTextActive
        ]}>Cat</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          selectedSpecies === 'other' && styles.buttonActive
        ]}
        onPress={() => onSelect('other')}
      >
        <Text style={[
          styles.buttonText,
          selectedSpecies === 'other' && styles.buttonTextActive
        ]}>Other</Text>
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

