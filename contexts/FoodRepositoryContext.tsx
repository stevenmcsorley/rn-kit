import React, { createContext, useContext } from "react";
import { FoodRepository } from "../data/interfaces";

const FoodRepositoryContext = createContext<FoodRepository | null>(null);

export const useFoodRepository = () => {
  const context = useContext(FoodRepositoryContext);
  if (!context) {
    throw new Error(
      "useFoodRepository must be used within a FoodRepositoryProvider"
    );
  }
  return context;
};

export const FoodRepositoryProvider: React.FC<{
  repository: FoodRepository;
  children: React.ReactNode;
}> = ({ repository, children }) => {
  return (
    <FoodRepositoryContext.Provider value={repository}>
      {children}
    </FoodRepositoryContext.Provider>
  );
};
