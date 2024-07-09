import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initializeDatabase } from "../data/databaseInit";
import { SQLiteFoodRepository } from "../data/sqliteFoodRepository";
import { useStore } from "../store/store";

function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const database = useSQLiteContext();

  useEffect(() => {
    const repository = new SQLiteFoodRepository(database);
    useStore.getState().setFoodRepository(repository);

    const loadGoal = async () => {
      console.log("Loading daily calorie goal from database...");
      await useStore.getState().loadDailyCalorieGoal();
      console.log(
        "Daily calorie goal loaded:",
        useStore.getState().dailyCalorieGoal
      );
    };

    loadGoal();
  }, [database]);

  return <>{children}</>;
}

export default function AppLayout() {
  const loadFoodItems = useStore((state) => state.loadFoodItems);

  useEffect(() => {
    loadFoodItems();
  }, [loadFoodItems]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SQLiteProvider databaseName="fooddiary.db" onInit={initializeDatabase}>
        <RepositoryProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="food-info"
              options={{
                presentation: "modal",
                title: "Food Information",
              }}
            />
          </Stack>
        </RepositoryProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
