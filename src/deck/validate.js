import { LINE_SPLIT_REGEX } from "./parse.js";

/**
 * @param {string} rawDeckName
 * @param {unknown} rawDeckData
 * @returns {boolean}
 */
export const isValidDeck = (rawDeckName, rawDeckData) =>
  isValidDeckFilename(rawDeckName) && isValidDeckCSV(rawDeckData);

/**
 * @param {string} rawDeckName
 * @returns {boolean}
 */
export const isValidDeckFilename = (rawDeckName) =>
  rawDeckName.endsWith(".csv");

/**
 * @param {unknown} rawDeckData
 * @returns {rawDeckData is string}
 */
export const isValidDeckCSV = (rawDeckData) =>
  typeof rawDeckData === "string" &&
  rawDeckData
    .trim()
    .split("\n")
    .every((line) => line.match(LINE_SPLIT_REGEX));
