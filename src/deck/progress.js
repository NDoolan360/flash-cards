import { events } from "../events.js";

/**
 * @param {HTMLProgressElement | null} element
 * @returns {void}
 */
export const setupDeckProgress = (element) => {
  if (!(element instanceof HTMLElement)) {
    throw new Error("Element not found for progress");
  }

  /** @type {number} */
  let index;
  /** @type {number} */
  let max;

  /** @type {boolean[] | undefined} */
  let correct;

  const redrawProgress = () => {
    if (!max) {
      element.dataset.index = "0";
      element.value = 0;
      element.max = 1;
      element.disabled = true;
      element.ariaDisabled = "true";
      element.textContent = "";
    } else {
      element.dataset.index = index.toString();
      element.value = index + 1;
      element.max = max;
      element.disabled = false;
      element.ariaDisabled = "false";
      element.textContent = `${index} of ${max}`;
    }
    element.title = element.textContent;
  };

  events.deckUpdate.subscribe((newDeck) => {
    index = 0;
    max = newDeck?.slides.length ?? 0;
    console.log(index, max)
    correct = new Array(max).fill(false);
    redrawProgress();
  });

  events.indexUpdate.subscribe((delta) => {
    if (delta === 0) return;

    if (element.dataset.loop === "true") {
      index = ((index + delta + max) % max);
    } else {
      index = Math.min(Math.max(index + delta, 0), max);
    }

    redrawProgress();
    events.slideCorrect.dispatch(correct[index]);
  });

  events.loop.subscribe((isLooping) => {
    element.dataset.loop = isLooping.toString();
  });


  events.slideCorrect.subscribe((isCorrect) => {
    correct[index] = isCorrect;
    redrawProgress();

    events.deckComplete.dispatch(correct.every((correct) => !!correct));
  });

  events.deckComplete.subscribe((isComplete) => {
    element.dataset.complete = isComplete.toString();
  });
};
