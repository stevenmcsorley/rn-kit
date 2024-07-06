import React from "react";
import { Stack } from "expo-router";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 3; // Increment this to 3
  const result = await db.getFirstAsync<{ user_version: number } | null>(
    "PRAGMA user_version"
  );
  const currentDbVersion = result?.user_version ?? 0;

  if (currentDbVersion < DATABASE_VERSION) {
    await db.execAsync(`
      PRAGMA foreign_keys = OFF;
      BEGIN TRANSACTION;

      -- Create the table if it doesn't exist
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        brand TEXT,
        calories INTEGER,
        barcode TEXT
      );

      -- Check if new columns exist, if not, add them
      PRAGMA table_info(items);
    `);

    const columns = await db.getAllAsync<{ name: string }>(
      "PRAGMA table_info(items)"
    );
    const columnNames = columns.map((col) => col.name);

    const columnsToAdd = [
      { name: "protein", type: "REAL" },
      { name: "carbs", type: "REAL" },
      { name: "fat", type: "REAL" },
      { name: "date", type: "TEXT" },
    ];

    for (const column of columnsToAdd) {
      if (!columnNames.includes(column.name)) {
        await db.execAsync(
          `ALTER TABLE items ADD COLUMN ${column.name} ${column.type};`
        );
      }
    }

    await db.execAsync(`
      -- Update the database version
      PRAGMA user_version = ${DATABASE_VERSION};

      COMMIT;
      PRAGMA foreign_keys = ON;
    `);
  }
}

export default function AppLayout() {
  return (
    <SQLiteProvider databaseName="fooddiary.db" onInit={migrateDbIfNeeded}>
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
    </SQLiteProvider>
  );
}
