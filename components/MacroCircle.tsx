import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface MacroCircleProps {
  label: string;
  value: string;
  color: string;
}

export const MacroCircle: React.FC<MacroCircleProps> = ({
  label,
  value,
  color,
}) => (
  <View style={styles.macroCircle}>
    <View style={[styles.circle, { borderColor: color }]}>
      <ThemedText style={styles.macroValue}>{value}g</ThemedText>
    </View>
    <ThemedText style={styles.macroLabel}>{label}</ThemedText>
  </View>
);

const styles = StyleSheet.create({
  macroCircle: {
    alignItems: "center",
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  macroLabel: {
    fontSize: 14,
    color: "#ffffff",
  },
});
