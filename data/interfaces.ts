export interface FoodItem {
  id?: number;
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  saturatedFat: number;
  cholesterol: number;
  sodium: number;
  fiber: number;
  sugar: number;
  date: string;
  barcode: string;
  quantity: number;
  unit: string;
  servingType: "full" | "serving";
}

export interface FoodRepository {
  getAllItems(): Promise<FoodItem[]>;
  getItemsByDate(startDate: string, endDate: string): Promise<FoodItem[]>;
  addItem(item: FoodItem): Promise<void>;
  getItemByBarcode(barcode: string): Promise<FoodItem | null>;
  updateItem(item: FoodItem): Promise<void>;
  deleteItem(id: number): Promise<void>;
  getDailyCalorieGoal(): Promise<number>;
  setDailyCalorieGoal(goal: number): Promise<void>;
}
