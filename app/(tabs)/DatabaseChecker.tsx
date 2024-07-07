import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import * as Sharing from "expo-sharing";

const db = SQLite.openDatabaseSync("fooddiary.db");

const checkDatabaseFile = async () => {
  const dbPath = `${FileSystem.documentDirectory}SQLite/fooddiary.db`;

  try {
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    console.log("Database Path:", dbPath); // Log the database path
    return fileInfo;
  } catch (error) {
    console.error("Error checking database file:", error);
    return null;
  }
};

const fetchTableStructure = async () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `PRAGMA table_info(items);`,
        [],
        (_, { rows }) => {
          resolve(rows.raw()); // raw() might be used instead of _array in some SQLite libraries
        },
        (_, error) => {
          console.error("Error fetching table structure:", error);
          reject(error);
        }
      );
    });
  });
};

const fetchTableData = async () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM items;`,
        [],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          console.error("Error fetching table data:", error);
          reject(error);
        }
      );
    });
  });
};

const shareDatabaseFile = async () => {
  const dbPath = `${FileSystem.documentDirectory}SQLite/fooddiary.db`;
  try {
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (fileInfo.exists) {
      await Sharing.shareAsync(dbPath);
    } else {
      console.log("Database file does not exist.");
    }
  } catch (error) {
    console.error("Error sharing database file:", error);
  }
};

const DatabaseChecker = () => {
  const [dbInfo, setDbInfo] = useState(null);
  const [tableStructure, setTableStructure] = useState([]);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const info = await checkDatabaseFile();
      setDbInfo(info);

      if (info) {
        const structure = await fetchTableStructure();
        setTableStructure(structure);
        const data = await fetchTableData();
        setTableData(data);
      }
    };

    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {dbInfo ? (
        <View>
          <Text style={styles.text}>Database file exists:</Text>
          <Text style={styles.text}>URI: {dbInfo.uri}</Text>
          <Text style={styles.text}>Size: {dbInfo.size} bytes</Text>
          <Text style={styles.text}>
            Modification Time:{" "}
            {new Date(dbInfo.modificationTime * 1000).toLocaleString()}
          </Text>
          <Button title="Share Database File" onPress={shareDatabaseFile} />
          <Text style={styles.header}>Table Structure:</Text>
          {tableStructure.map((column, index) => (
            <Text key={index} style={styles.text}>
              {column.name} ({column.type})
            </Text>
          ))}

          <Text style={styles.header}>Table Data:</Text>
          {tableData.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {Object.keys(row).map((key, colIndex) => (
                <Text key={colIndex} style={styles.text}>
                  {key}: {row[key]}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.text}>Database file does not exist.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#242423",
  },
  text: {
    color: "#ffffff",
    fontSize: 18,
    marginBottom: 10,
  },
  header: {
    color: "#ff3366",
    fontSize: 20,
    marginBottom: 10,
    marginTop: 20,
  },
  row: {
    marginBottom: 20,
  },
});

export default DatabaseChecker;
