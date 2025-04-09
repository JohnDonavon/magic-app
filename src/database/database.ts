import * as SQLite from 'expo-sqlite';

// Open the database
const db = SQLite.openDatabaseSync('mtg_overseer.db');

// Prepared statements for common operations
let insertCardStmt: Awaited<ReturnType<typeof db.prepareAsync>> | null = null;
let insertDeckStmt: Awaited<ReturnType<typeof db.prepareAsync>> | null = null;
let insertDeckCardStmt: Awaited<ReturnType<typeof db.prepareAsync>> | null = null;

export const initDatabase = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mana_cost TEXT,
      cmc INTEGER,
      type_line TEXT,
      oracle_text TEXT,
      power TEXT,
      toughness TEXT,
      colors TEXT,
      color_identity TEXT,
      set TEXT,
      rarity TEXT,
      image_uris TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      format TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deck_cards (
      id TEXT PRIMARY KEY,
      deck_id TEXT NOT NULL,
      card_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      is_sideboard BOOLEAN NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE,
      FOREIGN KEY (card_id) REFERENCES cards (id) ON DELETE CASCADE
    );
  `);

  // Prepare statements for common operations
  insertCardStmt = await db.prepareAsync(
    'INSERT INTO cards (id, name, mana_cost, cmc, type_line, oracle_text, power, toughness, colors, color_identity, set, rarity, image_uris, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  insertDeckStmt = await db.prepareAsync(
    'INSERT INTO decks (id, name, description, format, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  );

  insertDeckCardStmt = await db.prepareAsync(
    'INSERT INTO deck_cards (id, deck_id, card_id, quantity, is_sideboard, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
};

export const executeQuery = async <T>(query: string, params: any[] = []): Promise<T[]> => {
  try {
    const results = await db.getAllAsync(query, params);
    return results as T[];
  } catch (error) {
    throw error;
  }
};

export const executeUpdate = async (query: string, params: any[] = []): Promise<number> => {
  try {
    const result = await db.runAsync(query, params);
    return result.changes;
  } catch (error) {
    throw error;
  }
};

interface Card {
  id: string;
  name: string;
  mana_cost?: string;
  cmc?: number;
  type_line?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  colors?: string;
  color_identity?: string;
  set?: string;
  rarity?: string;
  image_uris?: string;
  created_at: number;
  updated_at: number;
}

interface Deck {
  id: string;
  name: string;
  description?: string;
  format?: string;
  created_at: number;
  updated_at: number;
}

interface DeckCard {
  id: string;
  deck_id: string;
  card_id: string;
  quantity: number;
  is_sideboard: boolean;
  created_at: number;
  updated_at: number;
}

export const insertCard = async (card: Card): Promise<void> => {
  try {
    if (!insertCardStmt) throw new Error('Database not initialized');
    await insertCardStmt.executeAsync([
      card.id,
      card.name,
      card.mana_cost || null,
      card.cmc || null,
      card.type_line || null,
      card.oracle_text || null,
      card.power || null,
      card.toughness || null,
      card.colors || null,
      card.color_identity || null,
      card.set || null,
      card.rarity || null,
      card.image_uris || null,
      card.created_at,
      card.updated_at
    ]);
  } catch (error) {
    throw error;
  }
};

export const insertDeck = async (deck: Deck): Promise<void> => {
  try {
    if (!insertDeckStmt) throw new Error('Database not initialized');
    await insertDeckStmt.executeAsync([
      deck.id,
      deck.name,
      deck.description || null,
      deck.format || null,
      deck.created_at,
      deck.updated_at
    ]);
  } catch (error) {
    throw error;
  }
};

export const insertDeckCard = async (deckCard: DeckCard): Promise<void> => {
  try {
    if (!insertDeckCardStmt) throw new Error('Database not initialized');
    await insertDeckCardStmt.executeAsync([
      deckCard.id,
      deckCard.deck_id,
      deckCard.card_id,
      deckCard.quantity,
      deckCard.is_sideboard ? 1 : 0,
      deckCard.created_at,
      deckCard.updated_at
    ]);
  } catch (error) {
    throw error;
  }
};

// Clean up prepared statements
export const cleanup = async () => {
  try {
    if (insertCardStmt) await insertCardStmt.finalizeAsync();
    if (insertDeckStmt) await insertDeckStmt.finalizeAsync();
    if (insertDeckCardStmt) await insertDeckCardStmt.finalizeAsync();
  } catch (error) {
    console.error('Error cleaning up prepared statements:', error);
  }
};

export default db; 