import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFoodRepository } from "../contexts/FoodRepositoryContext";
import { FoodItem } from "../data/interfaces";
import { ThemedText } from "../components/ThemedText";
import { fetchProductInfo } from "../api/foodApi";
import { MacroCircle } from "../components/MacroCircle";

export default function FoodInfoScreen() {
  const { barcode } = useLocalSearchParams();
  const [productInfo, setProductInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [servingSize, setServingSize] = useState(100);
  const router = useRouter();
  const foodRepository = useFoodRepository();

  useEffect(() => {
    loadProductInfo();
  }, [barcode]);

  const loadProductInfo = async () => {
    setIsLoading(true);
    try {
      const info = await fetchProductInfo(barcode as string);
      setProductInfo(info);
    } catch (error) {
      console.error("Error fetching product data:", error);
      Alert.alert("Error", "Failed to fetch product data");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const addToDiary = async (
    servingType: "full" | "serving",
    customServingSize?: number
  ) => {
    if (productInfo) {
      try {
        const servingMultiplier = customServingSize
          ? customServingSize / 100
          : 1;

        const foodItem: FoodItem = {
          name: productInfo.product_name,
          brand: productInfo.brands,
          calories:
            servingType === "serving"
              ? productInfo.nutriments["energy-kcal_serving"] ||
                productInfo.nutriments["energy-kcal_100g"] * servingMultiplier
              : productInfo.nutriments["energy-kcal_100g"],
          protein:
            servingType === "serving"
              ? productInfo.nutriments.proteins_serving ||
                productInfo.nutriments.proteins_100g * servingMultiplier
              : productInfo.nutriments.proteins_100g,
          carbs:
            servingType === "serving"
              ? productInfo.nutriments.carbohydrates_serving ||
                productInfo.nutriments.carbohydrates_100g * servingMultiplier
              : productInfo.nutriments.carbohydrates_100g,
          fat:
            servingType === "serving"
              ? productInfo.nutriments.fat_serving ||
                productInfo.nutriments.fat_100g * servingMultiplier
              : productInfo.nutriments.fat_100g,
          date: new Date().toISOString(),
          barcode: barcode as string,
          quantity: customServingSize || productInfo.serving_quantity || 100,
          unit: productInfo.serving_quantity_unit || "g",
          servingType: servingType,
        };

        await foodRepository.addItem(foodItem);
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

  if (isLoading) {
    return <ThemedText>Loading...</ThemedText>;
  }

  if (!productInfo) {
    return <ThemedText>No product information available.</ThemedText>;
  }

  const nutriments = productInfo.nutriments;
  const hasNutritionalInfo =
    nutriments &&
    nutriments.proteins_100g &&
    nutriments.carbohydrates_100g &&
    nutriments.fat_100g;

  const calculatedCalories = nutriments["energy-kcal_100g"]
    ? ((nutriments["energy-kcal_100g"] * servingSize) / 100).toFixed(0)
    : "N/A";
  const calculatedProtein = nutriments.proteins_100g
    ? ((nutriments.proteins_100g * servingSize) / 100).toFixed(1)
    : "N/A";
  const calculatedCarbs = nutriments.carbohydrates_100g
    ? ((nutriments.carbohydrates_100g * servingSize) / 100).toFixed(1)
    : "N/A";
  const calculatedFat = nutriments.fat_100g
    ? ((nutriments.fat_100g * servingSize) / 100).toFixed(1)
    : "N/A";

  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title" style={styles.productName}>
        {productInfo.product_name}
      </ThemedText>
      {productInfo.image_url && (
        <Image
          source={{ uri: productInfo.image_url }}
          style={styles.productImage}
        />
      )}
      <ThemedText style={styles.infoText}>
        Brand: {productInfo.brands}
      </ThemedText>
      {/* <ThemedText style={styles.infoText}>
        Quantity: {productInfo.quantity}
      </ThemedText> */}
      {/* <ThemedText style={styles.infoText}>
        Ingredients: {productInfo.ingredients_text}
      </ThemedText> */}
      {/* <ThemedText style={styles.infoText}>
        Nutrition Grade: {productInfo.nutrition_grades_tags}
      </ThemedText> */}
      {/* <ThemedText style={styles.infoText}>
        Eco-Score: {productInfo.ecoscore_score || "N/A"}
      </ThemedText> */}
      {hasNutritionalInfo && (
        <View style={styles.macroContainer}>
          <View style={styles.caloriesContainer}>
            <ThemedText style={styles.caloriesText}>
              {calculatedCalories}
            </ThemedText>
            <ThemedText style={styles.caloriesUnit}>kcal</ThemedText>
          </View>
          <View style={styles.macroCircles}>
            <MacroCircle
              label="Protein"
              value={calculatedProtein}
              color="#ff6b6b"
            />
            <MacroCircle
              label="Carbs"
              value={calculatedCarbs}
              color="#4ecdc4"
            />
            <MacroCircle label="Fat" value={calculatedFat} color="#feca57" />
          </View>
        </View>
      )}
      <View style={styles.customServingContainer}>
        <ThemedText style={styles.infoText}>
          Custom Serving Size (grams):
        </ThemedText>
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={() => handleServingSizeChange(servingSize - 1)}
          >
            <ThemedText style={styles.changeServingSizeButton}>-</ThemedText>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={servingSize.toString()}
            keyboardType="numeric"
            onChangeText={(text) => handleServingSizeChange(Number(text))}
          />
          <TouchableOpacity
            onPress={() => handleServingSizeChange(servingSize + 1)}
          >
            <ThemedText style={styles.changeServingSizeButton}>+</ThemedText>
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
    </ScrollView>
  );
}

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
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    width: 100,
    textAlign: "center",
    fontSize: 20,
    color: "#ffffff",
    backgroundColor: "#494c4d",
    marginHorizontal: 20,
  },
  changeServingSizeButton: {
    fontSize: 30,
    color: "#ff3366",
    paddingHorizontal: 20,
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
});
