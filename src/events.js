import { isDeck, isSlide } from "./types.js";

/**
 * @template T
 * @param {string} name
 * @param {(value: unknown) => value is T} [typeGuard=(_): _ is T => true]
 * @returns {{ dispatch: (value?: T) => void; subscribe: (callback: (value: T) => void) => void; unsubscribe: (callback: (value: T) => void) => void; }}
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
  unsubscribe: (callback) => {
    window.removeEventListener(name, (event) => {
      if (event instanceof CustomEvent && typeGuard(event.detail)) {
        callback(event.detail);
      }
    });
  },
});

export const events = {
  deckComplete: newEvent("deck-complete", (e) => typeof e === "boolean"),
  deckUpdate: newEvent("deck-update", (e) => e === undefined || e === null || isDeck(e)),
  indexUpdate: newEvent("index-update", (e) => typeof e === "number"),
  loop: newEvent("loop", (e) => typeof e === "boolean"),
  newDecks: newEvent("new-decks", (e) => e instanceof FileList),
  removeDeck: newEvent("remove-deck", (e) => typeof e === "string"),
  shuffle: newEvent("shuffle", (e) => typeof e === "boolean"),
  slideCorrect: newEvent("slide-correct", (e => typeof e === "boolean")),
  slideFlip: newEvent("slide-flip", (e) => typeof e === "boolean"),
  slideUpdate: newEvent("slide-update", (e) => e === undefined || isSlide(e)),
};

// log all events
for (const event of [
  "deck-complete",
  "remove-deck",
  "deck-update",
  "loop",
  "index-update",
  "new-decks",
  "shuffle",
  "slide-correct",
  "slide-flip",
  "slide-update",
]) {
  window.addEventListener(event, (e) => {
    if (e instanceof CustomEvent) console.debug(event, e.detail);
  });
}
