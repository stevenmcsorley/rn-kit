import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";

interface MacroIconProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit: string;
  color: string;
}

export const MacroIcon: React.FC<MacroIconProps> = ({
  icon,
  label,
  value,
  unit,
  color,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={24} color={color} />
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.value}>
        {value} <ThemedText style={styles.unit}>{unit}</ThemedText>
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
    color: "#ffffff",
    marginTop: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 2,
  },
  unit: {
    fontSize: 12,
    fontWeight: "normal",
  },
});
