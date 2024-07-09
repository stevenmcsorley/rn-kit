import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useStore } from "../store/store";
import { FoodItem } from "../data/interfaces";
import { ThemedText } from "../components/ThemedText";
import { fetchProductInfo } from "../api/foodApi";
import { MacroIcon } from "../components/MacroIcon";

export default function FoodInfoScreen() {
  const { barcode } = useLocalSearchParams();
  const [productInfo, setProductInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [servingSize, setServingSize] = useState(100);
  const [manualEntryVisible, setManualEntryVisible] = useState(false);
  const [manualItem, setManualItem] = useState<Partial<FoodItem>>({});
  const router = useRouter();
  const foodRepository = useStore((state) => state.foodRepository);
  const addFoodItem = useStore((state) => state.addFoodItem);
  const refreshDiary = useStore((state) => state.refreshDiary);

  const resetState = useCallback(() => {
    setProductInfo(null);
    setIsLoading(true);
    setServingSize(100);
    setManualEntryVisible(false);
    setManualItem({});
  }, []);

  const loadProductInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      // First, check if it's a manual entry in the local database
      const localItem = await foodRepository?.getItemByBarcode(
        barcode as string
      );
      if (localItem) {
        setProductInfo(localItem);
      } else {
        // If not in local database, fetch from API
        const info = await fetchProductInfo(barcode as string);
        if (info === null) {
          // Product not found in API, show manual entry form
          setManualEntryVisible(true);
        } else {
          setProductInfo(info);
        }
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      Alert.alert("Error", "Failed to fetch product data");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [barcode, foodRepository, router]);

  useFocusEffect(
    useCallback(() => {
      resetState();
      loadProductInfo();
    }, [resetState, loadProductInfo])
  );

  const addToDiary = async (
    servingType: "full" | "serving",
    customServingSize?: number
  ) => {
    const item = productInfo || manualItem;
    if (item) {
      try {
        const servingMultiplier = customServingSize
          ? customServingSize / 100
          : 1;

        const foodItem: FoodItem = {
          name: item.product_name || item.name,
          brand: item.brands || item.brand,
          calories:
            servingType === "serving"
              ? (item.nutriments?.["energy-kcal_serving"] ||
                  item.nutriments?.["energy-kcal_100g"] * servingMultiplier ||
                  item.calories) * servingMultiplier
              : item.nutriments?.["energy-kcal_100g"] || item.calories,
          protein:
            servingType === "serving"
              ? (item.nutriments?.proteins_serving ||
                  item.nutriments?.proteins_100g * servingMultiplier ||
                  item.protein) * servingMultiplier
              : item.nutriments?.proteins_100g || item.protein,
          carbs:
            servingType === "serving"
              ? (item.nutriments?.carbohydrates_serving ||
                  item.nutriments?.carbohydrates_100g * servingMultiplier ||
                  item.carbs) * servingMultiplier
              : item.nutriments?.carbohydrates_100g || item.carbs,
          fat:
            servingType === "serving"
              ? (item.nutriments?.fat_serving ||
                  item.nutriments?.fat_100g * servingMultiplier ||
                  item.fat) * servingMultiplier
              : item.nutriments?.fat_100g || item.fat,
          saturatedFat:
            servingType === "serving"
              ? (item.nutriments?.["saturated-fat_serving"] ||
                  item.nutriments?.["saturated-fat_100g"] * servingMultiplier ||
                  item.saturatedFat) * servingMultiplier
              : item.nutriments?.["saturated-fat_100g"] || item.saturatedFat,
          cholesterol:
            servingType === "serving"
              ? (item.nutriments?.cholesterol_serving ||
                  item.nutriments?.cholesterol_100g * servingMultiplier ||
                  item.cholesterol) * servingMultiplier
              : item.nutriments?.cholesterol_100g || item.cholesterol,
          sodium:
            servingType === "serving"
              ? (item.nutriments?.sodium_serving ||
                  item.nutriments?.sodium_100g * servingMultiplier ||
                  item.sodium) * servingMultiplier
              : item.nutriments?.sodium_100g || item.sodium,
          fiber:
            servingType === "serving"
              ? (item.nutriments?.fiber_serving ||
                  item.nutriments?.fiber_100g * servingMultiplier ||
                  item.fiber) * servingMultiplier
              : item.nutriments?.fiber_100g || item.fiber,
          sugar:
            servingType === "serving"
              ? (item.nutriments?.sugars_serving ||
                  item.nutriments?.sugars_100g * servingMultiplier ||
                  item.sugar) * servingMultiplier
              : item.nutriments?.sugars_100g || item.sugar,
          date: new Date().toISOString(),
          barcode: barcode as string,
          quantity: customServingSize || item.serving_quantity || 100,
          unit: item.serving_quantity_unit || "g",
          servingType: servingType,
        };

        await addFoodItem(foodItem);
        await refreshDiary(); // Refresh the diary after adding the item
        Alert.alert("Success", `Item added to diary (${servingType})`, [
          { text: "OK", onPress: () => router.back() },
        ]);
      } catch (error) {
        console.error("Error adding item to diary:", error);
        Alert.alert("Error", "Failed to add item to diary");
      }
    }
  };

  const handleServingSizeChange = (size: number) => {
    setServingSize(Math.max(1, size)); // Ensure serving size is at least 1g
  };

  const handleManualEntrySubmit = async () => {
    try {
      const foodItem: FoodItem = {
        ...manualItem,
        barcode: barcode as string,
        date: new Date().toISOString(),
        quantity: manualItem.quantity || 100,
        unit: manualItem.unit || "g",
        servingType: "full",
      } as FoodItem;

      await addFoodItem(foodItem);
      setProductInfo(foodItem);
      setManualEntryVisible(false);
      await refreshDiary(); // Refresh the diary after adding the manual item
      Alert.alert("Success", "Manual item added", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error adding manual item:", error);
      Alert.alert("Error", "Failed to add manual item");
    }
  };

  if (isLoading) {
    return <ThemedText>Loading...</ThemedText>;
  }

  if (!productInfo && !manualEntryVisible) {
    return <ThemedText>No product information available.</ThemedText>;
  }

  const item = productInfo || manualItem;
  const nutriments = item.nutriments || item;
  const hasNutritionalInfo =
    nutriments &&
    (nutriments.proteins_100g || item.protein) &&
    (nutriments.carbohydrates_100g || item.carbs) &&
    (nutriments.fat_100g || item.fat);

  const calculatedCalories =
    nutriments["energy-kcal_100g"] || item.calories
      ? (
          ((nutriments["energy-kcal_100g"] || item.calories) * servingSize) /
          100
        ).toFixed(0)
      : "N/A";
  const calculatedProtein =
    nutriments.proteins_100g || item.protein
      ? (
          ((nutriments.proteins_100g || item.protein) * servingSize) /
          100
        ).toFixed(1)
      : "N/A";
  const calculatedCarbs =
    nutriments.carbohydrates_100g || item.carbs
      ? (
          ((nutriments.carbohydrates_100g || item.carbs) * servingSize) /
          100
        ).toFixed(1)
      : "N/A";
  const calculatedFat =
    nutriments.fat_100g || item.fat
      ? (((nutriments.fat_100g || item.fat) * servingSize) / 100).toFixed(1)
      : "N/A";
  const calculatedSugar =
    nutriments.sugars_100g || item.sugar
      ? (((nutriments.sugars_100g || item.sugar) * servingSize) / 100).toFixed(
          1
        )
      : "N/A";

  return (
    <ScrollView style={styles.container}>
      {manualEntryVisible ? (
        <ManualEntryForm
          manualItem={manualItem}
          setManualItem={setManualItem}
          onSubmit={handleManualEntrySubmit}
        />
      ) : (
        <>
          <ThemedText type="title" style={styles.productName}>
            {item.product_name || item.name}
          </ThemedText>
          {item.image_url && (
            <Image
              source={{ uri: item.image_url }}
              style={styles.productImage}
            />
          )}
          <ThemedText style={styles.infoText}>
            Brand: {item.brands || item.brand}
          </ThemedText>
          {hasNutritionalInfo && (
            <View style={styles.macroContainer}>
              <View style={styles.caloriesContainer}>
                <ThemedText style={styles.caloriesText}>
                  {calculatedCalories}
                </ThemedText>
                <ThemedText style={styles.caloriesUnit}>kcal</ThemedText>
              </View>
              <View style={styles.macroIcons}>
                <MacroIcon
                  icon="nutrition"
                  label="Protein"
                  value={calculatedProtein}
                  unit="g"
                  color="#ff6b6b"
                />
                <MacroIcon
                  icon="leaf"
                  label="Carbs"
                  value={calculatedCarbs}
                  unit="g"
                  color="#4ecdc4"
                />
                <MacroIcon
                  icon="water"
                  label="Fat"
                  value={calculatedFat}
                  unit="g"
                  color="#feca57"
                />
                <MacroIcon
                  icon="ice-cream"
                  label="Sugar"
                  value={calculatedSugar}
                  unit="g"
                  color="#9b59b6"
                />
              </View>
            </View>
          )}
          <View style={styles.customServingContainer}>
            <ThemedText style={styles.infoText}>
              Custom Serving Size (grams):
            </ThemedText>
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={() => handleServingSizeChange(servingSize - 1)}
              >
                <ThemedText style={styles.changeServingSizeButton_minus}>
                  -
                </ThemedText>
              </TouchableOpacity>
              <TextInput
                style={styles.input_inc}
                value={servingSize.toString()}
                keyboardType="numeric"
                onChangeText={(text) => handleServingSizeChange(Number(text))}
              />
              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={() => handleServingSizeChange(servingSize + 1)}
              >
                <ThemedText style={styles.changeServingSizeButton_plus}>
                  +
                </ThemedText>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.addButton, styles.addButtonMargin]}
              onPress={() => addToDiary("serving", servingSize)}
            >
              <ThemedText style={styles.addButtonText}>
                Add Custom Serving
              </ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const ManualEntryForm: React.FC<{
  manualItem: Partial<FoodItem>;
  setManualItem: React.Dispatch<React.SetStateAction<Partial<FoodItem>>>;
  onSubmit: () => void;
}> = ({ manualItem, setManualItem, onSubmit }) => {
  return (
    <View style={styles.manualEntryContainer}>
      <ThemedText style={styles.manualEntryTitle}>Manual Entry</ThemedText>
      <TextInput
        style={styles.manualInput}
        placeholder="Product Name"
        placeholderTextColor="#999"
        value={manualItem.name || ""}
        onChangeText={(text) =>
          setManualItem((prev) => ({ ...prev, name: text }))
        }
      />
      <TextInput
        style={styles.manualInput}
        placeholder="Brand"
        placeholderTextColor="#999"
        value={manualItem.brand || ""}
        onChangeText={(text) =>
          setManualItem((prev) => ({ ...prev, brand: text }))
        }
      />
      <TextInput
        style={styles.manualInput}
        placeholder="Calories (per 100g)"
        placeholderTextColor="#999"
        value={manualItem.calories?.toString() || ""}
        keyboardType="numeric"
        onChangeText={(text) =>
          setManualItem((prev) => ({ ...prev, calories: Number(text) }))
        }
      />
      <TextInput
        style={styles.manualInput}
        placeholder="Protein (g per 100g)"
        placeholderTextColor="#999"
        value={manualItem.protein?.toString() || ""}
        keyboardType="numeric"
        onChangeText={(text) =>
          setManualItem((prev) => ({ ...prev, protein: Number(text) }))
        }
      />
      <TextInput
        style={styles.manualInput}
        placeholder="Carbs (g per 100g)"
        placeholderTextColor="#999"
        value={manualItem.carbs?.toString() || ""}
        keyboardType="numeric"
        onChangeText={(text) =>
          setManualItem((prev) => ({ ...prev, carbs: Number(text) }))
        }
      />
      <TextInput
        style={styles.manualInput}
        placeholder="Fat (g per 100g)"
        placeholderTextColor="#999"
        value={manualItem.fat?.toString() || ""}
        keyboardType="numeric"
        onChangeText={(text) =>
          setManualItem((prev) => ({ ...prev, fat: Number(text) }))
        }
      />
      <TextInput
        style={styles.manualInput}
        placeholder="Saturated Fat (g per 100g)"
        placeholderTextColor="#999"
        value={manualItem.saturatedFat?.toString() || ""}
        keyboardType="numeric"
        onChangeText={(text) =>
          setManualItem((prev) => ({ ...prev, saturatedFat: Number(text) }))
        }
      />
      <TextInput
        style={styles.manualInput}
        placeholder="Cholesterol (mg per 100g)"
        placeholderTextColor="#999"
        value={manualItem.cholesterol?.toString() || ""}
        keyboardType="numeric"
        onChangeText={(text) =>
          setManualItem((prev) => ({ ...prev, cholesterol: Number(text) }))
        }
      />
      <TextInput
        style={styles.manualInput}
        placeholder="Sodium (mg per 100g)"
        placeholderTextColor="#999"
        value={manualItem.sodium?.toString() || ""}
        keyboardType="numeric"
        onChangeText={(text) =>
          setManualItem((prev) => ({ ...prev, sodium: Number(text) }))
        }
      />
      <TextInput
        style={styles.manualInput}
        placeholder="Fiber (g per 100g)"
        placeholderTextColor="#999"
        value={manualItem.fiber?.toString() || ""}
        keyboardType="numeric"
        onChangeText={(text) =>
          setManualItem((prev) => ({ ...prev, fiber: Number(text) }))
        }
      />
      <TextInput
        style={styles.manualInput}
        placeholder="Sugar (g per 100g)"
        placeholderTextColor="#999"
        value={manualItem.sugar?.toString() || ""}
        keyboardType="numeric"
        onChangeText={(text) =>
          setManualItem((prev) => ({ ...prev, sugar: Number(text) }))
        }
      />
      <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
        <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#242423",
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ffffff",
  },
  productImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#ffffff",
  },
  macroContainer: {
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  caloriesContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 15,
  },
  caloriesText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  caloriesUnit: {
    fontSize: 18,
    color: "#ffffff",
    marginLeft: 5,
  },
  macroCircles: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  customServingContainer: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    padding: 10,
  },
  buttonContainer: {
    backgroundColor: "green",
    borderRadius: 0,
    marginHorizontal: 0,
  },
  changeServingSizeButton_plus: {
    fontSize: 20,
    color: "#FFFFFF",
    paddingHorizontal: 30,
    paddingVertical: 16,
    textAlign: "center",
    backgroundColor: "#ff3366",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 10,
  },
  changeServingSizeButton_minus: {
    fontSize: 20,
    color: "#FFFFFF",
    paddingHorizontal: 30,
    paddingVertical: 16,
    textAlign: "center",
    backgroundColor: "#ff3366",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 10,
  },
  input_inc: {
    fontSize: 24,
    textAlign: "center",
    backgroundColor: "#FFFFFF",
    width: 80,
    height: 52,
    marginHorizontal: 0,
  },
  addButton: {
    backgroundColor: "#ff3366",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  addButtonMargin: {
    marginTop: 20,
    marginBottom: 80,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  manualEntryContainer: {
    padding: 20,
    backgroundColor: "#2D2F34",
    borderRadius: 10,
    marginBottom: 20,
  },
  manualEntryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  manualEntryInput: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#ffffff",
    backgroundColor: "#494c4d",
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: "#ff3366",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  manualInput: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#ffffff",
    backgroundColor: "#494c4d",
    borderRadius: 5,
  },
  macroIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    marginTop: 10,
  },
});
