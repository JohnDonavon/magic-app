import { View, Text, StyleSheet, Button, Image, ActivityIndicator, Pressable } from "react-native";
import { useState } from "react";
import ScryfallClient from "../../src/lib/scryfall/client";
import { ScryfallCard } from "../../src/lib/scryfall/types";

export default function HomeScreen() {
  const [card, setCard] = useState<ScryfallCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFace, setCurrentFace] = useState(0);

  const fetchRandomCard = async () => {
    setLoading(true);
    setError(null);
    setCurrentFace(0);
    try {
      const scryfall = ScryfallClient.getInstance();
      const randomCard = await scryfall.getRandomCard();
      if (typeof randomCard === 'object' && randomCard !== null && 'name' in randomCard) {
        setCard(randomCard as ScryfallCard);
      } else {
        setError("Unexpected response from Scryfall API.");
        setCard(null);
      }
    } catch (err) {
      setError("Failed to fetch card. Try again!");
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    if (card && card.card_faces && card.card_faces.length > 1) {
      setCurrentFace((prev) => (prev === 0 ? 1 : 0));
    }
  };

  let cardImage: string | null = null;
  let cardName: string | null = null;
  let isDoubleFaced = false;
  let hasImage = false;
  if (card) {
    if (card.card_faces && card.card_faces.length > 1) {
      isDoubleFaced = true;
      const face = card.card_faces[currentFace];
      cardImage = face.image_uris?.normal || null;
      cardName = face.name;
      hasImage = !!cardImage;
    } else {
      cardImage = card.image_uris?.normal || null;
      cardName = card.name;
      hasImage = !!cardImage;
    }
  }

  return (
    <View style={styles.container}>
      <Button title="Show Me a Random Card!" onPress={fetchRandomCard} />
      {loading && <ActivityIndicator size="large" color="#634CFF" style={{ margin: 20 }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {card && (
        <View style={styles.cardContainer}>
          {hasImage ? (
            <Image source={{ uri: cardImage! }} style={styles.cardImage} resizeMode="contain" />
          ) : (
            <Text style={styles.noImageText}>No image available</Text>
          )}
          <Text style={styles.cardName}>{cardName}</Text>
          {isDoubleFaced && (
            <Pressable style={styles.flipButton} onPress={handleFlip}>
              <Text style={styles.flipButtonText}>Flip Card</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#343242",
  },
  cardContainer: {
    marginTop: 24,
    alignItems: "center",
    backgroundColor: "#f5f5fa",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: 240,
    height: 340,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#e0e0e0",
  },
  cardName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#634CFF",
    textAlign: "center",
  },
  noImageText: {
    fontSize: 18,
    color: "#888",
    marginBottom: 12,
    textAlign: "center",
  },
  error: {
    color: "#d32f2f",
    marginTop: 16,
    fontSize: 16,
  },
  flipButton: {
    marginTop: 12,
    backgroundColor: '#634CFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  flipButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
