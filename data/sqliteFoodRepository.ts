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
      `INSERT INTO items (name, brand, calories, protein, carbs, fat, date, barcode, quantity, unit, servingType) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.name,
        item.brand,
        item.calories,
        item.protein,
        item.carbs,
        item.fat,
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
      `UPDATE items SET name = ?, brand = ?, calories = ?, protein = ?, carbs = ?, fat = ?, date = ?, quantity = ?, unit = ?, servingType = ? 
       WHERE barcode = ?`,
      [
        item.name,
        item.brand,
        item.calories,
        item.protein,
        item.carbs,
        item.fat,
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
}
