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
  macros: { protein: number; carbs: number; fat: number };
  loadScannedItems: () => Promise<void>;
  calculateMacros: () => Promise<void>;
  refreshDiary: () => Promise<void>;
}

const defaultValue: HomeContextProps = {
  scannedItems: [],
  macros: { protein: 0, carbs: 0, fat: 0 },
  loadScannedItems: async () => {},
  calculateMacros: async () => {},
  refreshDiary: async () => {},
};

const HomeContext = createContext<HomeContextProps>(defaultValue);

export const useHome = () => useContext(HomeContext);

export const HomeProvider = ({ children }: { children: React.ReactNode }) => {
  const [scannedItems, setScannedItems] = useState<FoodItem[]>([]);
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });
  const foodRepository = useFoodRepository();

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
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );

    setMacros(totalMacros);
  }, [foodRepository]);

  const refreshDiary = useCallback(async () => {
    await Promise.all([loadScannedItems(), calculateMacros()]);
  }, [loadScannedItems, calculateMacros]);

  useEffect(() => {
    refreshDiary();
  }, [refreshDiary]);

  return (
    <HomeContext.Provider
      value={{
        scannedItems,
        macros,
        loadScannedItems,
        calculateMacros,
        refreshDiary,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};
