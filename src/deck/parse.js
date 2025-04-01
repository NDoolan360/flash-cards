/** @import type { Deck, Slide } from '../types.js' */
import { isValidDeck, isValidDeckCSV, isValidDeckFilename } from "./validate.js";

export const LINE_SPLIT_REGEX =
  /^\s*(?:"([^"]*)"|([^,]+))\s*,\s*(?:"([^"]*)"|([^,]+))\s*$/;

// parse the deck from the filename and csv data
/**
 * @param {string} filename
 * @param {string} deckData
 * @returns {Deck}
 */
export const parseDeck = (filename, deckData) => ({
  name: parseDeckName(filename),
  slides: parseDeckData(deckData),
});

// parse the deck name from the filename
/**
 * @param {string} filename
 * @returns {Deck["name"]}
 */
export const parseDeckName = (filename) =>
  (isValidDeckFilename(filename) ? filename : "")
    .replace(".csv", "")
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "");

// parse the deck data from the csv string
/**
 * @param {unknown} deckData
 * @returns {Deck["slides"]}
 */
export const parseDeckData = (deckData) => {
  if (!isValidDeckCSV(deckData)) {
    throw new Error("Can't parse invalid data");
  }
  return deckData
    .trim()
    .split("\n")
    .map((line) => parseSlide(line));
};

// encode the deck name to be used as a filename
/**
 * @param {Deck["name"]} deckName
 * @returns {string}
 */
export const parseFilename = (deckName) => `${deckName}.csv`;

// parse the slide from the csv line
/**
 * @param {string} line
 * @returns {Slide}
 */
export const parseSlide = (line) => {
  const matches = line.match(LINE_SPLIT_REGEX);
  if (
    !matches ||
    (!matches[1] && !matches[2]) ||
    (!matches[3] && !matches[4])
  ) {
    console.error(matches);
    throw new Error("Regex didn't return expectd fields. :(");
  }
  const question = matches[1] || matches[2];
  const answer = matches[3] || matches[4];
  return { question, answer };
};

/**
 * @param {File} file
 * @returns {Promise<Deck | undefined>}
 */
export const parseFromFile = async (file) => {
  const reader = new FileReader();
  reader.readAsText(file);
  return new Promise((resolve, reject) => {
    reader.onload = (ev) => {
      const rawCSVData = ev.target?.result;
      if (
        typeof rawCSVData !== "string" ||
        !isValidDeck(file.name, rawCSVData)
      ) {
        resolve(undefined);
      } else {
        const deck = parseDeck(file.name, rawCSVData);
        resolve(deck);
      }
    };
    reader.onerror = reject;
  });
};
