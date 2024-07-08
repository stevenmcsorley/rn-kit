import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ProgressBar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

interface LowCarbPanelProps {
  macros: {
    carbs: number;
    fiber: number;
  };
  highestCarbFood: {
    name: string;
    carbs: number;
  } | null;
}

const MAX_CARBS = 100; // grams, for visualization purposes

export const LowCarbPanel: React.FC<LowCarbPanelProps> = ({
  macros,
  highestCarbFood,
}) => {
  const netCarbs = Math.max(0, macros.carbs - macros.fiber);
  const getProgress = (value: number) => Math.min(value / MAX_CARBS, 1);

  return (
    <View style={styles.panel}>
      <ThemedText style={styles.title}>Low Carb</ThemedText>
      <ThemedText style={styles.disclaimer}>
        Bars show daily intake not reccoemndations
      </ThemedText>

      <NutrientRow
        icon="nutrition"
        color="#ff3366"
        label="Total Carbs"
        value={macros.carbs}
        unit="g"
        progress={getProgress(macros.carbs)}
      />

      <NutrientRow
        icon="leaf"
        color="#4ecdc4"
        label="Fiber"
        value={macros.fiber}
        unit="g"
        progress={getProgress(macros.fiber)}
      />

      <NutrientRow
        icon="calculator"
        color="#feca57"
        label="Net Carbs"
        value={netCarbs}
        unit="g"
        progress={getProgress(netCarbs)}
      />

      {highestCarbFood && (
        <View style={styles.highestCarbContainer}>
          <ThemedText style={styles.highestCarbTitle}>
            Highest Carb Food Today:
          </ThemedText>
          <ThemedText style={styles.highestCarbInfo}>
            {highestCarbFood.name} ({highestCarbFood.carbs.toFixed(1)}g carbs)
          </ThemedText>
        </View>
      )}
    </View>
  );
};

interface NutrientRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  value: number;
  unit: string;
  progress: number;
}

const NutrientRow: React.FC<NutrientRowProps> = ({
  icon,
  color,
  label,
  value,
  unit,
  progress,
}) => (
  <View style={styles.rowContainer}>
    <View style={styles.textContainer}>
      <View style={styles.labelContainer}>
        <Ionicons name={icon} size={24} color={color} style={styles.icon} />
        <ThemedText style={styles.label}>{label}</ThemedText>
      </View>
      <ThemedText style={styles.value}>
        {value.toFixed(1)} {unit}
      </ThemedText>
    </View>
    <ProgressBar progress={progress} color={color} style={styles.progressBar} />
  </View>
);

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    backgroundColor: "#2D2F34",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: 14,
    color: "#aaaaaa",
    marginBottom: 20,
    fontStyle: "italic",
  },
  rowContainer: {
    marginBottom: 16,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    color: "#ffffff",
  },
  value: {
    fontSize: 14,
    color: "#ffffff",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  highestCarbContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  highestCarbTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  highestCarbInfo: {
    fontSize: 14,
    color: "#ffffff",
  },
});
