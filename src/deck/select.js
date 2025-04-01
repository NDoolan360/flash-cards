import { events } from "../events.js";
import { getAllStoredDecks, getDeckFromStorage } from "../storage.js";
import { parseFromFile } from "./parse.js";

/**
 * @param {HTMLElement | null} element
 * @param {IDBDatabase} db
 * @returns {Promise<void>}
 */
export const setupDeckList = async (element, db) => {
  // validate the element is a select element
  if (!(element instanceof HTMLSelectElement)) {
    throw new Error("Element is not a select element");
  }
  // populate options from local storage
  const decks = await getAllStoredDecks(db);
  for (const deckName of decks) {
    createNewOption(element, deckName);
  }
  // set the selected option from query parameter
  const queryDeck = new URL(window.location.href).searchParams.get("deck");
  const deck = await getDeckFromStorage(db, queryDeck ?? "");
  updateSelectedOption(element, deck?.name ?? "");
  if (deck) {
    events.deckUpdate.dispatch(deck);
  }
  element.addEventListener("change", async () => {
    updateSelectedOption(element, element.value);
    const deck = await getDeckFromStorage(db, element.value);
    events.deckUpdate.dispatch(deck);
  });
  events.newDecks.subscribe(async (files) => {
    if (files.length === 0) return;
    for (const [i, file] of [...files].entries()) {
      const newDeck = await parseFromFile(file);
      if (newDeck !== undefined) {
        createNewOption(element, newDeck.name);
        if (i === 0) {
          updateSelectedOption(element, newDeck.name);
          events.deckUpdate.dispatch(newDeck);
        }
      }
    }
  });
  // listen for removed decks
  events.deckRemoved.subscribe((deckName) => {
    removeOption(element, deckName);
    updateSelectedOption(element, "");
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
