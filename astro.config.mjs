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
  security: {
    // Astro's built-in checkOrigin compares the full request origin, but behind
    // Railway's TLS-terminating proxy the server sees http:// internally while
    // the browser sends https://, so legitimate form POSTs get a 403. We disable
    // it and enforce a protocol-agnostic, host-based CSRF check in
    // src/middleware.js instead (admin cookies are also SameSite=Lax).
    checkOrigin: false,
  },
});
