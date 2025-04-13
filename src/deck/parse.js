/** @import { Deck, Slide } from '../types.js' */
import { isValidDeck, isValidDeckCSV, isValidDeckFilename } from "./validate.js";

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

// parse the deck from the filename and csv data
/**
 * @param {string} filename
 * @param {string} deckData
 * @returns {Deck}
 */
const parseDeck = (filename, deckData) => ({
  name: parseDeckName(filename),
  slides: parseDeckData(deckData),
});

// parse the deck name from the filename
/**
 * @param {string} filename
 * @returns {Deck["name"]}
 */
const parseDeckName = (filename) =>
  (isValidDeckFilename(filename) ? filename : "")
    .replace(".csv", "")
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "");

// parse the deck data from the csv string
/**
 * @param {unknown} deckData
 * @returns {Deck["slides"]}
 */
const parseDeckData = (deckData) => {
  if (!isValidDeckCSV(deckData)) {
    throw new Error("Can't parse invalid data");
  }
  return deckData
    .trim()
    .split("\n")
    .map((line) => parseSlide(line));
};

export const LINE_SPLIT_REGEX =
  /^\s*(?:"([^"]*)"|([^,]+))\s*,\s*(?:"([^"]*)"|([^,]+))\s*$/;

// parse the slide from the csv line
/**
 * @param {string} line
 * @returns {Slide}
 */
const parseSlide = (line) => {
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
