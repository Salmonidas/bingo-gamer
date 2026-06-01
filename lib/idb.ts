import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'bingo_gamer_db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;
  
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        // Logo cache store (keyed by card UUID)
        if (!db.objectStoreNames.contains('logos')) {
          db.createObjectStore('logos');
        }
        // Custom user settings/preferences store
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences');
        }
        // Custom royalty-free sounds cache (keyed by slot: mark, line, bingo)
        if (!db.objectStoreNames.contains('sounds')) {
          db.createObjectStore('sounds');
        }
        // Card cache store (keyed by card editToken)
        if (!db.objectStoreNames.contains('cards')) {
          db.createObjectStore('cards');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Saves a base64 DataURL logo for a specific bingo card.
 */
export async function saveLocalLogo(cardId: string, dataUrl: string): Promise<void> {
  const db = getDB();
  if (!db) return;
  const activeDb = await db;
  await activeDb.put('logos', { dataUrl, updatedAt: Date.now() }, cardId);
}

/**
 * Retrieves a base64 DataURL logo for a specific bingo card.
 */
export async function getLocalLogo(cardId: string): Promise<string | null> {
  const db = getDB();
  if (!db) return null;
  const activeDb = await db;
  const data = await activeDb.get('logos', cardId);
  return data ? data.dataUrl : null;
}

/**
 * Deletes a cached logo for a specific card.
 */
export async function deleteLocalLogo(cardId: string): Promise<void> {
  const db = getDB();
  if (!db) return;
  const activeDb = await db;
  await activeDb.delete('logos', cardId);
}

/**
 * Saves custom audio file (DataURL or Blob) for a specific sound slot.
 * Slots: 'mark', 'line', 'bingo'
 */
export async function saveLocalSound(slot: string, dataUrl: string): Promise<void> {
  const db = getDB();
  if (!db) return;
  const activeDb = await db;
  await activeDb.put('sounds', { dataUrl, updatedAt: Date.now() }, slot);
}

/**
 * Retrieves custom audio file for a specific sound slot.
 */
export async function getLocalSound(slot: string): Promise<string | null> {
  const db = getDB();
  if (!db) return null;
  const activeDb = await db;
  const data = await activeDb.get('sounds', slot);
  return data ? data.dataUrl : null;
}

/**
 * Deletes a cached custom sound slot.
 */
export async function deleteLocalSound(slot: string): Promise<void> {
  const db = getDB();
  if (!db) return;
  const activeDb = await db;
  await activeDb.delete('sounds', slot);
}

/**
 * Saves a base64 DataURL cell image for a specific position in a card.
 */
export async function saveLocalCellImage(cardId: string, position: number, dataUrl: string): Promise<void> {
  const db = getDB();
  if (!db) return;
  const activeDb = await db;
  const key = `cell_${cardId}_${position}`;
  await activeDb.put('logos', { dataUrl, updatedAt: Date.now() }, key);
}

/**
 * Retrieves a base64 DataURL cell image for a specific position in a card.
 */
export async function getLocalCellImage(cardId: string, position: number): Promise<string | null> {
  const db = getDB();
  if (!db) return null;
  const activeDb = await db;
  const key = `cell_${cardId}_${position}`;
  const data = await activeDb.get('logos', key);
  return data ? data.dataUrl : null;
}

/**
 * Deletes a cell image.
 */
export async function deleteLocalCellImage(cardId: string, position: number): Promise<void> {
  const db = getDB();
  if (!db) return;
  const activeDb = await db;
  const key = `cell_${cardId}_${position}`;
  await activeDb.delete('logos', key);
}

/**
 * Retrieves all cell images for a card as an object.
 */
export async function getAllLocalCellImages(cardId: string): Promise<Record<number, string>> {
  const db = getDB();
  if (!db) return {};
  const activeDb = await db;
  const tx = activeDb.transaction('logos', 'readonly');
  const store = tx.objectStore('logos');
  const keys = await store.getAllKeys();
  const images: Record<number, string> = {};
  
  for (const key of keys) {
    if (typeof key === 'string' && key.startsWith(`cell_${cardId}_`)) {
      const posStr = key.replace(`cell_${cardId}_`, '');
      const position = parseInt(posStr, 10);
      if (!isNaN(position)) {
        const data = await store.get(key);
        if (data && data.dataUrl) {
          images[position] = data.dataUrl;
        }
      }
    }
  }
  return images;
}

/**
 * Saves a bingo card object to IndexedDB.
 */
export async function saveLocalCard(card: any): Promise<void> {
  const db = getDB();
  if (!db) return;
  const activeDb = await db;
  card.updated_at = new Date().toISOString();
  await activeDb.put('cards', card, card.edit_token);
}

/**
 * Retrieves a bingo card object by edit_token from IndexedDB.
 */
export async function getLocalCard(editToken: string): Promise<any | null> {
  const db = getDB();
  if (!db) return null;
  const activeDb = await db;
  const card = await activeDb.get('cards', editToken);
  return card || null;
}

/**
 * Deletes a bingo card object from IndexedDB by edit_token.
 */
export async function deleteLocalCard(editToken: string): Promise<void> {
  const db = getDB();
  if (!db) return;
  const activeDb = await db;
  await activeDb.delete('cards', editToken);
}

/**
 * Retrieves all saved bingo cards from IndexedDB.
 */
export async function getAllLocalCards(): Promise<any[]> {
  const db = getDB();
  if (!db) return [];
  const activeDb = await db;
  const tx = activeDb.transaction('cards', 'readonly');
  const store = tx.objectStore('cards');
  const cards = await store.getAll();
  return cards.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

