/**
 * @template Control
 * @template {HTMLElement | null | undefined} Target
 * @param {Control} element
 * @param {{
 *     target?: Target;
 *     eventHandlers: {
 *       [event: string]: (element: Control, target: Target) => void;
 *     };
 *     checkDisabled?: (element: Control, target: Target) => boolean;
 *   }} [options]
 * @returns {void}
 */
export const setupControl = (element, options) => {
  if (!(element instanceof HTMLElement)) {
    throw new Error("Element not found");
  }
  if (options?.eventHandlers) {
    for (const [event, callback] of Object.entries(options.eventHandlers)) {
      element.addEventListener(event, () => callback(element, options.target));
    }
  }
  if ("disabled" in element) {
    element.disabled = false;
    if (options?.checkDisabled && options.target) {
      element.disabled = options.checkDisabled(element, options.target);
      if (options.target) {
        new MutationObserver(() => {
          element.disabled = options.checkDisabled(element, options.target);
        }).observe(options.target, { attributes: true, subtree: true });
      }
    }
  }
};
