export interface FoodItem {
  id?: number;
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  barcode: string;
}

export interface FoodRepository {
  getAllItems(): Promise<FoodItem[]>;
  getItemsByDate(date: string): Promise<FoodItem[]>;
  addItem(item: FoodItem): Promise<void>;
  getItemByBarcode(barcode: string): Promise<FoodItem | null>;
  updateItem(item: FoodItem): Promise<void>;
  deleteItem(id: number): Promise<void>;
}
