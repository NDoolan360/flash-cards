import { getIndex, getMax } from "./slide.js";

/**
 * @param {HTMLElement | null} element
 * @param {{
 *     target?: HTMLElement | null;
 *   }} [options]
 * @returns {void}
 */
export const setupDeckProgress = (element, options) => {
  if (!(element instanceof HTMLElement)) {
    throw new Error("Element not found for progress");
  }
  if (options?.target && !(options.target instanceof HTMLElement)) {
    throw new Error("Target not found for progress");
  }
  let currentIndex;
  let currentMax;
  if (options?.target) {
    new MutationObserver(() => {
      currentIndex = getIndex(options?.target ?? null);
      currentMax = getMax(options?.target ?? null);
      redrawProgress(element, currentIndex, currentMax);
    }).observe(options.target, { attributes: true, subtree: true });
  }
};
/**
 * @param {HTMLElement} element
 * @param {number} [index]
 * @param {number} [max]
 * @returns {void}
 */
const redrawProgress = (element, index, max) => {
  if (!index || !max) {
    element.innerHTML = "-/-";
    element.dataset.disabled = "true";
  } else {
    element.innerHTML = `${index}/${max}`;
    element.dataset.disabled = "false";
  }
};
