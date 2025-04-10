import { ScryfallCard } from '../lib/scryfall/types';

export interface Card extends ScryfallCard {
  created_at: number;
  updated_at: number;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  format?: string;
  created_at: number;
  updated_at: number;
}

export interface DeckCard {
  id: string;
  deck_id: string;
  card_id: string;
  quantity: number;
  is_sideboard: boolean;
  created_at: number;
  updated_at: number;
} 