/** @import type { Deck } from './types.js' */
import { isDeck } from "./types.js";

/**
 * @template T
 * @param {string} name
 * @param {(value: unknown) => value is T} [typeGuard=(_): _ is T => true]
 * @returns {{ dispatch: (value?: T) => void; subscribe: (callback: (value: T) => void) => void; }}
 */
const newEvent = (name, typeGuard = (_) => true) => ({
  dispatch: (value) => {
    window.dispatchEvent(new CustomEvent(name, { detail: value }));
  },
  subscribe: (callback) => {
    window.addEventListener(name, (event) => {
      if (event instanceof CustomEvent && typeGuard(event.detail)) {
        callback(event.detail);
      }
    });
  },
});

export const events = {
  deckComplete: newEvent("deck-complete"),
  deckRemoved: newEvent("deck-removed", (e) => typeof e === "string"),
  deckUpdate: newEvent("deck-update", (e) => e === undefined || isDeck(e)),
  endless: newEvent("endless", (e) => typeof e === "boolean"),
  newDecks: newEvent("new-decks", (e) => e instanceof FileList),
  shuffle: newEvent("shuffle", (e) => typeof e === "boolean"),
  slideCorrect: newEvent("slide-correct"),
  slideFlip: newEvent("slide-flip", (e) => typeof e === "boolean"),
  slideUpdate: newEvent("slide-update", (e) => typeof e === "number"),
};

// log all events
for (const event of [
  "new-decks",
  "deck-update",
  "deck-removed",
  "deck-complete",
  "slide-update",
  "slide-flip",
  "slide-correct",
  "endless",
  "shuffle",
]) {
  window.addEventListener(event, (e) => {
    if (e instanceof CustomEvent) console.log(event, e.detail);
  });
}
