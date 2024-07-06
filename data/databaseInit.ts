import { SQLiteDatabase } from "expo-sqlite";
import { migrateDatabase } from "./databaseMigrations";

export async function initializeDatabase(db: SQLiteDatabase) {
  await migrateDatabase(db);
  // Add any other initialization logic here
}
