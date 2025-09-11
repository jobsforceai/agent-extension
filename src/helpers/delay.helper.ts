/**
 * Helper function to introduce a delay.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))
