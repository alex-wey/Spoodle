import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { ReactNode } from "react";

interface FABProps {
  icon: ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  size?: "small" | "normal" | "large";
  disabled?: boolean;
}

export function FAB({ icon, onPress, style, size = "normal", disabled = false }: FABProps) {
  const sizeStyles = {
    small: styles.small,
    normal: styles.normal,
    large: styles.large,
  };

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        sizeStyles[size],
        style,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 12,
  },
  small: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  normal: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  large: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  disabled: {
    opacity: 0.5,
  },
});


