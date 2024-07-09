// data/sqliteFoodRepository.ts

import { SQLiteDatabase } from "expo-sqlite";
import { FoodRepository, FoodItem } from "./interfaces";

export class SQLiteFoodRepository implements FoodRepository {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async getAllItems(): Promise<FoodItem[]> {
    return this.db.getAllAsync<FoodItem>(
      "SELECT * FROM items ORDER BY date DESC"
    );
  }

  async getItemsByDate(
    startDate: string,
    endDate: string
  ): Promise<FoodItem[]> {
    return this.db.getAllAsync<FoodItem>(
      "SELECT * FROM items WHERE date BETWEEN ? AND ? ORDER BY id DESC",
      [startDate, endDate]
    );
  }

  async addItem(item: FoodItem): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO items (name, brand, calories, protein, carbs, fat, saturatedFat, cholesterol, sodium, fiber, sugar, date, barcode, quantity, unit, servingType) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.name,
        item.brand,
        item.calories,
        item.protein,
        item.carbs,
        item.fat,
        item.saturatedFat,
        item.cholesterol,
        item.sodium,
        item.fiber,
        item.sugar,
        item.date,
        item.barcode,
        item.quantity,
        item.unit,
        item.servingType,
      ]
    );
  }

  async getItemByBarcode(barcode: string): Promise<FoodItem | null> {
    const items = await this.db.getAllAsync<FoodItem>(
      "SELECT * FROM items WHERE barcode = ? LIMIT 1",
      [barcode]
    );
    return items.length > 0 ? items[0] : null;
  }

  async updateItem(item: FoodItem): Promise<void> {
    await this.db.runAsync(
      `UPDATE items SET name = ?, brand = ?, calories = ?, protein = ?, carbs = ?, fat = ?, saturatedFat = ?, cholesterol = ?, sodium = ?, fiber = ?, sugar = ?, date = ?, quantity = ?, unit = ?, servingType = ? 
       WHERE barcode = ?`,
      [
        item.name,
        item.brand,
        item.calories,
        item.protein,
        item.carbs,
        item.fat,
        item.saturatedFat,
        item.cholesterol,
        item.sodium,
        item.fiber,
        item.sugar,
        item.date,
        item.quantity,
        item.unit,
        item.servingType,
        item.barcode,
      ]
    );
  }

  async deleteItem(id: number): Promise<void> {
    await this.db.runAsync("DELETE FROM items WHERE id = ?", [id]);
  }

  async setDailyCalorieGoal(goal: number): Promise<void> {
    console.log("Setting daily calorie goal in DB to:", goal);
    try {
      await this.db.runAsync(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('dailyCalorieGoal', ?)",
        [goal]
      );
      console.log("Daily calorie goal set successfully in DB.");
      await this.logSettingsTable();
    } catch (error) {
      console.error("Error setting daily calorie goal:", error);
      // Check if the error is due to missing table
      if (error.message.includes("no such table: settings")) {
        console.log("Attempting to create settings table...");
        await this.createSettingsTable();
        // Retry setting the goal
        await this.db.runAsync(
          "INSERT OR REPLACE INTO settings (key, value) VALUES ('dailyCalorieGoal', ?)",
          [goal]
        );
        console.log(
          "Daily calorie goal set successfully after creating table."
        );
      } else {
        throw error;
      }
    }
  }

  async getDailyCalorieGoal(): Promise<number> {
    console.log("Getting daily calorie goal from DB.");
    try {
      await this.logSettingsTable();
      const result = await this.db.getFirstAsync<{ value: number }>(
        "SELECT value FROM settings WHERE key = 'dailyCalorieGoal' LIMIT 1"
      );
      console.log("Daily calorie goal retrieved from DB:", result?.value);
      return result?.value ?? 2000; // Default to 2000 if no value is found
    } catch (error) {
      console.error("Error getting daily calorie goal:", error);
      // Check if the error is due to missing table
      if (error.message.includes("no such table: settings")) {
        console.log("Settings table not found. Creating and initializing...");
        await this.createSettingsTable();
        return 2000; // Return default value after creating table
      }
      throw error;
    }
  }

  private async createSettingsTable(): Promise<void> {
    try {
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value REAL
        );
        INSERT OR IGNORE INTO settings (key, value) VALUES ('dailyCalorieGoal', 2000);
      `);
      console.log("Settings table created and initialized successfully.");
    } catch (error) {
      console.error("Error creating settings table:", error);
      throw error;
    }
  }

  async logSettingsTable(): Promise<void> {
    try {
      const settings = await this.db.getAllAsync<{
        key: string;
        value: number;
      }>("SELECT * FROM settings");
      console.log(
        "Settings Table Contents:",
        JSON.stringify(settings, null, 2)
      );
    } catch (error) {
      console.error("Error logging settings table:", error);
      // If the table doesn't exist, create it
      if (error.message.includes("no such table: settings")) {
        await this.createSettingsTable();
        // Try logging again after creating the table
        const settings = await this.db.getAllAsync<{
          key: string;
          value: number;
        }>("SELECT * FROM settings");
        console.log(
          "Settings Table Contents (after creation):",
          JSON.stringify(settings, null, 2)
        );
      } else {
        throw error;
      }
    }
  }
}
