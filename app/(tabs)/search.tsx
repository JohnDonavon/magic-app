import { View, Text, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, FlatList, Image, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import ScryfallClient from "../../src/lib/scryfall/client";
import { ScryfallCard, SearchOptions } from "../../src/lib/scryfall/types";

const scryfall = ScryfallClient.getInstance();

export default function SearchScreen() {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<ScryfallCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async (text: string) => {
    setSearchText(text);
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const options: SearchOptions = { q: text };
      const response = await scryfall.searchCards(options);
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCardPress = (card: ScryfallCard) => {
    router.push({
      pathname: "/card-details",
      params: { card: JSON.stringify(card) }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for cards..."
            value={searchText}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={suggestions}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableWithoutFeedback onPress={() => handleCardPress(item)}>
                <View style={styles.cardContainer}>
                  <Image
                    source={{ 
                      uri: item.card_faces?.[0]?.image_uris?.normal || 
                           item.image_uris?.normal 
                    }}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </View>
              </TouchableWithoutFeedback>
            )}
            contentContainerStyle={styles.suggestionsContainer}
            columnWrapperStyle={styles.columnWrapper}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  suggestionsContainer: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    margin: 4,
    aspectRatio: 0.7,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
}); 