// Persistent key/value store for admin page-visibility overrides.
//
// Shape on disk: { "/watch/": true, "/book/": false, ... }  (path -> published)
//
// Persistence: writes to $DATA_DIR (mount a Railway Volume there so state
// survives redeploys). With no volume it writes to ./.data inside the container,
// which works but resets on redeploy — in that case pages fall back to the
// defaults declared in src/lib/pages.js. See README for volume setup.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.DATA_DIR || path.resolve('./.data');
const STATE_FILE = path.join(DATA_DIR, 'page-state.json');

// In-process cache. The server is a single instance, so this stays consistent
// with disk; writes update both.
let cache = null;

async function load() {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    cache = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    cache = {}; // missing file / bad JSON -> empty overrides
  }
  return cache;
}

/** Returns the overrides map: { [path]: boolean }. */
export async function getOverrides() {
  return { ...(await load()) };
}

/** Set one page's published flag and persist. Returns the new overrides map. */
export async function setOverride(pathKey, published) {
  const current = await load();
  current[pathKey] = !!published;
  cache = current;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify(current, null, 2), 'utf8');
  } catch (err) {
    // Keep the in-memory change even if disk write fails (e.g. read-only fs);
    // it will simply not survive a restart.
    console.error('[store] failed to persist page-state.json:', err);
  }
  return { ...current };
}
