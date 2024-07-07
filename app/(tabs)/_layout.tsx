import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "diary") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "scanner") {
            iconName = focused ? "scan" : "scan-outline";
          } else {
            iconName = "alert-circle"; // Default icon
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "lightgray",
        tabBarStyle: { backgroundColor: "#000" },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: "Diary",
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scan",
        }}
      />
    </Tabs>
  );
}
