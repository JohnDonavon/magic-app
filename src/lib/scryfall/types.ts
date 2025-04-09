export interface ScryfallError {
  object: 'error';
  code: string;
  status: number;
  details: string;
  type?: string;
  warnings?: string[];
}

export interface ScryfallList<T> {
  object: 'list';
  data: T[];
  has_more: boolean;
  next_page?: string;
  total_cards?: number;
  warnings?: string[];
}

export interface ScryfallSet {
  object: 'set';
  id: string;
  code: string;
  mtgo_code?: string;
  arena_code?: string;
  tcgplayer_id?: number;
  name: string;
  set_type: string;
  released_at?: string;
  block_code?: string;
  block?: string;
  parent_set_code?: string;
  card_count: number;
  printed_size?: number;
  digital: boolean;
  foil_only: boolean;
  nonfoil_only: boolean;
  scryfall_uri: string;
  uri: string;
  icon_svg_uri: string;
  search_uri: string;
}

export interface CardFace {
  object: 'card_face';
  artist?: string;
  artist_id?: string;
  cmc?: number;
  color_indicator?: string[];
  colors?: string[];
  defense?: string;
  flavor_text?: string;
  illustration_id?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  layout?: string;
  loyalty?: string;
  mana_cost: string;
  name: string;
  oracle_id?: string;
  oracle_text?: string;
  power?: string;
  printed_name?: string;
  printed_text?: string;
  printed_type_line?: string;
  toughness?: string;
  type_line?: string;
  watermark?: string;
}

export interface RelatedCard {
  object: 'related_card';
  id: string;
  component: 'token' | 'meld_part' | 'meld_result' | 'combo_piece';
  name: string;
  type_line: string;
  uri: string;
}

export interface ScryfallCard {
  object: 'card';
  // Core Fields
  arena_id?: number;
  id: string;
  lang: string;
  mtgo_id?: number;
  mtgo_foil_id?: number;
  multiverse_ids?: number[];
  tcgplayer_id?: number;
  tcgplayer_etched_id?: number;
  cardmarket_id?: number;
  layout: string;
  oracle_id?: string;
  prints_search_uri: string;
  rulings_uri: string;
  scryfall_uri: string;
  uri: string;

  // Gameplay Fields
  all_parts?: RelatedCard[];
  card_faces?: CardFace[];
  cmc: number;
  color_identity: string[];
  color_indicator?: string[];
  colors?: string[];
  defense?: string;
  edhrec_rank?: number;
  game_changer?: boolean;
  hand_modifier?: string;
  keywords: string[];
  legalities: {
    [format: string]: 'legal' | 'not_legal' | 'restricted' | 'banned';
  };
  life_modifier?: string;
  loyalty?: string;
  mana_cost?: string;
  name: string;
  oracle_text?: string;
  penny_rank?: number;
  power?: string;
  produced_mana?: string[];
  reserved: boolean;
  toughness?: string;
  type_line: string;

  // Print Fields
  artist?: string;
  artist_ids?: string[];
  attraction_lights?: string[];
  booster: boolean;
  border_color: 'black' | 'white' | 'borderless' | 'yellow' | 'silver' | 'gold';
  card_back_id: string;
  collector_number: string;
  content_warning?: boolean;
  digital: boolean;
  finishes: ('foil' | 'nonfoil' | 'etched')[];
  flavor_name?: string;
  flavor_text?: string;
  frame_effects?: string[];
  frame: string;
  full_art: boolean;
  games: ('paper' | 'arena' | 'mtgo')[];
  highres_image: boolean;
  illustration_id?: string;
  image_status: 'missing' | 'placeholder' | 'lowres' | 'highres_scan';
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  oversized: boolean;
  prices: {
    usd?: string;
    usd_foil?: string;
    usd_etched?: string;
    eur?: string;
    eur_foil?: string;
    eur_etched?: string;
    tix?: string;
  };
  printed_name?: string;
  printed_text?: string;
  printed_type_line?: string;
  promo: boolean;
  promo_types?: string[];
  purchase_uris?: {
    tcgplayer?: string;
    cardmarket?: string;
    cardhoarder?: string;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'special' | 'mythic' | 'bonus';
  related_uris: {
    gatherer?: string;
    tcgplayer_infinite_articles?: string;
    tcgplayer_infinite_decks?: string;
    edhrec?: string;
  };
  released_at: string;
  reprint: boolean;
  scryfall_set_uri: string;
  set_name: string;
  set_search_uri: string;
  set_type: string;
  set_uri: string;
  set: string;
  set_id: string;
  story_spotlight: boolean;
  textless: boolean;
  variation: boolean;
  variation_of?: string;
  security_stamp?: 'oval' | 'triangle' | 'acorn' | 'circle' | 'arena' | 'heart';
  watermark?: string;

  // Preview Fields
  preview?: {
    previewed_at?: string;
    source_uri?: string;
    source?: string;
  };
}

export type ScryfallResponse<T> = T | ScryfallError;

export type UniqueMode = 'cards' | 'art' | 'prints';

export type SortOrder = 
  | 'name'
  | 'set'
  | 'released'
  | 'rarity'
  | 'color'
  | 'usd'
  | 'tix'
  | 'eur'
  | 'cmc'
  | 'power'
  | 'toughness'
  | 'edhrec'
  | 'penny'
  | 'artist'
  | 'review';

export type SortDirection = 'auto' | 'asc' | 'desc';

export interface SearchOptions {
  q: string;
  unique?: UniqueMode;
  order?: SortOrder;
  dir?: SortDirection;
  include_extras?: boolean;
  include_multilingual?: boolean;
  include_variations?: boolean;
  page?: number;
  format?: 'json' | 'csv';
  pretty?: boolean;
}

export type ImageVersion = 'small' | 'normal' | 'large' | 'png' | 'art_crop' | 'border_crop';

export interface NamedCardOptions {
  exact?: string;
  fuzzy?: string;
  set?: string;
  format?: 'json' | 'text' | 'image';
  face?: 'front' | 'back';
  version?: ImageVersion;
  pretty?: boolean;
}

export interface ScryfallCatalog {
  object: 'catalog';
  uri: string;
  total_values: number;
  data: string[];
}

export interface AutocompleteOptions {
  q: string;
  include_extras?: boolean;
  pretty?: boolean;
}

export interface RandomCardOptions {
  q?: string;
  format?: 'json' | 'text' | 'image';
  face?: 'front' | 'back';
  version?: ImageVersion;
  pretty?: boolean;
}

export interface CardIdentifier {
  id?: string;
  mtgo_id?: number;
  multiverse_id?: number;
  oracle_id?: string;
  illustration_id?: string;
  name?: string;
  set?: string;
  collector_number?: string;
}

export interface CollectionOptions {
  identifiers: CardIdentifier[];
  pretty?: boolean;
}

export interface CollectionResponse extends ScryfallList<ScryfallCard> {
  not_found: CardIdentifier[];
}

export interface MtgoCardOptions {
  format?: 'json' | 'text' | 'image';
  face?: 'front' | 'back';
  version?: ImageVersion;
  pretty?: boolean;
} 