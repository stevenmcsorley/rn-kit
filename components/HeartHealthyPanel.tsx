import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { ProgressBar } from "react-native-paper";

interface HeartHealthyPanelProps {
  nutrients: {
    totalFat: number;
    saturatedFat: number;
    cholesterol: number;
    sodium: number;
    fiber: number;
    sugar: number;
  };
}

// These are general values for visualization, not strict recommendations
const MAX_VALUES = {
  totalFat: 65, // grams
  saturatedFat: 20, // grams
  cholesterol: 300, // mg
  sodium: 2300, // mg
  fiber: 30, // grams
  sugar: 50, // grams
};

export const HeartHealthyPanel: React.FC<HeartHealthyPanelProps> = ({
  nutrients,
}) => {
  const getProgress = (value: number, max: number) => Math.min(value / max, 1);

  return (
    <View style={styles.panel}>
      <ThemedText style={styles.title}>Heart Healthy</ThemedText>
      <ThemedText style={styles.disclaimer}>
        Bars show daily intake not reccoemndations
      </ThemedText>

      <NutrientRow
        icon="fast-food"
        color="#ff3366"
        label="Total Fat"
        value={nutrients.totalFat}
        unit="g"
        progress={getProgress(nutrients.totalFat, MAX_VALUES.totalFat)}
      />

      <NutrientRow
        icon="alert-circle"
        color="#4ecdc4"
        label="Saturated Fat"
        value={nutrients.saturatedFat}
        unit="g"
        progress={getProgress(nutrients.saturatedFat, MAX_VALUES.saturatedFat)}
      />

      <NutrientRow
        icon="heart"
        color="#feca57"
        label="Cholesterol"
        value={nutrients.cholesterol}
        unit="mg"
        progress={getProgress(nutrients.cholesterol, MAX_VALUES.cholesterol)}
      />

      <NutrientRow
        icon="water"
        color="#888"
        label="Sodium"
        value={nutrients.sodium}
        unit="mg"
        progress={getProgress(nutrients.sodium, MAX_VALUES.sodium)}
      />

      <NutrientRow
        icon="leaf"
        color="#34a853"
        label="Fiber"
        value={nutrients.fiber}
        unit="g"
        progress={getProgress(nutrients.fiber, MAX_VALUES.fiber)}
      />

      <NutrientRow
        icon="ice-cream"
        color="#fb8c00"
        label="Sugar"
        value={nutrients.sugar}
        unit="g"
        progress={getProgress(nutrients.sugar, MAX_VALUES.sugar)}
      />
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
});
