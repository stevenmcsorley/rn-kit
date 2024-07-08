import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useFoodRepository } from "@/contexts/FoodRepositoryContext";
import { FoodItem } from "@/data/interfaces";

interface HomeContextProps {
  scannedItems: FoodItem[];
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
  macroGoals: { carbGoal: number; proteinGoal: number; fatGoal: number };
  dailyCalorieGoal: number;
  highestCarbFood: { name: string; carbs: number } | null;
  setDailyCalorieGoal: (goal: number) => void;
  loadScannedItems: () => Promise<void>;
  calculateMacros: () => Promise<void>;
  refreshDiary: () => Promise<void>;
}

const defaultValue: HomeContextProps = {
  scannedItems: [],
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
  macroGoals: { carbGoal: 0, proteinGoal: 0, fatGoal: 0 },
  dailyCalorieGoal: 2000,
  highestCarbFood: null,
  setDailyCalorieGoal: () => {},
  loadScannedItems: async () => {},
  calculateMacros: async () => {},
  refreshDiary: async () => {},
};

const HomeContext = createContext<HomeContextProps>(defaultValue);

export const useHome = () => useContext(HomeContext);

export const HomeProvider = ({ children }: { children: React.ReactNode }) => {
  const [scannedItems, setScannedItems] = useState<FoodItem[]>([]);
  const [macros, setMacros] = useState(defaultValue.macros);
  const [macroGoals, setMacroGoals] = useState(defaultValue.macroGoals);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);
  const [highestCarbFood, setHighestCarbFood] = useState<{
    name: string;
    carbs: number;
  } | null>(null);
  const foodRepository = useFoodRepository();

  const calculateMacroGoals = useCallback((calorieGoal: number) => {
    const carbPercentage = 0.2;
    const proteinPercentage = 0.3;
    const fatPercentage = 0.5;

    const carbGoal = (calorieGoal * carbPercentage) / 4;
    const proteinGoal = (calorieGoal * proteinPercentage) / 4;
    const fatGoal = (calorieGoal * fatPercentage) / 9;

    return {
      carbGoal,
      proteinGoal,
      fatGoal,
    };
  }, []);

  const loadScannedItems = useCallback(async () => {
    const items = await foodRepository.getAllItems();
    setScannedItems(items.slice(0, 5));
  }, [foodRepository]);

  const calculateMacros = useCallback(async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const items = await foodRepository.getItemsByDate(
      todayStart.toISOString(),
      todayEnd.toISOString()
    );

    const totalMacros = items.reduce(
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
      { ...defaultValue.macros }
    );

    setMacros(totalMacros);

    // Find the food item with the highest carbs
    const highestCarbItem = items.reduce(
      (highest, current) =>
        (current.carbs || 0) > (highest?.carbs || 0) ? current : highest,
      null as FoodItem | null
    );

    if (highestCarbItem) {
      setHighestCarbFood({
        name: highestCarbItem.name,
        carbs: highestCarbItem.carbs || 0,
      });
    } else {
      setHighestCarbFood(null);
    }
  }, [foodRepository]);

  const refreshDiary = useCallback(async () => {
    await Promise.all([loadScannedItems(), calculateMacros()]);
    setMacroGoals(calculateMacroGoals(dailyCalorieGoal));
  }, [
    loadScannedItems,
    calculateMacros,
    dailyCalorieGoal,
    calculateMacroGoals,
  ]);

  useEffect(() => {
    refreshDiary();
  }, [refreshDiary]);

  return (
    <HomeContext.Provider
      value={{
        scannedItems,
        macros,
        macroGoals,
        dailyCalorieGoal,
        highestCarbFood,
        setDailyCalorieGoal,
        loadScannedItems,
        calculateMacros,
        refreshDiary,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};
