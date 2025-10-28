import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Plus, Trash2 } from "lucide-react-native";

interface EditableListProps {
  items: string[];
  newItem: string;
  onNewItemChange: (text: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  placeholder: string;
  emptyMessage: string;
  tagStyle?: 'allergy' | 'diet';
}

export function EditableList({ 
  items, 
  newItem, 
  onNewItemChange, 
  onAddItem, 
  onRemoveItem,
  placeholder,
  emptyMessage,
  tagStyle = 'allergy'
}: EditableListProps) {
  return (
    <View style={styles.container}>
      {/* Add new item */}
      <View style={styles.addItemContainer}>
        <TextInput
          style={styles.addItemInput}
          value={newItem}
          onChangeText={onNewItemChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddItem}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* List of items */}
      {items.map((item, index) => (
        <View key={index} style={styles.editableItem}>
          <Text style={styles.editableItemText}>{item}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemoveItem(index)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

interface TagListProps {
  items: string[];
  tagStyle: 'allergy' | 'diet';
  emptyMessage: string;
}

export function TagList({ items, tagStyle, emptyMessage }: TagListProps) {
  if (!items || items.length === 0) {
    return <Text style={styles.noItemsText}>{emptyMessage}</Text>;
  }

  return (
    <View style={styles.tagContainer}>
      {items.map((item, index) => (
        <View 
          key={index} 
          style={[
            styles.tag, 
            tagStyle === 'allergy' ? styles.allergyTag : styles.dietTag
          ]}
        >
          <Text style={tagStyle === 'allergy' ? styles.allergyTagText : styles.dietTagText}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  addItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    color: "#1F2937",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
  },
  addButton: {
    backgroundColor: "#10B981",
    borderRadius: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editableItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  editableItemText: {
    flex: 1,
    fontSize: 17,
    color: "#1F2937",
  },
  removeButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#FEF2F2",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  allergyTag: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  allergyTagText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "700",
  },
  dietTag: {
    backgroundColor: "#D1FAE5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  dietTagText: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "700",
  },
  noItemsText: {
    fontSize: 17,
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
  },
});

