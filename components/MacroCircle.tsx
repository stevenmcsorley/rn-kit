import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface MacroCircleProps {
  label: string;
  value: string;
  color: string;
  unit: string;
}

export const MacroCircle: React.FC<MacroCircleProps> = ({
  label,
  value,
  color,
  unit,
}) => (
  <View style={styles.macroCircle}>
    <View style={[styles.circle, { borderColor: color }]}>
      <ThemedText style={styles.macroValue}>{value}</ThemedText>
      <ThemedText style={styles.macroUnit}>{unit}</ThemedText>
    </View>
    <ThemedText style={styles.macroLabel}>{label}</ThemedText>
  </View>
);

const styles = StyleSheet.create({
  macroCircle: {
    alignItems: "center",
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  macroUnit: {
    fontSize: 10,
    color: "#ffffff",
  },
  macroLabel: {
    fontSize: 12,
    color: "#ffffff",
    textAlign: "center",
  },
});
