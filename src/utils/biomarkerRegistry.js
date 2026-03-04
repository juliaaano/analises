import registryRaw from '../../biomarkers.txt?raw';

/**
 * Registry of known biomarkers with their display order and attention level.
 * Parsed at build time from biomarkers.txt via Vite ?raw import.
 *
 * Trailing asterisks on a name set the attention level:
 *   * = 1 (light yellow), ** = 2 (light red)
 */
const biomarkerOrder = new Map();
const biomarkerAttention = new Map();

registryRaw
  .split('\n')
  .forEach((line, index) => {
    const raw = line.trim();
    if (!raw) return;

    // Count trailing asterisks (max 2)
    const match = raw.match(/(\*{1,2})$/);
    const attention = match ? match[1].length : 0;
    const name = attention > 0 ? raw.slice(0, -attention).trimEnd() : raw;

    biomarkerOrder.set(name, index);
    if (attention > 0) {
      biomarkerAttention.set(name, attention);
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
 * Get the attention level for a biomarker (0, 1, 2, or 3).
 * @param {string} name
 * @returns {number}
 */
export function getAttentionLevel(name) {
  return biomarkerAttention.get(name) || 0;
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
