/**
 * @template Control
 * @template {HTMLElement | null | undefined} Target
 * @param {Control} element
 * @param {{
 *     eventCallbacks: {
 *       [event: string]: (element: Control, target: Target) => void;
 *     };
 *     target?: Target;
 *     targetMutationCallbacks?: {
 *       [event: string]: (element: Control, target: Target) => void;
 *     };
 *     keyShortcut?: {
 *       key: string;
 *       shiftKey?: boolean;
 *       callback: (element: Control, target: Target) => void;
 *     };
 *   }} [options]
 * @returns {void}
 */
export const setupControl = (element, options) => {
  if (!(element instanceof HTMLElement)) {
    throw new Error("Element not found");
  }

  if (options?.eventCallbacks) {
    for (const [event, callback] of Object.entries(options.eventCallbacks)) {
      element.addEventListener(event, () => callback(element, options.target));
    }
  }

  if (options?.target && options.targetMutationCallbacks) {
    new MutationObserver(() => {
      for (const [event, callback] of Object.entries(options.targetMutationCallbacks)) {
        element[event] = callback(element, options.target);
      }
    }).observe(options.target, { attributes: true, subtree: true });
  }

  if (options?.keyShortcut) {
    document.addEventListener("keydown", (event) => {
      if (
        event.key === options.keyShortcut.key && (options.keyShortcut.shiftKey === undefined ? true : event.shiftKey)
      ) {
        event.preventDefault();
        options.keyShortcut.callback(element, options.target);
      }
    });
  }
};
