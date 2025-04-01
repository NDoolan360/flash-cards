/** @import type { Deck } from './types.js' */

/**
 * @param {IDBDatabase} db
 * @returns {Promise<string[]>}
 */
export const getAllStoredDecks = async (db) => {
  const transaction = db.transaction("decks", "readonly");
  const store = transaction.objectStore("decks");
  const request = store.getAllKeys();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * @param {IDBDatabase} db
 * @param {string} name
 * @returns {Promise<Deck | undefined>}
 */
export const getDeckFromStorage = async (db, name) => {
  const transaction = db.transaction("decks", "readonly");
  const store = transaction.objectStore("decks");
  const request = store.get(name);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * @param {IDBDatabase} db
 * @param {Deck} deck
 * @returns {Promise<IDBValidKey>}
 */
export const updateDeckInStorage = async (db, deck) => {
  return await addToStorage(db, deck, { override: true });
};

/**
 * @param {IDBDatabase} db
 * @param {Deck} deck
 * @param {{ override?: boolean }} [options]
 * @returns {Promise<string>}
 */
export const addToStorage = async (db, deck, options) => {
  const transaction = db.transaction("decks", "readwrite");
  const store = transaction.objectStore("decks");
  const request = store.add(deck);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      // if conflict, update the deck with an override warning
      if (request.error?.name === "ConstraintError") {
        const overwrite =
          options?.override ||
          confirm("This deck already exists. Do you want to overwrite it?");
        if (!overwrite) return;
        store.put(deck);
        // resolve(request.result as string);
      } else {
        reject(request.error);
      }
    };
  });
};
