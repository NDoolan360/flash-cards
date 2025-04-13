/** @import { Deck } from './types.js' */
import { parseFromFile } from './deck/parse.js';
import { events } from './events.js';

/**
 * @param {(db: IDBDatabase) => void} onSuccessCallback
 * @returns {void}
 */
export const setupStorage = (onSuccessCallback) => {
  // setup indexedDB
  const deckDatabase = indexedDB.open("deckData", 1);

  deckDatabase.onerror = function () {
    console.error(`Database error: ${this.error?.message}`);
    throw new Error("Failed to open the deck database");
  };

  deckDatabase.onupgradeneeded = function () {
    const db = this.result;
    const store = db.createObjectStore("decks", { keyPath: "name" });
    store.createIndex("name", "name", { unique: true });
  };

  deckDatabase.onsuccess = async function () {
    const deckDatabase = this.result;

    // setup database events
    events.newDecks.subscribe(async (files) => {
      for (const file of files) {
        const newDeck = await parseFromFile(file);
        if (newDeck === undefined) {
          alert("Invalid deck file. Please upload a valid .csv file with only two columns.");
        } else {
          await addToStorage(deckDatabase, newDeck);
        }
      }
    });

    events.removeDeck.subscribe((deckName) => {
      if (!confirm("Are you sure you want to remove this deck?")) return;
      const transaction = deckDatabase.transaction("decks", "readwrite");
      transaction.objectStore("decks").delete(deckName);
    });

    onSuccessCallback(deckDatabase);
  };
}

/**
 * @param {IDBDatabase} db
 * @param {Deck} deck
 * @param {{ override?: boolean }} [options]
 * @returns {Promise<string>}
 */
const addToStorage = async (db, deck, options) => {
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
