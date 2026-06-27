// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Server-rendered: the admin dashboard toggles page visibility live, so public
// pages are rendered on demand (gated by src/middleware.js) rather than prebuilt.
// The sitemap is generated dynamically at /sitemap.xml so it lists only
// currently-published pages.
export default defineConfig({
  site: 'https://avibarlatier.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
});
