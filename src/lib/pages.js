// Registry of pages the admin can publish/unpublish.
// The homepage (/) is intentionally not listed — it is always live.
// `defaultPublished` is the value used until an admin override exists in the
// persistent store (src/lib/store.js). On a fresh deploy with no stored state,
// these defaults apply.

export const managedPages = [
  { path: '/watch/', label: 'Watch', group: 'Primary', defaultPublished: true },
  { path: '/about/', label: 'About', group: 'Primary', defaultPublished: true },
  { path: '/book/', label: 'Book', group: 'Primary', defaultPublished: true },
  { path: '/leadership/', label: 'Leadership', group: 'Primary', defaultPublished: true },
  { path: '/speaking/', label: 'Speaking', group: 'Primary', defaultPublished: true },
  { path: '/more/', label: 'More', group: 'Primary', defaultPublished: true },
  { path: '/teaching/', label: 'Teaching', group: 'Secondary', defaultPublished: true },
  { path: '/research/', label: 'Research', group: 'Secondary', defaultPublished: true },
  { path: '/software/', label: 'Software', group: 'Secondary', defaultPublished: true },
  { path: '/credentials/', label: 'Credentials', group: 'Secondary', defaultPublished: true },
  { path: '/articles/', label: 'Articles', group: 'Secondary', defaultPublished: true },
  { path: '/contact/', label: 'Contact', group: 'Secondary', defaultPublished: true },
];

const byPath = new Map(managedPages.map((p) => [p.path, p]));

// Normalize any incoming pathname to the registry key form: leading + trailing
// slash, lowercased. `/watch`, `/watch/`, `/Watch` all map to `/watch/`.
export function normalizePath(pathname) {
  if (!pathname) return '/';
  let p = pathname.trim().toLowerCase();
  if (!p.startsWith('/')) p = '/' + p;
  if (p !== '/' && !p.endsWith('/')) p = p + '/';
  return p;
}

export function isManaged(pathname) {
  return byPath.has(normalizePath(pathname));
}

// Effective published state: stored override wins, otherwise the registry default.
export function isPublished(pathname, overrides = {}) {
  const p = normalizePath(pathname);
  const page = byPath.get(p);
  if (!page) return true; // unmanaged pages (home, admin, assets) are always served
  if (Object.prototype.hasOwnProperty.call(overrides, p)) return !!overrides[p];
  return page.defaultPublished;
}

// All managed pages with their current effective state — for the admin UI.
export function pagesWithState(overrides = {}) {
  return managedPages.map((p) => ({ ...p, published: isPublished(p.path, overrides) }));
}

// Just the published page paths — for the sitemap.
export function publishedPaths(overrides = {}) {
  return managedPages.filter((p) => isPublished(p.path, overrides)).map((p) => p.path);
}
