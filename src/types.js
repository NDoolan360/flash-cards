/**
 * @typedef {Object} Deck
 * @property {string} name
 * @property {Slide[]} slides
 */

/**
 * @param {unknown} deck
 * @returns {deck is Deck}
 */
export const isDeck = (deck) =>
  deck !== null &&
  typeof deck === "object" &&
  "name" in deck &&
  "slides" in deck &&
  typeof deck.name === "string" &&
  Array.isArray(deck.slides) &&
  deck.slides.every(isSlide);

/**
* @typedef {Object} Slide
* @property {string} question
* @property {string} answer
*/

/**
 * @param {unknown} slide
 * @returns {slide is Slide}
 */
export const isSlide = (slide) =>
  slide !== null &&
  typeof slide === "object" &&
  "question" in slide &&
  "answer" in slide &&
  typeof slide.question === "string" &&
  typeof slide.answer === "string";
