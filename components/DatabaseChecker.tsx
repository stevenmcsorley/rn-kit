import React, { useEffect } from "react";
import { View, Text } from "react-native";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";

const checkDatabaseFile = async () => {
  const dbPath = `${FileSystem.documentDirectory}SQLite/foodinfo.db`;

  try {
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (fileInfo.exists) {
      console.log("Database file exists:", fileInfo);
    } else {
      console.log("Database file does not exist.");
    }
  } catch (error) {
    console.error("Error checking database file:", error);
  }
};

const DatabaseChecker = () => {
  useEffect(() => {
    checkDatabaseFile();
  }, []);

  return (
    <View>
      <Text>Check console for database file status</Text>
    </View>
  );
};

export default DatabaseChecker;
