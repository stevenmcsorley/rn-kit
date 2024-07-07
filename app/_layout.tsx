import React from "react";
import { Stack } from "expo-router";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { initializeDatabase } from "../data/databaseInit";
import { SQLiteFoodRepository } from "../data/sqliteFoodRepository";
import { FoodRepositoryProvider } from "../contexts/FoodRepositoryContext";
import { HomeProvider } from "./contexts/HomeContext";

function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const database = useSQLiteContext();
  return (
    <FoodRepositoryProvider repository={new SQLiteFoodRepository(database)}>
      {children}
    </FoodRepositoryProvider>
  );
}

export default function AppLayout() {
  return (
    <SQLiteProvider databaseName="fooddiary.db" onInit={initializeDatabase}>
      <RepositoryProvider>
        <HomeProvider>
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
        </HomeProvider>
      </RepositoryProvider>
    </SQLiteProvider>
  );
}
