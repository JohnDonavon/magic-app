import { Card, Deck, DeckCard } from './models';
import { sqLiteClient } from './setup';

interface ISQLQuery {
  sql: string;
  params: any[];
}

interface SQLResultSet {
  rows: {
    length: number;
    item: (index: number) => any;
    _array: any[];
  };
  insertId?: number;
  rowsAffected: number;
}

const executeQuery = async (query: ISQLQuery): Promise<SQLResultSet> => {
  const db = sqLiteClient.getDatabase();
  if (!db) {
    throw new Error('Database not connected');
  }
  
  const statement = await db.prepareAsync(query.sql);
  try {
    const result = await statement.executeAsync(query.params);
    const rows = await result.getAllAsync();
    return {
      rows: {
        length: rows.length,
        item: (index: number) => rows[index],
        _array: rows
      },
      insertId: result.lastInsertRowId,
      rowsAffected: result.changes
    };
  } finally {
    await statement.finalizeAsync();
  }
};

const executeQueries = async (queries: ISQLQuery[]): Promise<SQLResultSet[]> => {
  const db = sqLiteClient.getDatabase();
  if (!db) {
    throw new Error('Database not connected');
  }
  
  const allResults: SQLResultSet[] = [];
  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const query of queries) {
      const statement = await txn.prepareAsync(query.sql);
      try {
        const result = await statement.executeAsync(query.params);
        const rows = await result.getAllAsync();
        allResults.push({
          rows: {
            length: rows.length,
            item: (index: number) => rows[index],
            _array: rows
          },
          insertId: result.lastInsertRowId,
          rowsAffected: result.changes
        });
      } finally {
        await statement.finalizeAsync();
      }
    }
  });
  return allResults;
};

