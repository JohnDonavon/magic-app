import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { ScryfallCard } from "../src/lib/scryfall/types";
import { useState } from "react";
import Icon from "../src/components/Icon";

export default function CardDetailsScreen() {
  const { card } = useLocalSearchParams();
  const cardData = JSON.parse(card as string) as ScryfallCard;
  const [currentFace, setCurrentFace] = useState(0);

  const isDualFaced = Boolean(cardData.card_faces?.length && cardData.card_faces.length > 1);
  const currentCardFace = isDualFaced ? cardData.card_faces?.[currentFace] : cardData;

  const handleFlip = () => {
    if (isDualFaced) {
      setCurrentFace(currentFace === 0 ? 1 : 0);
    }
  };

  if (!currentCardFace) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Details",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
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
              style={styles.transformButton}
              onPress={handleFlip}
            >
              <Icon name="transform" size={24} color="#fff" />
              <Text style={styles.transformButtonText}>
                Transform
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
    </>
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
  transformButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#4a4a4a",
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  transformButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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