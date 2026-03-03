import registryRaw from '../../biomarkers.txt?raw';

/**
 * Registry of known biomarkers with their display order.
 * Parsed at build time from biomarkers.txt via Vite ?raw import.
 */
const biomarkerOrder = new Map();

registryRaw
  .split('\n')
  .forEach((line, index) => {
    const name = line.trim();
    if (name) {
      biomarkerOrder.set(name, index);
    }
  });

/**
 * Check if a biomarker name exists in the registry.
 * @param {string} name
 * @returns {boolean}
 */
export function isRegistered(name) {
  return biomarkerOrder.has(name);
}

/**
 * Sort biomarker names by registry order.
 * Registered biomarkers appear first in registry order.
 * Unregistered biomarkers appear last, sorted alphabetically.
 * @param {string[]} biomarkerNames
 * @returns {string[]}
 */
export function sortBiomarkers(biomarkerNames) {
  return [...biomarkerNames].sort((a, b) => {
    const orderA = biomarkerOrder.get(a);
    const orderB = biomarkerOrder.get(b);
    const aRegistered = orderA !== undefined;
    const bRegistered = orderB !== undefined;

    if (aRegistered && bRegistered) return orderA - orderB;
    if (aRegistered && !bRegistered) return -1;
    if (!aRegistered && bRegistered) return 1;
    return a.localeCompare(b);
  });
}
