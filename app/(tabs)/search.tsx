import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ThemedText } from "@/components/ThemedText";

const commonSearchTerms = [
  "milk",
  "bread",
  "eggs",
  "cheese",
  "butter",
  "yogurt",
  "cereal",
  "juice",
  "chocolate",
  "coffee",
  "peanut butter",
  "peanut",
  "peas",
];

interface SearchResult {
  code: string;
  product_name: string;
  image_small_url: string;
  brands: string;
}

interface SearchResponse {
  count: number;
  page: number;
  page_count: number;
  page_size: number;
  products: SearchResult[];
}

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showPagination, setShowPagination] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [noResults, setNoResults] = useState(false);
  const router = useRouter();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    return (...args: any[]) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const searchProducts = async (
    searchQuery: string,
    page: number,
    resetPage: boolean = true
  ) => {
    if (searchQuery.trim().length < 3) return;

    setIsLoading(true);
    const currentPage = resetPage ? 1 : page;
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/search?countries_tags=en:united-kingdom&categories_tags=${encodeURIComponent(
          searchQuery
        )}&page_size=10&page=${currentPage}&fields=code,product_name,brands,image_small_url`
      );
      console.log("currentPage", currentPage);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Expected JSON response");
      }

      const data: SearchResponse = await response.json();

      if (data.products.length === 0) {
        setNoResults(true);
      } else {
        setNoResults(false);
      }

      setResults(resetPage ? data.products : [...results, ...data.products]);
      setTotalPages(Math.ceil(data.count / data.page_size));
      setShowPagination(data.count > 10);
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreResults = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      searchProducts(searchTerm, nextPage, false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSuggestions(
        commonSearchTerms.filter((t) =>
          t.toLowerCase().includes(term.toLowerCase())
        )
      );
    }, 300),
    []
  );

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
    if (term.length >= 3) {
      debouncedSearch(term);
    } else {
      setSuggestions([]);
      setResults([]);
      setShowPagination(false);
      setIsLoading(false);
    }
  };

  const handleSearchButtonClick = () => {
    setPage(1);
    setResults([]);
    searchProducts(searchTerm, 1, true);
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => router.push(`/food-info?barcode=${item.code}`)}
    >
      <Image
        source={{ uri: item.image_small_url }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName}>{item.product_name}</ThemedText>
        <ThemedText style={styles.brandName}>{item.brands}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => {
    if (!isLoading && noResults) {
      return (
        <ThemedText style={styles.emptyText}>
          No results found. Try searching for a product.
        </ThemedText>
      );
    }
    if (!isLoading && !noResults) {
      return (
        <ThemedText style={styles.emptyText}>
          Click search to see results.
        </ThemedText>
      );
    }
    return null;
  };

  const ListFooterComponent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#ff3366" />;
    }
    if (showPagination && !isLoading && page < totalPages) {
      return (
        <TouchableOpacity
          style={styles.paginationButton}
          onPress={loadMoreResults}
        >
          <ThemedText style={styles.paginationButtonText}>Load More</ThemedText>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchTerm(suggestion);
    setPage(1);
    setSuggestions([]);
    searchProducts(suggestion, 1, true);
  };

  useFocusEffect(
    useCallback(() => {
      // Reset search state when the screen is focused
      setSearchTerm("");
      setResults([]);
      setIsLoading(false);
      setPage(1);
      setTotalPages(0);
      setShowPagination(false);
      setSuggestions([]);
      setNoResults(false);
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a product..."
          placeholderTextColor="#999"
          value={searchTerm}
          onChangeText={handleSearchTermChange}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchButtonClick}
        >
          <ThemedText style={styles.searchButtonText}>Search</ThemedText>
        </TouchableOpacity>
      </View>
      {suggestions.length > 0 && (
        <ScrollView style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <ThemedText style={styles.suggestionText}>
                {suggestion}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.code + index}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#242423",
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#2D2F34",
    color: "#ffffff",
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: "#ff3366",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  searchButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  suggestionsContainer: {
    backgroundColor: "#2D2F34",
    borderRadius: 10,
    marginBottom: 10,
  },
  suggestionText: {
    padding: 10,
    color: "#ffffff",
  },
  resultItem: {
    flexDirection: "row",
    backgroundColor: "#2D2F34",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  brandName: {
    fontSize: 14,
    color: "#aaaaaa",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#aaaaaa",
  },
  paginationButton: {
    backgroundColor: "#ff3366",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  paginationButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
