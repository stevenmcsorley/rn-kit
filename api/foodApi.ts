interface ProductInfo {
  product_name: string;
  brands: string;
  image_url?: string;
  quantity?: string;
  ingredients_text?: string;
  nutrition_grades_tags?: string[];
  ecoscore_score?: number;
  nutriments: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
}

export async function fetchProductInfo(barcode: string): Promise<ProductInfo> {
  const response = await fetch(
    `https://world.openfoodfacts.net/api/v3/product/${barcode}?cc=us&lc=en`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (!result.product) {
    throw new Error("Product not found");
  }

  return result.product;
}
