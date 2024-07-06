import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function FoodInfoScreen() {
  const { barcode } = useLocalSearchParams();
  const [productInfo, setProductInfo] = useState<any>(null);
  const router = useRouter();
  const db = useSQLiteContext();

  useEffect(() => {
    fetchProductInfo();
  }, [barcode]);

  const fetchProductInfo = async () => {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.net/api/v3/product/${barcode}?cc=us&lc=en`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      const result = await response.json();
      if (result && result.product) {
        setProductInfo(result.product);
      } else {
        Alert.alert("Product not found");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      Alert.alert("Failed to fetch product data");
      router.back();
    }
  };

  const addToDatabase = async () => {
    if (productInfo) {
      try {
        await db.runAsync(
          "INSERT INTO items (name, brand, calories, protein, carbs, fat, date, barcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            productInfo.product_name,
            productInfo.brands,
            productInfo.nutriments["energy-kcal_100g"] || 0,
            productInfo.nutriments.proteins_100g || 0,
            productInfo.nutriments.carbohydrates_100g || 0,
            productInfo.nutriments.fat_100g || 0,
            new Date().toISOString(),
            barcode as string,
          ]
        );
        Alert.alert("Success", "Item added to diary", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } catch (error) {
        console.error("Error adding item to database:", error);
        Alert.alert("Error", "Failed to add item to diary");
      }
    }
  };

  if (!productInfo) {
    return <ThemedText>Loading...</ThemedText>;
  }

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
        Calories: {productInfo.nutriments["energy-kcal_100g"] || "N/A"} kcal
      </ThemedText>
      <ThemedText style={styles.infoText}>
        Protein: {productInfo.nutriments.proteins_100g || "N/A"} g
      </ThemedText>
      <ThemedText style={styles.infoText}>
        Carbs: {productInfo.nutriments.carbohydrates_100g || "N/A"} g
      </ThemedText>
      <ThemedText style={styles.infoText}>
        Fat: {productInfo.nutriments.fat_100g || "N/A"} g
      </ThemedText>
      <TouchableOpacity style={styles.addButton} onPress={addToDatabase}>
        <ThemedText style={styles.addButtonText}>Add to Diary</ThemedText>
      </TouchableOpacity>
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
  addButton: {
    backgroundColor: "#ff3366",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
