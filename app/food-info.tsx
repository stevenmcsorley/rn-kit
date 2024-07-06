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
    setServingSize(size);
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
      <ThemedText style={styles.infoText}>
        Quantity: {productInfo.quantity}
      </ThemedText>
      <ThemedText style={styles.infoText}>
        Ingredients: {productInfo.ingredients_text}
      </ThemedText>
      <ThemedText style={styles.infoText}>
        Nutrition Grade: {productInfo.nutrition_grades_tags}
      </ThemedText>
      <ThemedText style={styles.infoText}>
        Eco-Score: {productInfo.ecoscore_score || "N/A"}
      </ThemedText>
      <ThemedText style={styles.infoText}>
        Calories (100g): {productInfo.nutriments["energy-kcal_100g"] || "N/A"}{" "}
        kcal
      </ThemedText>
      {productInfo.nutriments["energy-kcal_serving"] && (
        <ThemedText style={styles.infoText}>
          Calories (Serving): {productInfo.nutriments["energy-kcal_serving"]}{" "}
          kcal
        </ThemedText>
      )}
      <ThemedText style={styles.infoText}>
        Protein (100g): {productInfo.nutriments.proteins_100g || "N/A"} g
      </ThemedText>
      {productInfo.nutriments.proteins_serving && (
        <ThemedText style={styles.infoText}>
          Protein (Serving): {productInfo.nutriments.proteins_serving} g
        </ThemedText>
      )}
      <ThemedText style={styles.infoText}>
        Carbs (100g): {productInfo.nutriments.carbohydrates_100g || "N/A"} g
      </ThemedText>
      {productInfo.nutriments.carbohydrates_serving && (
        <ThemedText style={styles.infoText}>
          Carbs (Serving): {productInfo.nutriments.carbohydrates_serving} g
        </ThemedText>
      )}
      <ThemedText style={styles.infoText}>
        Fat (100g): {productInfo.nutriments.fat_100g || "N/A"} g
      </ThemedText>
      {productInfo.nutriments.fat_serving && (
        <ThemedText style={styles.infoText}>
          Fat (Serving): {productInfo.nutriments.fat_serving} g
        </ThemedText>
      )}
      {hasNutritionalInfo ? (
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
          <ThemedText style={styles.infoText}>
            Protein: {calculatedProtein} g
          </ThemedText>
          <ThemedText style={styles.infoText}>
            Carbs: {calculatedCarbs} g
          </ThemedText>
          <ThemedText style={styles.infoText}>
            Fat: {calculatedFat} g
          </ThemedText>
          <TouchableOpacity
            style={[styles.addButton, styles.addButtonMargin]}
            onPress={() => addToDiary("serving", servingSize)}
          >
            <ThemedText style={styles.addButtonText}>
              Add Custom Serving
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ThemedText style={styles.infoText}>
          Not enough nutritional information available.
        </ThemedText>
      )}
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
  addButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
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
});
