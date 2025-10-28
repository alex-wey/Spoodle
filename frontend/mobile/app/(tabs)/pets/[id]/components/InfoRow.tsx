import { View, Text, StyleSheet } from "react-native";
import { ReactNode } from "react";

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: string | ReactNode;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        {typeof value === 'string' ? (
          <Text style={styles.infoValue}>{value}</Text>
        ) : (
          value
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ADD7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DCEBF5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4559A7",
  },
});