export const CardsTable = {
  insert: async (card: Card): Promise<void> => {
    const sql = `
      INSERT OR REPLACE INTO cards (
        id, oracle_id, multiverse_ids, mtgo_id, mtgo_foil_id, tcgplayer_id, cardmarket_id,
        name, lang, released_at, uri, scryfall_uri, layout, highres_image, image_status,
        image_uris, mana_cost, cmc, type_line, oracle_text, power, toughness, colors,
        color_identity, keywords, legalities, games, reserved, finishes,
        oversized, promo, reprint, variation, set_id, \`set\`, set_name, set_type, set_uri,
        set_search_uri, scryfall_set_uri, rulings_uri, prints_search_uri, collector_number,
        digital, rarity, card_back_id, artist, artist_ids, illustration_id, border_color,
        frame, frame_effects, security_stamp, full_art, textless, booster, story_spotlight,
        edhrec_rank, penny_rank, prices, related_uris, purchase_uris, card_faces, all_parts,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const query = {
      sql,
      params: [
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
        Date.now(), // created_at
        Date.now()  // updated_at
      ]
    };
    await executeQuery(query);
  },

  getById: async (id: string): Promise<Card | null> => {
    const query = {
      sql: 'SELECT * FROM cards WHERE id = ?',
      params: [id]
    };
    const results = await executeQuery(query);
    const card = results.rows.item(0) as Card | null;
    if (card) {
      // Parse JSON fields
      card.image_uris = card.image_uris ? JSON.parse(card.image_uris as unknown as string) : undefined;
      card.card_faces = card.card_faces ? JSON.parse(card.card_faces as unknown as string) : undefined;
      card.multiverse_ids = card.multiverse_ids ? JSON.parse(card.multiverse_ids as unknown as string) : undefined;
      card.colors = card.colors ? JSON.parse(card.colors as unknown as string) : undefined;
      card.color_identity = card.color_identity ? JSON.parse(card.color_identity as unknown as string) : undefined;
      card.keywords = card.keywords ? JSON.parse(card.keywords as unknown as string) : undefined;
      card.legalities = card.legalities ? JSON.parse(card.legalities as unknown as string) : undefined;
      card.games = card.games ? JSON.parse(card.games as unknown as string) : undefined;
      card.finishes = card.finishes ? JSON.parse(card.finishes as unknown as string) : undefined;
      card.artist_ids = card.artist_ids ? JSON.parse(card.artist_ids as unknown as string) : undefined;
      card.frame_effects = card.frame_effects ? JSON.parse(card.frame_effects as unknown as string) : undefined;
      card.prices = card.prices ? JSON.parse(card.prices as unknown as string) : undefined;
      card.related_uris = card.related_uris ? JSON.parse(card.related_uris as unknown as string) : undefined;
      card.purchase_uris = card.purchase_uris ? JSON.parse(card.purchase_uris as unknown as string) : undefined;
      card.all_parts = card.all_parts ? JSON.parse(card.all_parts as unknown as string) : undefined;
    }
    return card;
  },

  getAll: async (): Promise<Card[]> => {
    const query = {
      sql: 'SELECT * FROM cards',
      params: []
    };
    const results = await executeQuery(query);
    const cards: Card[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const card = results.rows.item(i) as Card;
      // Parse JSON fields
      card.image_uris = card.image_uris ? JSON.parse(card.image_uris as unknown as string) : undefined;
      card.card_faces = card.card_faces ? JSON.parse(card.card_faces as unknown as string) : undefined;
      card.multiverse_ids = card.multiverse_ids ? JSON.parse(card.multiverse_ids as unknown as string) : undefined;
      card.colors = card.colors ? JSON.parse(card.colors as unknown as string) : undefined;
      card.color_identity = card.color_identity ? JSON.parse(card.color_identity as unknown as string) : undefined;
      card.keywords = card.keywords ? JSON.parse(card.keywords as unknown as string) : undefined;
      card.legalities = card.legalities ? JSON.parse(card.legalities as unknown as string) : undefined;
      card.games = card.games ? JSON.parse(card.games as unknown as string) : undefined;
      card.finishes = card.finishes ? JSON.parse(card.finishes as unknown as string) : undefined;
      card.artist_ids = card.artist_ids ? JSON.parse(card.artist_ids as unknown as string) : undefined;
      card.frame_effects = card.frame_effects ? JSON.parse(card.frame_effects as unknown as string) : undefined;
      card.prices = card.prices ? JSON.parse(card.prices as unknown as string) : undefined;
      card.related_uris = card.related_uris ? JSON.parse(card.related_uris as unknown as string) : undefined;
      card.purchase_uris = card.purchase_uris ? JSON.parse(card.purchase_uris as unknown as string) : undefined;
      card.all_parts = card.all_parts ? JSON.parse(card.all_parts as unknown as string) : undefined;
      cards.push(card);
    }
    return cards;
  }
};

export const DecksTable = {
  insert: async (deck: Deck): Promise<void> => {
    const query = {
      sql: 'INSERT INTO decks (id, name, description, format, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      params: [deck.id, deck.name, deck.description || null, deck.format || null, deck.created_at, deck.updated_at]
    };
    await executeQuery(query);
  },

  getById: async (id: string): Promise<Deck | null> => {
    const query = {
      sql: 'SELECT * FROM decks WHERE id = ?',
      params: [id]
    };
    const results = await executeQuery(query);
    return results.rows.item(0) as Deck | null;
  },

  getAll: async (): Promise<Deck[]> => {
    const query = {
      sql: 'SELECT * FROM decks',
      params: []
    };
    const results = await executeQuery(query);
    const decks: Deck[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      decks.push(results.rows.item(i) as Deck);
    }
    return decks;
  }
};

export const DeckCardsTable = {
  insert: async (deckCard: DeckCard): Promise<void> => {
    const query = {
      sql: 'INSERT INTO deck_cards (id, deck_id, card_id, quantity, is_sideboard, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      params: [
        deckCard.id,
        deckCard.deck_id,
        deckCard.card_id,
        deckCard.quantity,
        deckCard.is_sideboard ? 1 : 0,
        deckCard.created_at,
        deckCard.updated_at
      ]
    };
    await executeQuery(query);
  },

  getByDeckId: async (deckId: string): Promise<DeckCard[]> => {
    const query = {
      sql: 'SELECT * FROM deck_cards WHERE deck_id = ?',
      params: [deckId]
    };
    const results = await executeQuery(query);
    const deckCards: DeckCard[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      deckCards.push(results.rows.item(i) as DeckCard);
    }
    return deckCards;
  },

  deleteByDeckId: async (deckId: string): Promise<void> => {
    const query = {
      sql: 'DELETE FROM deck_cards WHERE deck_id = ?',
      params: [deckId]
    };
    await executeQuery(query);
  }
}; 