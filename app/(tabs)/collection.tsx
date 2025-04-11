import { View, Text, StyleSheet, FlatList, TextInput, Image, TouchableOpacity, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { CardsTable } from "../../src/database/repository";
import { Card } from "../../src/database/models";
import { router } from "expo-router";
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

interface CardWithFlipState extends Card {
  isFlipped?: boolean;
}

export default function CollectionScreen() {
  const [cards, setCards] = useState<CardWithFlipState[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardWithFlipState[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [transformedCards, setTransformedCards] = useState<Set<string>>(new Set());

  const loadCards = async () => {
    try {
      const allCards = await CardsTable.getAll();
      const cardsWithFlipState = allCards.map(card => ({
        ...card,
        isFlipped: false
      }));
      setCards(cardsWithFlipState);
      setFilteredCards(cardsWithFlipState);
    } catch (error) {
      console.error("Error loading cards:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCards(cards);
    } else {
      const filtered = cards.filter(card => 
        card.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCards(filtered);
    }
  }, [searchQuery, cards]);

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

  const getCardImage = (card: CardWithFlipState) => {
    if (card.card_faces && card.card_faces.length > 0) {
      return transformedCards.has(card.id)
        ? card.card_faces[1].image_uris?.normal
        : card.card_faces[0].image_uris?.normal;
    }
    return card.image_uris?.normal;
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

  const renderCard = ({ item }: { item: CardWithFlipState }) => {
    const imageUri = getCardImage(item);
    const isDoubleFaced = item.card_faces && item.card_faces.length > 1;
    
    return (
      <TouchableOpacity 
        style={styles.cardContainer}
        onPress={() => router.push(`/card/${item.id}`)}
      >
        <Image 
          source={{ uri: imageUri }} 
          style={styles.cardImage}
          resizeMode="contain"
        />
        {isDoubleFaced && (
          <TransformButton onPress={(e) => handleTransform(item.id, e)} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search cards..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <FlatList
        data={filteredCards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.suggestionsContainer}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? "No cards found" : "No cards in collection"}
            </Text>
          </View>
        }
      />
    </View>
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
}); 