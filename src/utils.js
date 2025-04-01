/**
 * Shuffles array in place, using the Fisher-Yates shuffle algorithm
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export const shuffle = (array) => {
  let end = array.length;
  while (end) {
    const i = Math.floor(Math.random() * end--);
    [array[end], array[i]] = [array[i], array[end]];
  }
  return array;
};

/**
 * Creates a new array with the same elements as the input array
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export const copyArray = (array) => [...array];
