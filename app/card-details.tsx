import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScryfallCard } from "../src/lib/scryfall/types";
import { useState } from "react";

export default function CardDetailsScreen() {
  const { card } = useLocalSearchParams();
  const cardData = JSON.parse(card as string) as ScryfallCard;
  const [currentFace, setCurrentFace] = useState(0);

  const isDualFaced = cardData.card_faces && cardData.card_faces.length > 1;
  const currentCardFace = isDualFaced ? cardData.card_faces[currentFace] : cardData;

  const handleFlip = () => {
    if (isDualFaced) {
      setCurrentFace(currentFace === 0 ? 1 : 0);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ 
            uri: currentCardFace.image_uris?.normal || 
                 cardData.image_uris?.normal 
          }}
          style={styles.cardImage}
          resizeMode="contain"
        />
        {isDualFaced && (
          <TouchableOpacity 
            style={styles.flipButton}
            onPress={handleFlip}
          >
            <Text style={styles.flipButtonText}>
              {currentFace === 0 ? 'Show Back' : 'Show Front'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{currentCardFace.name}</Text>
        <Text style={styles.type}>{currentCardFace.type_line}</Text>
        
        {currentCardFace.mana_cost && (
          <Text style={styles.manaCost}>{currentCardFace.mana_cost}</Text>
        )}

        <Text style={styles.oracleText}>{currentCardFace.oracle_text}</Text>

        {currentCardFace.power && currentCardFace.toughness && (
          <Text style={styles.powerToughness}>
            {currentCardFace.power}/{currentCardFace.toughness}
          </Text>
        )}

        {currentCardFace.loyalty && (
          <Text style={styles.loyalty}>Loyalty: {currentCardFace.loyalty}</Text>
        )}

        <View style={styles.setInfo}>
          <Text style={styles.setName}>{cardData.set_name}</Text>
          <Text style={styles.setNumber}>
            {cardData.set.toUpperCase()} {cardData.collector_number}
          </Text>
        </View>

        {currentCardFace.flavor_text && (
          <Text style={styles.flavorText}>{currentCardFace.flavor_text}</Text>
        )}

        <Text style={styles.artist}>Illustrated by {cardData.artist}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    alignItems: "center",
    padding: 16,
  },
  cardImage: {
    width: "100%",
    height: 400,
    borderRadius: 8,
  },
  flipButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f4511e",
    borderRadius: 8,
  },
  flipButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  detailsContainer: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  type: {
    fontSize: 18,
    color: "#666",
    marginBottom: 8,
  },
  manaCost: {
    fontSize: 16,
    marginBottom: 16,
  },
  oracleText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  powerToughness: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  loyalty: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  setInfo: {
    marginBottom: 16,
  },
  setName: {
    fontSize: 16,
    color: "#666",
  },
  setNumber: {
    fontSize: 16,
    color: "#666",
  },
  flavorText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 16,
    lineHeight: 24,
  },
  artist: {
    fontSize: 14,
    color: "#666",
  },
}); 