import { SQLiteDatabase } from "expo-sqlite";

export async function migrateDatabase(db: SQLiteDatabase) {
  const DATABASE_VERSION = 4; // Incremented to trigger the new migration
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
        calories REAL,
        barcode TEXT,
        protein REAL,
        carbs REAL,
        fat REAL,
        date TEXT,
        quantity REAL,
        unit TEXT,
        servingType TEXT
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
      { name: "quantity", type: "REAL" },
      { name: "unit", type: "TEXT" },
      { name: "servingType", type: "TEXT" },
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
