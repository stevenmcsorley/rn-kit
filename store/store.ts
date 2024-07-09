import { createWithEqualityFn } from "zustand/traditional";
import { FoodItem } from "../data/interfaces";
import { ProductInfo } from "../api/foodApi";
import { fetchProductInfo } from "../api/foodApi";
import { SQLiteFoodRepository } from "../data/sqliteFoodRepository";

interface AppState {
  foodItems: FoodItem[];
  dailyCalorieGoal: number;
  todayCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    saturatedFat: number;
    cholesterol: number;
    sodium: number;
    fiber: number;
    sugar: number;
  };
  highestCarbFood: { name: string; carbs: number } | null;
  isLoading: boolean;
  error: string | null;
  foodRepository: SQLiteFoodRepository | null;

  setFoodRepository: (repository: SQLiteFoodRepository) => void;
  loadFoodItems: () => Promise<void>;
  addFoodItem: (item: FoodItem) => Promise<void>;
  updateFoodItem: (item: FoodItem) => Promise<void>;
  deleteFoodItem: (id: number) => Promise<void>;
  setDailyCalorieGoal: (goal: number) => Promise<void>;
  loadDailyCalorieGoal: () => Promise<void>;
  fetchProductInfo: (barcode: string) => Promise<ProductInfo | null>;
  calculateMacros: () => void;
  calculateTodayCalories: () => void;
  refreshDiary: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useStore = createWithEqualityFn<AppState>((set, get) => ({
  foodItems: [],
  dailyCalorieGoal: 2000,
  todayCalories: 0,
  macros: {
    protein: 0,
    carbs: 0,
    fat: 0,
    saturatedFat: 0,
    cholesterol: 0,
    sodium: 0,
    fiber: 0,
    sugar: 0,
  },
  highestCarbFood: null,
  isLoading: false,
  error: null,
  foodRepository: null,

  setFoodRepository: (repository: SQLiteFoodRepository) =>
    set({ foodRepository: repository }),

  loadFoodItems: async () => {
    const { foodRepository } = get();
    if (!foodRepository) return;

    set({ isLoading: true });
    try {
      const items = await foodRepository.getAllItems();
      set({ foodItems: items, isLoading: false });
      get().calculateTodayCalories();
    } catch (error) {
      set({ error: "Failed to load food items", isLoading: false });
    }
  },

  addFoodItem: async (item: FoodItem) => {
    const { foodRepository } = get();
    if (!foodRepository) return;

    try {
      await foodRepository.addItem(item);
      await get().refreshDiary();
    } catch (error) {
      set({ error: "Failed to add food item" });
    }
  },

  updateFoodItem: async (item: FoodItem) => {
    const { foodRepository } = get();
    if (!foodRepository) return;

    try {
      await foodRepository.updateItem(item);
      await get().refreshDiary();
    } catch (error) {
      set({ error: "Failed to update food item" });
    }
  },

  deleteFoodItem: async (id: number) => {
    const { foodRepository } = get();
    if (!foodRepository) return;

    try {
      await foodRepository.deleteItem(id);
      await get().refreshDiary();
    } catch (error) {
      set({ error: "Failed to delete food item" });
    }
  },

  setDailyCalorieGoal: async (goal: number) => {
    const { foodRepository } = get();
    if (!foodRepository) return;

    try {
      console.log("Setting daily goal in store with:", goal);
      await foodRepository.setDailyCalorieGoal(goal);
      set({ dailyCalorieGoal: goal });
      console.log("Daily calorie goal updated in store:", goal);
    } catch (error) {
      console.error("Failed to set daily calorie goal:", error);
      set({ error: "Failed to set daily calorie goal" });
    }
  },

  loadDailyCalorieGoal: async () => {
    const { foodRepository } = get();
    if (!foodRepository) return;

    try {
      console.log("Loading daily calorie goal from DB in store.");
      const goal = await foodRepository.getDailyCalorieGoal();
      console.log("Loaded daily calorie goal from DB:", goal);
      set({ dailyCalorieGoal: goal });
    } catch (error) {
      console.error("Failed to load daily calorie goal:", error);
      set({ error: "Failed to load daily calorie goal" });
    }
  },

  fetchProductInfo: async (barcode: string) => {
    set({ isLoading: true });
    try {
      const productInfo = await fetchProductInfo(barcode);
      set({ isLoading: false });
      return productInfo;
    } catch (error) {
      set({ error: "Failed to fetch product info", isLoading: false });
      return null;
    }
  },

  calculateMacros: () => {
    const { foodItems } = get();
    const today = new Date().toDateString();
    const todayItems = foodItems.filter(
      (item) => new Date(item.date).toDateString() === today
    );

    const macros = todayItems.reduce(
      (acc, item) => ({
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0),
        saturatedFat: acc.saturatedFat + (item.saturatedFat || 0),
        cholesterol: acc.cholesterol + (item.cholesterol || 0),
        sodium: acc.sodium + (item.sodium || 0),
        fiber: acc.fiber + (item.fiber || 0),
        sugar: acc.sugar + (item.sugar || 0),
      }),
      {
        protein: 0,
        carbs: 0,
        fat: 0,
        saturatedFat: 0,
        cholesterol: 0,
        sodium: 0,
        fiber: 0,
        sugar: 0,
      }
    );

    const highestCarbFood = todayItems.reduce(
      (highest, current) =>
        (current.carbs || 0) > (highest?.carbs || 0) ? current : highest,
      null as FoodItem | null
    );

    set({
      macros,
      highestCarbFood: highestCarbFood
        ? { name: highestCarbFood.name, carbs: highestCarbFood.carbs || 0 }
        : null,
    });
  },

  calculateTodayCalories: () => {
    const { foodItems } = get();
    const today = new Date().toDateString();
    const todayItems = foodItems.filter(
      (item) => new Date(item.date).toDateString() === today
    );
    const calories = todayItems.reduce(
      (sum, item) => sum + (item.calories || 0),
      0
    );
    console.log("Calculated today's calories:", calories);
    set({ todayCalories: calories });
  },

  refreshDiary: async () => {
    await get().loadFoodItems();
    get().calculateMacros();
    get().calculateTodayCalories();
  },

  setError: (error: string | null) => set({ error }),
}));
