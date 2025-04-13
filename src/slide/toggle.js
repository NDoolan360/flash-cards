import { events } from "../events.js";

/**
 * @param {HTMLElement | null} toggleElement
 * @returns {void}
 */
export const setupSlideToggle = (toggleElement) => {
  if (!toggleElement) throw new Error("Toggle element is not found");

  toggleElement.addEventListener("click", () => {
    events.slideFlip.dispatch(toggleElement.checked);
  });

  events.deckUpdate.subscribe((newDeck) => {
    if (newDeck?.slides.length) {
      toggleElement.disabled = false;
    } else {
      toggleElement.disabled = true;
      toggleElement.checked = false;
      toggleElement.removeAttribute("checked");
    }
  });

  events.slideFlip.subscribe((isFlipped) => {
    toggleElement.checked = isFlipped;

    if (isFlipped) {
      toggleElement.setAttribute("checked", "");
    } else {
      toggleElement.removeAttribute("checked");
    }
  });
};
