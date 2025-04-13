import { setupControl } from "../control.js";
import { events } from "../events.js";

/**
 * @param {HTMLElement | null} element
 * @param {HTMLProgressElement | null} progressElement
 * @param {HTMLElement | null} slideElement
 * @returns {void}
 */
export const setupSlideControls = (element, progressElement, slideElement) => {
  const previous = element.querySelector("#prev");
  if (!previous) throw new Error("Previous button element is not found");
  setupControl(previous, {
    eventCallbacks: { click: () => events.indexUpdate.dispatch(-1) },
    target: progressElement,
    targetMutationCallbacks: {
      disabled: (_, target) =>
        target.disabled || (target.value <= 1 && target.dataset.loop !== "true"),
    },
    keyShortcut: { key: "ArrowLeft", callback: (el) => el.click() },
  });

  const next = element.querySelector("#next");
  if (!next) throw new Error("Next button element is not found");
  setupControl(next, {
    eventCallbacks: { click: () => events.indexUpdate.dispatch(+1) },
    target: progressElement,
    targetMutationCallbacks: {
      disabled: (_, target) =>
        target.disabled || (target.value === target.max && target.dataset.loop !== "true"),
    },
    keyShortcut: { key: "ArrowRight", callback: (el) => el.click() },
  });

  const flip = element.querySelector("#flip");
  if (!flip) throw new Error("Flip button element is not found");
  setupControl(flip, {
    eventCallbacks: {
      click: (_, target) => events.slideFlip.dispatch(!target.checked),
    },
    target: slideElement.querySelector("#toggle"),
    targetMutationCallbacks: { disabled: (_, target) => target.disabled },
    keyShortcut: { key: " ", shiftKey: true, callback: (el) => el.click() },
  });

  const correct = element.querySelector("#correct");
  if (!correct) throw new Error("Correct button element is not found");
  setupControl(correct, {
    eventCallbacks: {
      change: (element) => events.slideCorrect.dispatch(element.checked),
    },
    target: slideElement.querySelector("#content"),
    targetMutationCallbacks: {
      disabled: (_, target) => !!target.hidden,
      checked: (_, target) => target.dataset.correct !== undefined,
    },
    keyShortcut: { key: "Enter", shiftKey: true, callback: (el) => el.click() },
  });

  const shuffle = element.querySelector("#shuffle");
  if (!shuffle) throw new Error("Shuffle button element is not found");
  setupControl(shuffle, {
    eventCallbacks: { change: (element) => events.shuffle.dispatch(element.checked) },
    target: progressElement,
    targetMutationCallbacks: {
      disabled: (_, target) => target.disabled,
    },
    keyShortcut: { key: "S", shiftKey: true, callback: (el) => el.click() },
  });

  const loop = element.querySelector("#loop");
  if (!loop) throw new Error("Loop button element is not found");
  setupControl(loop, {
    eventCallbacks: {
      change: (element) => events.loop.dispatch(element.checked),
    },
    target: progressElement,
    targetMutationCallbacks: {
      disabled: (_, target) => target.disabled,
    },
    keyShortcut: { key: "L", shiftKey: true, callback: (el) => el.click() },
  });
};
