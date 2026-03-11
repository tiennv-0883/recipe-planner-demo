/**
 * clear-storage-snippet.js
 *
 * Prints a browser console snippet to clear all `rp:*` localStorage keys
 * used by the Recipe Planner application.
 *
 * Usage:
 *   node scripts/clear-storage-snippet.js
 *
 * Then paste the output into your browser's DevTools console while
 * the Recipe Planner app is open.
 */

const snippet = `
// ── Recipe Planner: Clear all localStorage keys ──────────────────────────────
(function clearRecipePlannerStorage() {
  const prefix = 'rp:';
  const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
  keysToRemove.forEach((k) => localStorage.removeItem(k));
  console.log('[RecipePlanner] Cleared ' + keysToRemove.length + ' key(s):', keysToRemove);
})();
// ─────────────────────────────────────────────────────────────────────────────
`.trim();

console.log('\nPaste the following snippet into your browser DevTools console:\n');
console.log(snippet);
console.log('\nStorage keys that will be removed:');
console.log('  rp:recipes       — your recipe library');
console.log('  rp:meal-plans    — weekly meal plan data');
console.log('  rp:grocery-lists — grocery list data');
console.log('\nAfter running, reload the page to see seed data restored.\n');
