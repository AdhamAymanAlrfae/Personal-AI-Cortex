/**
 * Combines and filters class names cleanly
 * @param  {...any} classes 
 * @returns {string}
 */
export function cn(...classes) {
  const result = [];

  for (let i = 0; i < classes.length; i++) {
    const item = classes[i];
    if (!item) continue;

    if (typeof item === 'string') {
      result.push(item);
    } else if (Array.isArray(item)) {
      const nested = cn(...item);
      if (nested) result.push(nested);
    } else if (typeof item === 'object') {
      for (const key in item) {
        if (item[key]) {
          result.push(key);
        }
      }
    }
  }

  return result.join(' ');
}

/**
 * Format date string
 * @param {string} dateString 
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return dateString;
}

/**
 * Slugify a string for clean URL anchor links
 * @param {string} text 
 * @returns {string}
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
