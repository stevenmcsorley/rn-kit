import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { Pedometer } from "expo-sensors";

import { ThemedText } from "@/components/ThemedText";
import { MacroCircle } from "@/components/MacroCircle";
import { useHome } from "../contexts/HomeContext";

export default function HomeScreen() {
  const { scannedItems, macros, loadScannedItems, calculateMacros } = useHome();
  const [isPedometerAvailable, setIsPedometerAvailable] = useState("checking");
  const [todayStepCount, setTodayStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const router = useRouter();

  const subscribe = async () => {
    if (Platform.OS !== "ios") {
      return null;
    }
    const isAvailable = await Pedometer.isAvailableAsync();
    setIsPedometerAvailable(String(isAvailable));

    if (isAvailable) {
      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const todayStepCountResult = await Pedometer.getStepCountAsync(
        start,
        end
      );
      if (todayStepCountResult) {
        setTodayStepCount(todayStepCountResult.steps);
      }

      return Pedometer.watchStepCount((result) => {
        setCurrentStepCount(result.steps);
      });
    }
    return null;
  };

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const initializeSubscription = async () => {
      subscription = await subscribe();
    };

    if (Platform.OS === "ios") {
      initializeSubscription();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadScannedItems();
      calculateMacros();
    }, [loadScannedItems, calculateMacros])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Dashboard
        </ThemedText>

        <View style={styles.macrosContainer}>
          <ThemedText type="subtitle" style={styles.macrosTitle}>
            Macros
          </ThemedText>
          <View style={styles.macroCircles}>
            <MacroCircle
              label="Protein"
              value={macros.protein.toFixed(1)}
              color="#ff6b6b"
            />
            <MacroCircle
              label="Carbs"
              value={macros.carbs.toFixed(1)}
              color="#4ecdc4"
            />
            <MacroCircle
              label="Fat"
              value={macros.fat.toFixed(1)}
              color="#feca57"
            />
          </View>
        </View>
        {Platform.OS === "ios" && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Steps Today</ThemedText>
              <ThemedText style={styles.statValue}>{todayStepCount}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statLabel}>Current Session</ThemedText>
              <ThemedText style={styles.statValue}>
                {currentStepCount}
              </ThemedText>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push("/scanner")}
        >
          <Ionicons name="barcode-outline" size={24} color="white" />
          <ThemedText style={styles.scanButtonText}>Scan Barcode</ThemedText>
        </TouchableOpacity>

        <ThemedText type="subtitle" style={styles.recentScans}>
          Recent Scans
        </ThemedText>
        {scannedItems.map((item, index) => (
          <View key={index} style={styles.scannedItem}>
            <ThemedText style={styles.itemName}>{item.name}</ThemedText>
            <ThemedText style={styles.itemCalories}>
              {Math.round(item.calories)} kcal
            </ThemedText>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#242423",
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#ffffff",
  },
  macrosContainer: {
    marginVertical: 20,
  },
  macrosTitle: {
    marginBottom: 10,
    color: "#ffffff",
  },
  macroCircles: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "#494c4d",
    padding: 15,
    borderRadius: 10,
    width: "48%",
  },
  statLabel: {
    color: "#ffffff",
    fontSize: 14,
  },
  statValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
    backgroundColor: "#ff3366",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 15,
  },
  scanButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  recentScans: {
    marginTop: 20,
    marginBottom: 10,
    color: "#ffffff",
  },
  scannedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#2D2F34",
    borderRadius: 10,
    marginTop: 10,
    borderColor: "#ff3366",
    borderWidth: 1,
    shadowColor: "#ff3366",
    shadowOffset: { width: 5, height: 4 },
  },
  itemName: {
    color: "#ffffff",
    fontSize: 16,
  },
  itemCalories: {
    color: "#ffffff",
    fontSize: 14,
  },
});
