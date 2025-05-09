import { ScryfallCard, ScryfallError, ScryfallList, ScryfallResponse, SearchOptions, NamedCardOptions, ImageVersion, ScryfallCatalog, AutocompleteOptions, RandomCardOptions, CollectionOptions, CollectionResponse, MtgoCardOptions, ScryfallSet, SetsOptions, ScryfallRuling, ScryfallCardSymbol, SymbologyOptions, ScryfallManaCost, ParseManaOptions } from './types';

const API_BASE_URL = 'https://api.scryfall.com';

class ScryfallClient {
  private static instance: ScryfallClient;
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_DELAY = 50; // 100ms minimum delay between requests

  private constructor() {}

  public static getInstance(): ScryfallClient {
    if (!ScryfallClient.instance) {
      ScryfallClient.instance = new ScryfallClient();
    }
    return ScryfallClient.instance;
  }

  private async delayIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_REQUEST_DELAY) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_DELAY - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  private isScryfallError<T extends object>(response: ScryfallResponse<T>): response is ScryfallError {
    return 'object' in response && response.object === 'error';
  }

  private async fetch<T extends object>(endpoint: string, params?: Record<string, string>): Promise<T> {
    await this.delayIfNeeded();

    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'MTGOverseer/1.0',
        'Accept': 'application/json;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      const error = await response.json() as ScryfallError;
      throw new Error(error.details);
    }

    const data = await response.json() as ScryfallResponse<T>;
    if (this.isScryfallError(data)) {
      throw new Error(data.details);
    }
    return data as T;
  }

  private async fetchImage(endpoint: string, params?: Record<string, string>): Promise<Blob> {
    await this.delayIfNeeded();

    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'MTGOverseer/1.0',
        'Accept': 'image/*;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      const error = await response.json() as ScryfallError;
      throw new Error(error.details);
    }

    return response.blob();
  }

  private async fetchText(endpoint: string, params?: Record<string, string>): Promise<string> {
    await this.delayIfNeeded();

    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'MTGOverseer/1.0',
        'Accept': 'text/plain;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      const error = await response.json() as ScryfallError;
      throw new Error(error.details);
    }

    return response.text();
  }

  public async autocomplete(options: AutocompleteOptions): Promise<ScryfallCatalog> {
    const params: Record<string, string> = {
      q: options.q,
    };

    if (options.include_extras !== undefined) {
      params.include_extras = options.include_extras.toString();
    }
    if (options.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    return this.fetch<ScryfallCatalog>('/cards/autocomplete', params);
  }

  public async getNamedCard(options: NamedCardOptions): Promise<ScryfallCard | Blob | string> {
    if (!options.exact && !options.fuzzy) {
      throw new Error('Either exact or fuzzy parameter must be provided');
    }

    const params: Record<string, string> = {};
    if (options.exact) {
      params.exact = options.exact;
    }
    if (options.fuzzy) {
      params.fuzzy = options.fuzzy;
    }
    if (options.set) {
      params.set = options.set;
    }
    if (options.format) {
      params.format = options.format;
    }
    if (options.face) {
      params.face = options.face;
    }
    if (options.version) {
      params.version = options.version;
    }
    if (options.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    const format = options.format || 'json';
    switch (format) {
      case 'json':
        return this.fetch<ScryfallCard>('/cards/named', params);
      case 'image':
        return this.fetchImage('/cards/named', params);
      case 'text':
        return this.fetchText('/cards/named', params);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  public async searchCards(options: SearchOptions): Promise<ScryfallList<ScryfallCard>> {
    const params: Record<string, string> = {
      q: options.q,
    };

    if (options.unique) {
      params.unique = options.unique;
    }
    if (options.order) {
      params.order = options.order;
    }
    if (options.dir) {
      params.dir = options.dir;
    }
    if (options.include_extras !== undefined) {
      params.include_extras = options.include_extras.toString();
    }
    if (options.include_multilingual !== undefined) {
      params.include_multilingual = options.include_multilingual.toString();
    }
    if (options.include_variations !== undefined) {
      params.include_variations = options.include_variations.toString();
    }
    if (options.page) {
      params.page = options.page.toString();
    }
    if (options.format) {
      params.format = options.format;
    }
    if (options.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    return this.fetch<ScryfallList<ScryfallCard>>('/cards/search', params);
  }

  public async getCardById(id: string): Promise<ScryfallCard> {
    return this.fetch<ScryfallCard>(`/cards/${id}`);
  }

  public async getCardBySetCodeAndNumber(setCode: string, number: string): Promise<ScryfallCard> {
    return this.fetch<ScryfallCard>(`/cards/${setCode}/${number}`);
  }

  public async getRandomCard(options?: RandomCardOptions): Promise<ScryfallCard | Blob | string> {
    const params: Record<string, string> = {};

    if (options?.q) {
      params.q = options.q;
    }
    if (options?.format) {
      params.format = options.format;
    }
    if (options?.face) {
      params.face = options.face;
    }
    if (options?.version) {
      params.version = options.version;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    const format = options?.format || 'json';
    switch (format) {
      case 'json':
        return this.fetch<ScryfallCard>('/cards/random', params);
      case 'image':
        return this.fetchImage('/cards/random', params);
      case 'text':
        return this.fetchText('/cards/random', params);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  public async getSets(options?: SetsOptions): Promise<ScryfallList<ScryfallSet>> {
    const params: Record<string, string> = {};

    if (options?.format) {
      params.format = options.format;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    return this.fetch<ScryfallList<ScryfallSet>>('/sets', params);
  }

  public async getSetByCode(code: string, options?: SetsOptions): Promise<ScryfallSet> {
    const params: Record<string, string> = {};

    if (options?.format) {
      params.format = options.format;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    return this.fetch<ScryfallSet>(`/sets/${code}`, params);
  }

  public async getSetByTcgplayerId(id: number, options?: SetsOptions): Promise<ScryfallSet> {
    const params: Record<string, string> = {};

    if (options?.format) {
      params.format = options.format;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    return this.fetch<ScryfallSet>(`/sets/tcgplayer/${id}`, params);
  }

  public async getSetById(id: string, options?: SetsOptions): Promise<ScryfallSet> {
    const params: Record<string, string> = {};

    if (options?.format) {
      params.format = options.format;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    return this.fetch<ScryfallSet>(`/sets/${id}`, params);
  }

  public async getCollection(options: CollectionOptions): Promise<CollectionResponse> {
    if (!options.identifiers || options.identifiers.length === 0) {
      throw new Error('At least one card identifier must be provided');
    }

    if (options.identifiers.length > 75) {
      throw new Error('Maximum of 75 card identifiers allowed per request');
    }

    const params: Record<string, string> = {};
    if (options.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    const response = await fetch(`${API_BASE_URL}/cards/collection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MTGOverseer/1.0',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        identifiers: options.identifiers,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as ScryfallError;
      throw new Error(error.details);
    }

    const data = await response.json() as CollectionResponse;
    return data;
  }

  public async getCardByMtgoId(id: number, options?: MtgoCardOptions): Promise<ScryfallCard | Blob | string> {
    const params: Record<string, string> = {};

    if (options?.format) {
      params.format = options.format;
    }
    if (options?.face) {
      params.face = options.face;
    }
    if (options?.version) {
      params.version = options.version;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    const format = options?.format || 'json';
    switch (format) {
      case 'json':
        return this.fetch<ScryfallCard>(`/cards/mtgo/${id}`, params);
      case 'image':
        return this.fetchImage(`/cards/mtgo/${id}`, params);
      case 'text':
        return this.fetchText(`/cards/mtgo/${id}`, params);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  public async getCardByArenaId(id: number, options?: MtgoCardOptions): Promise<ScryfallCard | Blob | string> {
    const params: Record<string, string> = {};

    if (options?.format) {
      params.format = options.format;
    }
    if (options?.face) {
      params.face = options.face;
    }
    if (options?.version) {
      params.version = options.version;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    const format = options?.format || 'json';
    switch (format) {
      case 'json':
        return this.fetch<ScryfallCard>(`/cards/arena/${id}`, params);
      case 'image':
        return this.fetchImage(`/cards/arena/${id}`, params);
      case 'text':
        return this.fetchText(`/cards/arena/${id}`, params);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  public async getCardByCardmarketId(id: number, options?: MtgoCardOptions): Promise<ScryfallCard | Blob | string> {
    const params: Record<string, string> = {};

    if (options?.format) {
      params.format = options.format;
    }
    if (options?.face) {
      params.face = options.face;
    }
    if (options?.version) {
      params.version = options.version;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    const format = options?.format || 'json';
    switch (format) {
      case 'json':
        return this.fetch<ScryfallCard>(`/cards/cardmarket/${id}`, params);
      case 'image':
        return this.fetchImage(`/cards/cardmarket/${id}`, params);
      case 'text':
        return this.fetchText(`/cards/cardmarket/${id}`, params);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  public async getCardByScryfallId(id: string, options?: MtgoCardOptions): Promise<ScryfallCard | Blob | string> {
    const params: Record<string, string> = {};

    if (options?.format) {
      params.format = options.format;
    }
    if (options?.face) {
      params.face = options.face;
    }
    if (options?.version) {
      params.version = options.version;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    const format = options?.format || 'json';
    switch (format) {
      case 'json':
        return this.fetch<ScryfallCard>(`/cards/${id}`, params);
      case 'image':
        return this.fetchImage(`/cards/${id}`, params);
      case 'text':
        return this.fetchText(`/cards/${id}`, params);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  public async getCardRulings(setCode: string, collectorNumber: string, options?: SetsOptions): Promise<ScryfallList<ScryfallRuling>> {
    const params: Record<string, string> = {};

    if (options?.format) {
      params.format = options.format;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    return this.fetch<ScryfallList<ScryfallRuling>>(`/cards/${setCode}/${collectorNumber}/rulings`, params);
  }

  public async getCardRulingsByMultiverseId(id: number): Promise<ScryfallList<ScryfallRuling>> {
    return this.fetch<ScryfallList<ScryfallRuling>>(`/cards/multiverse/${id}/rulings`);
  }

  public async getCardRulingsByMtgoId(id: number, options?: SetsOptions): Promise<ScryfallList<ScryfallRuling>> {
    const params: Record<string, string> = {};

    if (options?.format) {
      params.format = options.format;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    return this.fetch<ScryfallList<ScryfallRuling>>(`/cards/mtgo/${id}/rulings`, params);
  }

  public async getCardRulingsByArenaId(id: number, options?: SetsOptions): Promise<ScryfallList<ScryfallRuling>> {
    const params: Record<string, string> = {};

    if (options?.format) {
      params.format = options.format;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    return this.fetch<ScryfallList<ScryfallRuling>>(`/cards/arena/${id}/rulings`, params);
  }

  public async getCardRulingsByScryfallId(id: string, options?: SetsOptions): Promise<ScryfallList<ScryfallRuling>> {
    const params: Record<string, string> = {};

    if (options?.format) {
      params.format = options.format;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    return this.fetch<ScryfallList<ScryfallRuling>>(`/cards/${id}/rulings`, params);
  }

  public async getCardSymbols(options?: SymbologyOptions): Promise<ScryfallList<ScryfallCardSymbol>> {
    const params: Record<string, string> = {};

    if (options?.format) {
      params.format = options.format;
    }
    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    return this.fetch<ScryfallList<ScryfallCardSymbol>>('/symbology', params);
  }

  public async parseManaCost(options: ParseManaOptions): Promise<ScryfallManaCost> {
    const params: Record<string, string> = {
      cost: options.cost,
    };

    if (options.format) {
      params.format = options.format;
    }
    if (options.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    return this.fetch<ScryfallManaCost>('/symbology/parse-mana', params);
  }

  public async getCatalog(catalogName: string, options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    const params: Record<string, string> = {};

    if (options?.pretty !== undefined) {
      params.pretty = options.pretty.toString();
    }

    return this.fetch<ScryfallCatalog>(`/catalog/${catalogName}`, params);
  }

  public async getCardNames(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('card-names', options);
  }

  public async getArtistNames(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('artist-names', options);
  }

  public async getWordBank(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('word-bank', options);
  }

  public async getSupertypes(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('supertypes', options);
  }

  public async getCardTypes(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('card-types', options);
  }

  public async getArtifactTypes(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('artifact-types', options);
  }

  public async getBattleTypes(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('battle-types', options);
  }

  public async getCreatureTypes(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('creature-types', options);
  }

  public async getEnchantmentTypes(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('enchantment-types', options);
  }

  public async getLandTypes(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('land-types', options);
  }

  public async getPlaneswalkerTypes(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('planeswalker-types', options);
  }

  public async getSpellTypes(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('spell-types', options);
  }

  public async getPowers(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('powers', options);
  }

  public async getToughnesses(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('toughnesses', options);
  }

  public async getLoyalties(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('loyalties', options);
  }

  public async getKeywordAbilities(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('keyword-abilities', options);
  }

  public async getKeywordActions(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('keyword-actions', options);
  }

  public async getAbilityWords(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('ability-words', options);
  }

  public async getFlavorWords(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('flavor-words', options);
  }

  public async getWatermarks(options?: { pretty?: boolean }): Promise<ScryfallCatalog> {
    return this.getCatalog('watermarks', options);
  }
}

export default ScryfallClient;
