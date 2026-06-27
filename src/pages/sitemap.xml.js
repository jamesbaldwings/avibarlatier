import { getCollection } from 'astro:content';
import { getOverrides } from '../lib/store.js';
import { publishedPaths } from '../lib/pages.js';
import { site } from '../data/site.js';

// Dynamic sitemap: lists the homepage plus only the currently-published pages,
// so unpublished pages are never advertised to search engines.
export async function GET() {
  const overrides = await getOverrides();
  const base = site.url.replace(/\/$/, '');
  const published = publishedPaths(overrides);

  const paths = new Set(['/']);
  for (const p of published) paths.add(p);

  // Include article detail pages only when the Articles section is live.
  if (published.includes('/articles/')) {
    const articles = await getCollection('articles', (a) => !a.data.draft);
    for (const a of articles) paths.add(`/articles/${a.id}/`);
  }

  const urls = [...paths]
    .map((p) => `  <url><loc>${base}${p}</loc></url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
