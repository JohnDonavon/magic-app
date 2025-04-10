import { View, Text, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, FlatList, Image, ActivityIndicator, Pressable } from "react-native";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "expo-router";
import ScryfallClient from "../../src/lib/scryfall/client";
import { ScryfallCard, SearchOptions } from "../../src/lib/scryfall/types";
import Svg, { Path } from 'react-native-svg';

const scryfall = ScryfallClient.getInstance();

export default function SearchScreen() {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<ScryfallCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [transformedCards, setTransformedCards] = useState<Set<string>>(new Set());
  const latestRequestId = useRef<number>(0);
  const router = useRouter();

  const handleSearch = useCallback(async (text: string) => {
    setSearchText(text);
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const currentRequestId = ++latestRequestId.current;

    try {
      const options: SearchOptions = { q: text };
      const response = await scryfall.searchCards(options);
      
      // Only update if this is still the latest request
      if (currentRequestId === latestRequestId.current) {
        setSuggestions(response.data);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      // Only clear suggestions if this is still the latest request
      if (currentRequestId === latestRequestId.current) {
        setSuggestions([]);
      }
    } finally {
      // Only update loading state if this is still the latest request
      if (currentRequestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const handleCardPress = (card: ScryfallCard) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    router.push({
      pathname: "/card-details",
      params: { card: JSON.stringify(card) }
    });
    
    // Reset the navigation lock after a short delay
    setTimeout(() => {
      setIsNavigating(false);
    }, 500);
  };

  const handleTransform = (cardId: string, event: any) => {
    event.stopPropagation();
    setTransformedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const TransformButton = ({ onPress }: { onPress: (event: any) => void }) => (
    <Pressable style={styles.transformButton} onPress={onPress}>
      <Svg viewBox="0 0 1024 1024" width="28" height="28">
        <Path
          fill="#343242"
          d="M884.3,357.6c116.8,117.7,151.7,277-362.2,320V496.4L243.2,763.8L522,1031.3V860.8C828.8,839.4,1244.9,604.5,884.3,357.6z"
        />
        <Path
          fill="#343242"
          d="M557.8,288.2v138.4l230.8-213.4L557.8,0v142.8c-309.2,15.6-792.1,253.6-426.5,503.8C13.6,527.9,30,330.1,557.8,288.2z"
        />
      </Svg>
    </Pressable>
  );

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
                      uri: item.card_faces ? (
                        transformedCards.has(item.id)
                          ? item.card_faces[1].image_uris?.normal
                          : item.card_faces[0].image_uris?.normal
                      ) : item.image_uris?.normal 
                    }}
                    style={styles.cardImage as any}
                    resizeMode="contain"
                  />
                  {item.card_faces && (
                    <TransformButton onPress={(e) => handleTransform(item.id, e)} />
                  )}
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
    position: 'relative',
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  transformButton: {
    position: 'absolute',
    opacity: 0.60,
    backgroundColor: 'white',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#343242',
    height: 44,
    width: 44,
    top: '26%',
    left: '75%',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 