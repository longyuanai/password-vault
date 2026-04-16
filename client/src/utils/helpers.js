/**
 * Format a date string to locale format.
 */
export function formatDate(dateStr, locale = 'zh-CN') {
  return new Date(dateStr).toLocaleDateString(locale)
}

/**
 * Simple debounce utility.
 */
export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Deep clone via structuredClone (modern browsers).
 */
export function deepClone(obj) {
  return structuredClone(obj)
}
