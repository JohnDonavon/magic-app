import { View, Text, StyleSheet, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { DecksTable } from "../../src/database/repository";
import { Deck } from "../../src/database/models";
import { router } from "expo-router";
import Svg, { Path } from 'react-native-svg';

export default function DecksScreen() {
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      const allDecks = await DecksTable.getAll();
      setDecks(allDecks);
    } catch (error) {
      console.error("Error loading decks:", error);
    }
  };

  const handleCreate = () => {
    // TODO: Navigate to deck creation screen
    console.log("Create deck");
  };

  const EmptyIcon = () => (
    <Svg width="64" height="64" viewBox="0 0 24 24">
      <Path
        fill="#666666"
        d="M17,14H19V17H22V19H19V22H17V19H14V17H17V14M12,17V15H7V17H12M17,11H7V13H14.69C13.07,14.07 12,15.91 12,18C12,19.09 12.29,20.12 12.8,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19A2,2 0 0,1 21,5V12.8C20.12,12.29 19.09,12 18,12L17,12.08V11M17,9V7H7V9H17Z"
      />
    </Svg>
  );

  if (decks.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyIcon />
        <Text style={styles.emptyText}>You don't have any decks</Text>
        <Pressable 
          style={styles.createButton}
          onPress={handleCreate}
        >
          <Text style={styles.createButtonText}>＋ Create</Text>
        </Pressable>
      </View>
    );
  }

  // TODO: Add deck list view
  return (
    <View style={styles.container}>
      <Text>Your decks will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1C1E",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: "#2C2C2E",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 140,
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
}); 