import React from "react";
import { View, Text, StyleSheet, Pressable, Modal, TextInput, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { DecksTable } from "../../src/database/repository";
import { Deck } from "../../src/database/models";
import { router } from "expo-router";
import Svg, { Path } from 'react-native-svg';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function DecksScreen() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    setModalVisible(true);
    setName("");
    setDescription("");
    setFormat("");
    setError(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Deck name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const now = Date.now();
      const newDeck: Deck = {
        id: generateId(),
        name: name.trim(),
        description: description.trim() || undefined,
        format: format.trim() || undefined,
        created_at: now,
        updated_at: now,
      };
      await DecksTable.insert(newDeck);
      setModalVisible(false);
      setName("");
      setDescription("");
      setFormat("");
      setError(null);
      await loadDecks();
    } catch (e) {
      setError("Failed to create deck. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const EmptyIcon = () => (
    <Svg width="64" height="64" viewBox="0 0 24 24">
      <Path
        fill="#666666"
        d="M17,14H19V17H22V19H19V22H17V19H14V17H17V14M12,17V15H7V17H12M17,11H7V13H14.69C13.07,14.07 12,15.91 12,18C12,19.09 12.29,20.12 12.8,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H19A2,2 0 0,1 21,5V12.8C20.12,12.29 19.09,12 18,12L17,12.08V11M17,9V7H7V9H17Z"
      />
    </Svg>
  );

  const renderDeck = ({ item }: { item: Deck }) => (
    <Pressable style={styles.deckCard} onPress={() => {/* TODO: Navigate to deck details */}}>
      <Text style={styles.deckName}>{item.name}</Text>
      {item.description ? <Text style={styles.deckDescription}>{item.description}</Text> : null}
      {item.format ? <Text style={styles.deckFormat}>{item.format}</Text> : null}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {decks.length === 0 ? (
        <>
          <EmptyIcon />
          <Text style={styles.emptyText}>You don't have any decks</Text>
        </>
      ) : (
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          renderItem={renderDeck}
          contentContainerStyle={styles.deckList}
        />
      )}
      <Pressable 
        style={styles.createButton}
        onPress={handleCreate}
      >
        <Text style={styles.createButtonText}>＋ Create</Text>
      </Pressable>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Deck</Text>
            <TextInput
              style={styles.input}
              placeholder="Deck Name*"
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              style={styles.input}
              placeholder="Format (optional)"
              value={format}
              onChangeText={setFormat}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.submitButton, submitting && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    marginTop: 16,
    marginBottom: 16,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  deckList: {
    paddingVertical: 24,
    paddingHorizontal: 8,
    width: "100%",
    alignItems: "center",
  },
  deckCard: {
    backgroundColor: "#232325",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    width: "96%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  deckName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  deckDescription: {
    color: "#bbb",
    fontSize: 15,
    marginBottom: 2,
  },
  deckFormat: {
    color: "#8e8eff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#232325",
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "stretch",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#2C2C2E",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  error: {
    color: "#ff5252",
    marginBottom: 8,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#444",
  },
  submitButton: {
    backgroundColor: "#634CFF",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
}); 