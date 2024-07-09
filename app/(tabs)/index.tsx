import React, { useCallback, useMemo, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { ThemedText } from "@/components/ThemedText";
import { CaloriesPanel } from "@/components/CaloriesPanel";
import { MacrosPanel } from "@/components/MacrosPanel";
import { HeartHealthyPanel } from "@/components/HeartHealthyPanel";
import { LowCarbPanel } from "@/components/LowCarbPanel";
import { useStore } from "../../store/store";
import { FoodItem } from "@/data/interfaces";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PANEL_COUNT = 4;

export default function HomeScreen() {
  const {
    macros,
    dailyCalorieGoal,
    todayCalories,
    loadFoodItems,
    calculateMacros,
    calculateTodayCalories,
    highestCarbFood,
    loadDailyCalorieGoal,
    refreshDiary,
  } = useStore((state) => ({
    macros: state.macros,
    dailyCalorieGoal: state.dailyCalorieGoal,
    todayCalories: state.todayCalories,
    loadFoodItems: state.loadFoodItems,
    calculateMacros: state.calculateMacros,
    calculateTodayCalories: state.calculateTodayCalories,
    highestCarbFood: state.highestCarbFood,
    loadDailyCalorieGoal: state.loadDailyCalorieGoal,
    refreshDiary: state.refreshDiary,
  }));

  const router = useRouter();
  const translateX = useSharedValue(0);
  const [activePanel, setActivePanel] = React.useState(0);

  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        console.log("Refreshing data in HomeScreen");
        await loadDailyCalorieGoal();
        await refreshDiary();
        console.log(
          "Daily calorie goal after refresh:",
          useStore.getState().dailyCalorieGoal
        );
        console.log(
          "Today's calories after refresh:",
          useStore.getState().todayCalories
        );
      };
      refreshData();
    }, [loadDailyCalorieGoal, refreshDiary])
  );

  const clampTranslateX = (value: number) => {
    "worklet";
    const minTranslate = -SCREEN_WIDTH * (PANEL_COUNT - 1);
    return Math.max(Math.min(value, 0), minTranslate);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newTranslateX = event.translationX + -activePanel * SCREEN_WIDTH;
      translateX.value = clampTranslateX(newTranslateX);
    })
    .onEnd((event) => {
      const panDistance = event.translationX;
      const panVelocity = event.velocityX;
      const threshold = SCREEN_WIDTH / 4;

      let newActivePanel = activePanel;

      if (Math.abs(panDistance) > threshold || Math.abs(panVelocity) > 500) {
        if (panDistance > 0 && activePanel > 0) {
          newActivePanel = activePanel - 1;
        } else if (panDistance < 0 && activePanel < PANEL_COUNT - 1) {
          newActivePanel = activePanel + 1;
        }
      }

      translateX.value = withSpring(
        -newActivePanel * SCREEN_WIDTH,
        {
          damping: 30,
          stiffness: 150,
          mass: 0.5,
        },
        () => {
          runOnJS(setActivePanel)(newActivePanel);
        }
      );
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Today
      </ThemedText>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.panelContainer, animatedStyle]}>
          <View style={styles.panel}>
            <CaloriesPanel />
          </View>
          <View style={styles.panel}>
            <MacrosPanel macros={macros} />
          </View>
          <View style={styles.panel}>
            <HeartHealthyPanel
              nutrients={{
                totalFat: macros.fat,
                saturatedFat: macros.saturatedFat,
                cholesterol: macros.cholesterol,
                sodium: macros.sodium,
                fiber: macros.fiber,
                sugar: macros.sugar,
              }}
            />
          </View>
          <View style={styles.panel}>
            <LowCarbPanel
              macros={{ carbs: macros.carbs, fiber: macros.fiber }}
              highestCarbFood={highestCarbFood}
            />
          </View>
        </Animated.View>
      </GestureDetector>

      <View style={styles.panelDots}>
        {[...Array(PANEL_COUNT)].map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dot, index === activePanel && styles.activeDot]}
            onPress={() => {
              setActivePanel(index);
              translateX.value = withSpring(-index * SCREEN_WIDTH, {
                damping: 30,
                stiffness: 150,
                mass: 0.5,
              });
            }}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push("/search")}
      >
        <Ionicons name="search-outline" size={24} color="#777" />
        <ThemedText style={styles.searchText}>Search for a food</ThemedText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#242423",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    marginLeft: 20,
    color: "#ffffff",
  },
  panelContainer: {
    flexDirection: "row",
    width: SCREEN_WIDTH * PANEL_COUNT,
  },
  panel: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
  },
  panelDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#555",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D2F34",
    borderRadius: 25,
    padding: 10,
    margin: 10,
  },
  searchText: {
    color: "#777",
    marginLeft: 10,
  },
});
