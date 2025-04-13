import { setupControl } from "../control.js";
import { events } from "../events.js";
import { getAllStoredDecks, getDeckFromStorage } from "../storage.js";
import { parseFromFile } from "./parse.js";

/**
 * @param {HTMLSelectElement | null} selectElement
 * @param {IDBDatabase} db
 * @returns {Promise<void>}
 */
export const setupDeckSelect = async (selectElement, db) => {
  if (!selectElement) throw new Error("Select element is not found");

  // populate options from local storage
  const decks = await getAllStoredDecks(db);
  for (const deckName of decks) {
    createNewOption(selectElement, deckName);
  }

  // set the selected option from query parameter
  const queryDeck = new URL(window.location.href).searchParams.get("deck");
  const deck = await getDeckFromStorage(db, queryDeck ?? "");
  updateSelectedOption(selectElement, deck?.name ?? "");
  if (deck) {
    events.deckUpdate.dispatch(deck);
  }

  selectElement.addEventListener("change", async () => {
    updateSelectedOption(selectElement, selectElement.value);
    const deck = await getDeckFromStorage(db, selectElement.value);
    events.deckUpdate.dispatch(deck);
  });

  events.newDecks.subscribe(async (files) => {
    if (files.length === 0) return;
    for (const [i, file] of [...files].entries()) {
      const newDeck = await parseFromFile(file);
      if (newDeck !== undefined) {
        createNewOption(selectElement, newDeck.name);
        if (i === 0) {
          updateSelectedOption(selectElement, newDeck.name);
          events.deckUpdate.dispatch(newDeck);
        }
      }
    }
  });

  // listen for removed decks
  events.removeDeck.subscribe((deckName) => {
    removeOption(selectElement, deckName);
    updateSelectedOption(selectElement, "");
    events.deckUpdate.dispatch(undefined);
  });
};

/**
 * @param {HTMLSelectElement} selectElement
 * @param {string} deckName
 * @returns {void}
 */
const createNewOption = (selectElement, deckName) => {
  const option = document.createElement("option");
  option.value = deckName;
  option.textContent = deckName;
  selectElement.appendChild(option);
};

/**
 * @param {HTMLSelectElement} selectElement
 * @param {string} deckName
 * @returns {void}
 */
const removeOption = (selectElement, deckName) => {
  const option = selectElement.querySelector(`option[value="${deckName}"]`);
  if (option) option.remove();
};

/**
 * @param {HTMLSelectElement} selectElement
 * @param {string} deckName
 * @returns {void}
 */
const updateSelectedOption = (selectElement, deckName) => {
  selectElement.value = deckName;
  selectElement.querySelector(`option[selected]`)?.removeAttribute("selected");
  selectElement
    .querySelector(`option[value="${deckName}"]`)
    ?.setAttribute("selected", "");
  // update query parameter
  const url = new URL(window.location.href);
  if (!deckName) {
    url.searchParams.delete("deck");
  } else {
    url.searchParams.set("deck", deckName);
  }
  window.history.replaceState(null, "", url.toString());
};
