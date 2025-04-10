import * as SQLite from 'expo-sqlite';
import { Card, Deck, DeckCard } from './models';

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
      oracle_id TEXT,
      multiverse_ids TEXT,
      mtgo_id INTEGER,
      mtgo_foil_id INTEGER,
      tcgplayer_id INTEGER,
      cardmarket_id INTEGER,
      name TEXT NOT NULL,
      lang TEXT,
      released_at TEXT,
      uri TEXT,
      scryfall_uri TEXT,
      layout TEXT,
      highres_image BOOLEAN,
      image_status TEXT,
      image_uris TEXT,
      mana_cost TEXT,
      cmc REAL,
      type_line TEXT,
      oracle_text TEXT,
      power TEXT,
      toughness TEXT,
      colors TEXT,
      color_identity TEXT,
      keywords TEXT,
      legalities TEXT,
      games TEXT,
      reserved BOOLEAN,
      finishes TEXT,
      oversized BOOLEAN,
      promo BOOLEAN,
      reprint BOOLEAN,
      variation BOOLEAN,
      set_id TEXT,
      set TEXT,
      set_name TEXT,
      set_type TEXT,
      set_uri TEXT,
      set_search_uri TEXT,
      scryfall_set_uri TEXT,
      rulings_uri TEXT,
      prints_search_uri TEXT,
      collector_number TEXT,
      digital BOOLEAN,
      rarity TEXT,
      card_back_id TEXT,
      artist TEXT,
      artist_ids TEXT,
      illustration_id TEXT,
      border_color TEXT,
      frame TEXT,
      frame_effects TEXT,
      security_stamp TEXT,
      full_art BOOLEAN,
      textless BOOLEAN,
      booster BOOLEAN,
      story_spotlight BOOLEAN,
      edhrec_rank INTEGER,
      penny_rank INTEGER,
      prices TEXT,
      related_uris TEXT,
      purchase_uris TEXT,
      card_faces TEXT,
      all_parts TEXT,
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
    `INSERT INTO cards (
      id, oracle_id, multiverse_ids, mtgo_id, mtgo_foil_id, tcgplayer_id, cardmarket_id,
      name, lang, released_at, uri, scryfall_uri, layout, highres_image, image_status,
      image_uris, mana_cost, cmc, type_line, oracle_text, power, toughness, colors,
      color_identity, keywords, legalities, games, reserved, finishes,
      oversized, promo, reprint, variation, set_id, set, set_name, set_type, set_uri,
      set_search_uri, scryfall_set_uri, rulings_uri, prints_search_uri, collector_number,
      digital, rarity, card_back_id, artist, artist_ids, illustration_id, border_color,
      frame, frame_effects, security_stamp, full_art, textless, booster, story_spotlight,
      edhrec_rank, penny_rank, prices, related_uris, purchase_uris, card_faces, all_parts,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )`
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

export const insertCard = async (card: Card): Promise<void> => {
  try {
    if (!insertCardStmt) throw new Error('Database not initialized');
    await insertCardStmt.executeAsync([
      card.id,
      card.oracle_id || null,
      JSON.stringify(card.multiverse_ids || []),
      card.mtgo_id || null,
      card.mtgo_foil_id || null,
      card.tcgplayer_id || null,
      card.cardmarket_id || null,
      card.name,
      card.lang || null,
      card.released_at || null,
      card.uri || null,
      card.scryfall_uri || null,
      card.layout || null,
      card.highres_image || false,
      card.image_status || null,
      JSON.stringify(card.image_uris || {}),
      card.mana_cost || null,
      card.cmc || null,
      card.type_line || null,
      card.oracle_text || null,
      card.power || null,
      card.toughness || null,
      JSON.stringify(card.colors || []),
      JSON.stringify(card.color_identity || []),
      JSON.stringify(card.keywords || []),
      JSON.stringify(card.legalities || {}),
      JSON.stringify(card.games || []),
      card.reserved || false,
      JSON.stringify(card.finishes || []),
      card.oversized || false,
      card.promo || false,
      card.reprint || false,
      card.variation || false,
      card.set_id || null,
      card.set || null,
      card.set_name || null,
      card.set_type || null,
      card.set_uri || null,
      card.set_search_uri || null,
      card.scryfall_set_uri || null,
      card.rulings_uri || null,
      card.prints_search_uri || null,
      card.collector_number || null,
      card.digital || false,
      card.rarity || null,
      card.card_back_id || null,
      card.artist || null,
      JSON.stringify(card.artist_ids || []),
      card.illustration_id || null,
      card.border_color || null,
      card.frame || null,
      JSON.stringify(card.frame_effects || []),
      card.security_stamp || null,
      card.full_art || false,
      card.textless || false,
      card.booster || false,
      card.story_spotlight || false,
      card.edhrec_rank || null,
      card.penny_rank || null,
      JSON.stringify(card.prices || {}),
      JSON.stringify(card.related_uris || {}),
      JSON.stringify(card.purchase_uris || {}),
      JSON.stringify(card.card_faces || []),
      JSON.stringify(card.all_parts || []),
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