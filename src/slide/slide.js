/** @import { Deck, Slide } from '../types.js' */
import { events } from "../events.js";
import { copyArray, shuffle } from "../utils.js";
import { setupSlideToggle } from "./toggle.js";

/**
 * @param {HTMLElement | null} slideElement
 * @param {() => number} getIndex
 * @returns {void}
 */
export const setupSlide = (slideElement, getIndex) => {
  if (!slideElement) throw new Error("Slide element is not found");

  const toggleElement = slideElement.querySelector("#toggle");
  if (!toggleElement) throw new Error("Toggle element is not found in slide");
  setupSlideToggle(toggleElement);

  const contentElement = slideElement.querySelector("#content");
  if (!contentElement) throw new Error("Content element is not found in slide"); ``

  const questionElement = slideElement.querySelector("#question");
  if (!questionElement) throw new Error("Question element is not found in slide");

  const answerElement = slideElement.querySelector("#answer");
  if (!answerElement) throw new Error("Answer element is not found in slide");

  /** @type {Deck | undefined} */
  let deck;

  /** @type {Slide[] | undefined} */
  let slides;

  events.deckUpdate.subscribe((newDeck) => {
    deck = newDeck;
    slides = deck?.slides;

    if (newDeck?.slides.length) {
      contentElement.hidden = false;
    } else {
      contentElement.hidden = true;
      contentElement.removeAttribute("data-correct");
      questionElement.mdContent = "";
      answerElement.mdContent = "";
      answerElement.ariaHidden = "true";
    }

    events.slideUpdate.dispatch(slides?.[getIndex()]);
  });

  events.indexUpdate.subscribe(() => {
    events.slideUpdate.dispatch(slides?.[getIndex()]);
  });

  /** @type {AbortController} */
  let activeTransition;
  events.slideUpdate.subscribe((slide) => {
    if (questionElement.mdContent == slide?.question &&
      answerElement.mdContent == slide?.answer) {
      return;
    }

    questionElement.mdContent = slide?.question;

    // check if the slide is on the question and not animating
    if (answerElement.parentElement.computedStyleMap().get("transform")?.toString() === "none") {
      // update the answer immediately
      answerElement.mdContent = slide?.answer;
    } else {
      // flip the card back over
      events.slideFlip.dispatch(false);

      // abort previous transitionend event listener
      activeTransition?.abort();
      // add a new transition controller to the list
      const transition = new AbortController();
      activeTransition = transition;

      // delay updating the answer as the slide flip animation
      // can reveal the answer if not delayed
      answerElement.parentElement.addEventListener(
        "transitionend",
        () => { answerElement.mdContent = slide?.answer; },
        { once: true, signal: transition.signal }
      );
    }
  });

  events.slideFlip.subscribe((isFlipped) => {
    if (isFlipped) {
      answerElement.ariaHidden = "false";
    } else {
      answerElement.ariaHidden = "true";
    }
  });

  events.shuffle.subscribe((isShuffle) => {
    if (!deck) return;

    slides = isShuffle
      ? shuffle(copyArray(deck.slides))
      : deck.slides;

    events.slideUpdate.dispatch(slides?.[getIndex()]);
  });

  events.slideCorrect.subscribe((isCorrect) => {
    if (isCorrect) {
      contentElement.dataset.correct = "";
    } else {
      contentElement.removeAttribute("data-correct");
    }
  });
};
