import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ThemedText } from "../../components/ThemedText";
import { useFoodRepository } from "../../contexts/FoodRepositoryContext";
import { FoodItem } from "../../data/interfaces";

export default function DiaryScreen() {
  const [diaryItems, setDiaryItems] = useState<{ [date: string]: FoodItem[] }>(
    {}
  );
  const [totalCalories, setTotalCalories] = useState(0);
  const foodRepository = useFoodRepository();
  const router = useRouter();

  const loadDiaryItems = useCallback(async () => {
    const items = await foodRepository.getAllItems();

    const groupedItems = items.reduce((acc, item) => {
      const date = new Date(item.date).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as { [date: string]: FoodItem[] });

    setDiaryItems(groupedItems);

    const today = new Date().toDateString();
    const todayCalories = (groupedItems[today] || []).reduce(
      (sum, item) => sum + (item.calories || 0),
      0
    );
    setTotalCalories(todayCalories);
  }, [foodRepository]);

  useFocusEffect(
    useCallback(() => {
      loadDiaryItems();
    }, [loadDiaryItems])
  );

  const handleItemPress = (barcode: string) => {
    router.push({
      pathname: "/food-info",
      params: { barcode, fromDiary: "true" },
    });
  };

  const formatMacro = (value: number | null): string => {
    return value !== null ? value.toFixed(1) : "N/A";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Food Diary
        </ThemedText>
        <ThemedText style={styles.totalCalories}>
          Today's Total: {totalCalories} kcal
        </ThemedText>
        {Object.entries(diaryItems).map(([date, items]) => (
          <View key={date}>
            <ThemedText style={styles.dateHeader}>{date}</ThemedText>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.diaryItem}
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
                  P: {formatMacro(item.protein)}g | C: {formatMacro(item.carbs)}
                  g | F: {formatMacro(item.fat)}g
                </ThemedText>
              </TouchableOpacity>
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
  dateHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 20,
    marginBottom: 10,
  },
  diaryItem: {
    backgroundColor: "#494c4d",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
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
});
