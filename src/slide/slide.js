/** @import type { Deck, Slide } from '../types.js' */

import { events } from "../events.js";
import { copyArray, shuffle } from "../utils.js";

/**
 * @param {HTMLElement | null} element
 * @returns {number | undefined}
 */
export const getIndex = (element) => {
  if (element?.dataset.index === undefined) return undefined;
  return Number.parseInt(element.dataset.index);
};

/**
 * @param {HTMLElement | null} element
 * @returns {number | undefined}
 */
export const getMax = (element) => {
  if (element?.dataset.max === undefined) return undefined;
  return Number.parseInt(element.dataset.max);
};

/**
 * @param {HTMLElement | null} element
 * @returns {void}
 */
export const setupDeckSlides = (element) => {
  if (!element) throw new Error("Slides element is not found");

  let deck;
  let slides;
  let index;
  let endless = false;
  let correct = new Set();

  events.deckUpdate.subscribe(async (newDeck) => {
    deck = newDeck;
    slides = deck?.slides;
    index = 0;
    correct = new Set();
    if (deck?.slides.length) {
      element.dataset.max = deck.slides.length.toString();
      element.dataset.index = "1";
    } else {
      element.removeAttribute("data-max");
      element.removeAttribute("data-index");
    }
    updateSlide(element, index);
  });

  events.deckRemoved.subscribe(() => {
    deck = undefined;
    slides = undefined;
    index = undefined;
    correct = new Set();
    element.removeAttribute("data-max");
    element.removeAttribute("data-index");
    updateSlide(element, undefined);
  });

  events.slideUpdate.subscribe((delta) => {
    if (!slides?.length || index === undefined || delta === 0) return;
    const max = slides.length;
    let newIndex = index + delta;
    if (endless) {
      newIndex = (newIndex + max) % max;
    } else {
      newIndex = Math.min(Math.max(newIndex, 0), max - 1);
    }
    index = newIndex;
    element.dataset.index = (newIndex + 1).toString();
    updateSlide(element, newIndex);
  });

  events.shuffle.subscribe((isShuffle) => {
    if (!deck || index === undefined) return;
    if (isShuffle) {
      slides = shuffle(copyArray(deck.slides));
    } else {
      slides = deck.slides;
    }
    updateSlide(element, index);
  });

  events.endless.subscribe((isEndless) => {
    endless = isEndless;
    element.dataset.endless = isEndless.toString();
  });

  events.slideCorrect.subscribe((isCorrect) => {
    const slideElement = element.querySelector("#slide");
    if (!slides?.length || index === undefined || !slideElement) return;
    // clear the "correct" state
    correct.delete(slides[index]);
    slideElement.removeAttribute("data-correct");

    if (isCorrect) {
      correct.add(slides[index]);
      slideElement.dataset.correct = "true";
    }

    if (correct.size === slides.length) {
      events.deckComplete.dispatch(deck);
    }
  });

  const updateSlide = (element, index) => {
    element
      .querySelector("#toggle")
      ?.removeEventListener("input", ({ target }) =>
        events.slideFlip.dispatch(target.checked),
      );
    if (index === undefined || slides?.[index] === undefined) {
      element.replaceChildren();
    } else {
      const slide = slides[index];
      // Get the template for the new slide
      const templFrag = document.querySelector("template#slide-template");
      const slideTemplate =
        templFrag?.firstElementChild || templFrag?.content?.firstElementChild;
      if (!slideTemplate) throw new Error("No page template found");
      const newSlide = slideTemplate.cloneNode(true);
      if (correct.has(slide)) newSlide.dataset.correct = "";
      const questionSpan = newSlide.querySelector("#question");
      const answerSpan = newSlide.querySelector("#answer");
      if (questionSpan) questionSpan.innerHTML = slide.question;
      if (answerSpan) answerSpan.innerHTML = slide.answer;
      newSlide
        .querySelector("#toggle")
        ?.addEventListener("input", ({ target }) =>
          events.slideFlip.dispatch(target.checked),
        );
      element.replaceChildren(newSlide);
    }
  };
};
