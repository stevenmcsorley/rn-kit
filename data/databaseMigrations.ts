import { SQLiteDatabase } from "expo-sqlite";

export async function migrateDatabase(db: SQLiteDatabase) {
  const DATABASE_VERSION = 6; // Incremented to trigger the new migration
  const result = await db.getFirstAsync<{ user_version: number } | null>(
    "PRAGMA user_version"
  );
  const currentDbVersion = result?.user_version ?? 0;

  if (currentDbVersion < DATABASE_VERSION) {
    await db.execAsync(`
      PRAGMA foreign_keys = OFF;
      BEGIN TRANSACTION;

      -- Create the items table if it doesn't exist
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        brand TEXT,
        calories REAL,
        protein REAL,
        carbs REAL,
        fat REAL,
        saturatedFat REAL,
        cholesterol REAL,
        sodium REAL,
        fiber REAL,
        sugar REAL,
        date TEXT,
        barcode TEXT,
        quantity REAL,
        unit TEXT,
        servingType TEXT
      );

      -- Create the settings table if it doesn't exist
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value REAL
      );

      -- Ensure default value for dailyCalorieGoal is set
      INSERT OR IGNORE INTO settings (key, value) VALUES ('dailyCalorieGoal', 2000);

      -- Check if new columns exist, if not, add them
      PRAGMA table_info(items);
    `);

    const columns = await db.getAllAsync<{ name: string }>(
      "PRAGMA table_info(items)"
    );
    const columnNames = columns.map((col) => col.name);

    const columnsToAdd = [
      { name: "saturatedFat", type: "REAL" },
      { name: "cholesterol", type: "REAL" },
      { name: "sodium", type: "REAL" },
      { name: "fiber", type: "REAL" },
      { name: "sugar", type: "REAL" },
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
