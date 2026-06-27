import { defineMiddleware } from 'astro:middleware';
import { getOverrides } from './lib/store.js';
import { isManaged, isPublished, normalizePath } from './lib/pages.js';
import { isAuthed } from './lib/auth.js';

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // CSRF guard for state-changing admin requests. Astro's checkOrigin is off
  // (it breaks behind Railway's proxy), so we compare the Origin host to the
  // request Host — protocol-agnostic, works behind a TLS-terminating proxy.
  // Browsers always send Origin on POST; a cross-site form post won't match.
  if (
    context.request.method === 'POST' &&
    (pathname.startsWith('/admin') || pathname.startsWith('/api/admin'))
  ) {
    const origin = context.request.headers.get('origin');
    const host = context.request.headers.get('host');
    let originHost = null;
    try {
      originHost = origin ? new URL(origin).host : null;
    } catch {
      originHost = null;
    }
    if (!originHost || !host || originHost !== host) {
      return new Response('Cross-site request forbidden', { status: 403 });
    }
  }

  // Make visibility available to every component (Header/Footer hide hidden links).
  const overrides = await getOverrides();
  context.locals.overrides = overrides;
  context.locals.isPublished = (p) => isPublished(p, overrides);
  context.locals.isAdmin = isAuthed(context);

  // Protect the admin dashboard. The login page and admin API endpoints
  // handle their own auth, so let those through.
  if (pathname === '/admin' || pathname === '/admin/') {
    if (!context.locals.isAdmin) return context.redirect('/admin/login/');
    return next();
  }

  // Gate unpublished public pages: show a friendly "coming soon" (HTTP 404)
  // instead of the real content, without changing the URL.
  if (isManaged(pathname) && !isPublished(pathname, overrides)) {
    context.locals.requestedPath = normalizePath(pathname);
    return context.rewrite('/coming-soon/');
  }

  return next();
});
