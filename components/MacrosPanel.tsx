import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MacroCircle } from "@/components/MacroCircle";

interface MacrosPanelProps {
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    saturatedFat: number;
    cholesterol: number;
    sodium: number;
    fiber: number;
    sugar: number;
  };
}

const macroColors = {
  protein: "#ff6b6b",
  carbs: "#4ecdc4",
  fat: "#feca57",
  saturatedFat: "#ff9ff3",
  cholesterol: "#54a0ff",
  sodium: "#5f27cd",
  fiber: "#ff6b6b",
  sugar: "#ff9ff3",
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const PADDING = 20;
const MACRO_CIRCLE_WIDTH = 100; // Increased from 80 to 100 for better spacing
const COLUMNS = Math.floor((SCREEN_WIDTH - PADDING * 2) / MACRO_CIRCLE_WIDTH);

export const MacrosPanel: React.FC<MacrosPanelProps> = ({ macros }) => {
  const macroEntries = Object.entries(macros);

  return (
    <View style={styles.panel}>
      <ThemedText style={styles.title}>Macros</ThemedText>
      <View style={styles.macroGrid}>
        {macroEntries.map(([key, value]) => (
          <View key={key} style={styles.macroCircleContainer}>
            <MacroCircle
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              value={value.toFixed(1)}
              color={macroColors[key as keyof typeof macroColors]}
              unit={key === "cholesterol" || key === "sodium" ? "mg" : "g"}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // panel: {
  //   width: SCREEN_WIDTH,
  //   backgroundColor: "#2D2F34",
  //   borderRadius: 10,
  //   padding: PADDING,
  // },
  panel: {
    width: "100%",
    backgroundColor: "#2D2F34",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  macroCircleContainer: {
    width: (SCREEN_WIDTH - PADDING * 2) / COLUMNS,
    marginBottom: 20,
    alignItems: "center",
  },
});
