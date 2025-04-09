# MTG Overseer - Directory Structure

```
src/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── scan/          # Camera scanning interface
│   │   ├── collection/    # Card collection view
│   │   └── decks/         # Deck management
│   └── _layout.tsx        # Root layout with tab navigation
├── components/            # Reusable UI components
│   ├── cards/            # Card-related components
│   ├── decks/            # Deck-related components
│   └── common/           # Shared components
├── services/             # Business logic and API services
│   ├── camera/           # Camera and image processing
│   ├── recognition/      # Card recognition logic
│   └── api/              # External API integration (Scryfall)
├── database/             # Database models and operations
│   ├── schema/           # Database schemas
│   ├── migrations/       # Database migrations
│   └── queries/          # Database queries
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
├── constants/            # App constants and configuration
└── types/                # TypeScript type definitions
```

## Technical Architecture

### Core Technologies:
- **Expo Router**: For navigation and routing
- **Expo Camera**: For card scanning
- **WatermelonDB**: For local storage (SQLite-based, with great performance)
- **TensorFlow.js**: For on-device card recognition
- **Scryfall API**: For card data and images
- **React Native Reanimated**: For smooth animations
- **React Native Gesture Handler**: For touch interactions

### Key Features Implementation:

1. **Camera Scanning**:
   - Use Expo Camera with custom overlay for card alignment
   - Implement image preprocessing for better recognition
   - Add haptic feedback for successful scans

2. **Card Recognition**:
   - Initial implementation using Scryfall API for image matching
   - Future enhancement with TensorFlow.js for offline recognition
   - Cache recognized cards for offline use

3. **Local Storage**:
   - WatermelonDB for efficient local storage
   - Indexed fields for fast filtering and sorting
   - Batch operations for bulk imports

4. **UI/UX**:
   - Tab-based navigation for main features
   - Masonry grid for card collection
   - Gesture-based interactions for deck building
   - Dark mode support for better visibility

## Recommended Libraries:

```json
{
  "dependencies": {
    "@react-native-community/cameraroll": "^4.0.0",
    "@tensorflow/tfjs": "^4.17.0",
    "@tensorflow/tfjs-react-native": "^0.8.0",
    "expo-camera": "~14.0.3",
    "expo-image-manipulator": "~12.0.1",
    "expo-media-library": "~15.9.1",
    "react-native-reanimated": "~3.6.2",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-masonry-list": "^1.0.7",
    "react-native-vector-icons": "^10.0.0"
  }
}
``` 