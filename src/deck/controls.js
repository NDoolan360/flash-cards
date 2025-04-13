import { setupControl } from "../control.js";
import { events } from "../events.js";
import { setupDeckSelect } from "./select.js";

/**
 * @param {HTMLElement | null} element
 * @param {IDBDatabase} db
 * @returns {void}
 */
export const setupDeckControls = (element, db) => {
  const deckSelect = element.querySelector("#deck-select");
  if (!deckSelect) throw new Error("Deck select element is not found");
  setupDeckSelect(deckSelect, db);
  deckSelect.disabled = false;

  const deckInput = element.querySelector("#deck-input");
  if (!deckInput) throw new Error("Deck input element is not found");
  setupControl(deckInput, {
    eventCallbacks: {
      input: (deckSelect) => {
        if (deckSelect.files) {
          events.newDecks.dispatch(deckSelect.files);
        }
        deckSelect.value = "";
      },
    },
  });
  deckInput.disabled = false;

  const newDeck = element.querySelector("#new-deck");
  if (!newDeck) throw new Error("New deck element is not found");
  setupControl(newDeck, {
    eventCallbacks: { click: (_, target) => target.click() },
    target: deckInput,
  });
  newDeck.disabled = false;

  const removeDeck = element.querySelector("#remove-deck");
  if (!removeDeck) throw new Error("Remove deck element is not found");
  setupControl(removeDeck, {
    eventCallbacks: { click: (_, target) => events.removeDeck.dispatch(target.value) },
    target: deckSelect,
    targetMutationCallbacks: {
      disabled: (_, target) => !target.value.length,
    },
  });
  removeDeck.disabled = true;
};
