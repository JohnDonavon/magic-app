import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { ScryfallCard } from "../../src/lib/scryfall/types";
import { CardsTable } from "../../src/database/repository";

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedCards, setScannedCards] = useState<ScryfallCard[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    (async () => {
      const libraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasPermission((permission?.granted ?? false) && libraryStatus.status === 'granted');
    })();
  }, [permission]);

  const handleCardDetected = async (card: ScryfallCard) => {
    setScannedCards(prev => {
      // Check if card is already in the list
      if (prev.some(c => c.id === card.id)) return prev;
      return [...prev, card];
    });
  };

  const handleAddToCollection = async (card: ScryfallCard) => {
    try {
      const now = Date.now();
      await CardsTable.insert({
        ...card,
        created_at: now,
        updated_at: now,
      });
      // Remove from scanned list
      setScannedCards(prev => prev.filter(c => c.id !== card.id));
    } catch (error) {
      console.error("Error adding card to collection:", error);
    }
  };

  const handleRemoveCard = (cardId: string) => {
    setScannedCards(prev => prev.filter(card => card.id !== cardId));
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      {isScanning ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          active={true}
        >
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Position a card in the frame</Text>
          </View>
        </CameraView>
      ) : (
        <FlatList
          data={scannedCards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardItem}>
              <Image
                source={{ uri: item.image_uris?.normal }}
                style={styles.cardImage}
                resizeMode="contain"
              />
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleAddToCollection(item)}
                >
                  <Text style={styles.buttonText}>Add to Collection</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={() => handleRemoveCard(item.id)}
                >
                  <Text style={styles.buttonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No cards scanned yet</Text>
          }
        />
      )}
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => setIsScanning(prev => !prev)}
      >
        <Text style={styles.buttonText}>
          {isScanning ? 'View Scanned Cards' : 'Back to Scanner'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  toggleButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardItem: {
    margin: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  cardImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#f44336',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
}); 