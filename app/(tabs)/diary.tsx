// screens/DiaryScreen.tsx

import React, { useCallback, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { ThemedText } from "../../components/ThemedText";
import { useStore } from "../../store/store";
import { FoodItem } from "../../data/interfaces";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function DiaryScreen() {
  const foodItems = useStore((state) => state.foodItems);
  const loadFoodItems = useStore((state) => state.loadFoodItems);
  const deleteFoodItem = useStore((state) => state.deleteFoodItem);
  const calculateMacros = useStore((state) => state.calculateMacros);
  const router = useRouter();
  const { newRefreshKey } = useLocalSearchParams();

  useEffect(() => {
    loadFoodItems();
  }, [newRefreshKey]);

  useFocusEffect(
    useCallback(() => {
      calculateMacros();
    }, [calculateMacros, foodItems])
  );

  const handleItemPress = useCallback(
    (barcode: string) => {
      router.push({
        pathname: "/food-info",
        params: { barcode, fromDiary: "true", refreshKey: newRefreshKey },
      });
    },
    [router, newRefreshKey]
  );

  const handleDeleteItem = useCallback(
    (item: FoodItem) => {
      Alert.alert(
        "Delete Item",
        `Are you sure you want to delete ${item.name}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: async () => {
              if (item.id !== undefined) {
                await deleteFoodItem(item.id);
                loadFoodItems();
              }
            },
            style: "destructive",
          },
        ]
      );
    },
    [deleteFoodItem, loadFoodItems]
  );

  const totalCalories = useMemo(() => {
    const today = new Date().toDateString();
    return foodItems
      .filter((item) => new Date(item.date).toDateString() === today)
      .reduce((sum, item) => sum + (item.calories || 0), 0);
  }, [foodItems]);

  const formatMacro = useCallback((value: number | null): string => {
    return value !== null ? value.toFixed(1) : "N/A";
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Food Diary
        </ThemedText>
        <ThemedText style={styles.totalCalories}>
          Today's Total: {totalCalories.toFixed(0)} kcal
        </ThemedText>
        {Object.entries(
          foodItems.reduce((acc, item) => {
            const date = new Date(item.date).toDateString();
            if (!acc[date]) acc[date] = [];
            acc[date].push(item);
            return acc;
          }, {} as { [date: string]: FoodItem[] })
        ).map(([date, items]) => (
          <View key={date} style={styles.dateContainer}>
            <ThemedText style={styles.dateHeader}>{date}</ThemedText>
            {items.map((item) => (
              <View key={item.id} style={styles.diaryItemContainer}>
                <View style={styles.diaryItem}>
                  <TouchableOpacity
                    style={styles.diaryItemText}
                    onPress={() => handleItemPress(item.barcode)}
                  >
                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                    <ThemedText style={styles.itemDetails}>
                      {item.brand} - {(item.calories || 0).toFixed(0)} kcal
                    </ThemedText>
                    {item.servingType === "serving" && (
                      <ThemedText style={styles.servingDetails}>
                        Serving Size: {item.quantity} {item.unit}
                      </ThemedText>
                    )}
                    <ThemedText style={styles.macros}>
                      P: {formatMacro(item.protein)}g | C:{" "}
                      {formatMacro(item.carbs)}g | F: {formatMacro(item.fat)}g
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item)}
                  >
                    <Icon name="delete" size={24} color="#ff3366" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
    marginBottom: 10,
    color: "#ffffff",
  },
  totalCalories: {
    fontSize: 18,
    color: "#ffffff",
    marginBottom: 20,
  },
  dateContainer: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 20,
    marginBottom: 10,
  },
  diaryItemContainer: {
    marginBottom: 10,
  },
  diaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#494c4d",
    borderRadius: 10,
    padding: 15,
  },
  diaryItemText: {
    flex: 1,
  },
  itemName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  itemDetails: {
    color: "#ffffff",
    fontSize: 14,
    marginTop: 5,
  },
  servingDetails: {
    color: "#ffffff",
    fontSize: 14,
    marginTop: 5,
  },
  macros: {
    color: "#ffffff",
    fontSize: 12,
    marginTop: 5,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
  },
});
