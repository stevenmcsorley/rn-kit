export interface ProductInfo {
  product_name: string;
  brands: string;
  image_url?: string;
  quantity?: string;
  ingredients_text?: string;
  nutrition_grades_tags?: string[];
  ecoscore_score?: number;
  serving_quantity?: number;
  serving_size?: string;
  serving_quantity_unit?: string;
  nutriments: {
    "energy-kcal_100g"?: number;
    "energy-kcal_serving"?: number;
    proteins_100g?: number;
    proteins_serving?: number;
    carbohydrates_100g?: number;
    carbohydrates_serving?: number;
    fat_100g?: number;
    fat_serving?: number;
    "saturated-fat_100g"?: number;
    "saturated-fat_serving"?: number;
    "polyunsaturated-fat_100g"?: number;
    "polyunsaturated-fat_serving"?: number;
    "monounsaturated-fat_100g"?: number;
    "monounsaturated-fat_serving"?: number;
    cholesterol_100g?: number;
    cholesterol_serving?: number;
    sodium_100g?: number;
    sodium_serving?: number;
    fiber_100g?: number;
    fiber_serving?: number;
    sugars_100g?: number;
    sugars_serving?: number;
  };
}

export async function fetchProductInfo(
  barcode: string
): Promise<ProductInfo | null> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.net/api/v3/product/${barcode}?cc=us&lc=en&fields=product_name,brands,image_url,quantity,ingredients_text,nutrition_grades_tags,ecoscore_score,serving_quantity,serving_size,serving_quantity_unit,nutriments`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.status === 404) {
      // Product not found, return null instead of throwing an error
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("response", result);

    if (!result.product) {
      return null;
    }

    return result.product;
  } catch (error) {
    console.error("Error fetching product info:", error);
    return null;
  }
}
