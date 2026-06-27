import { defineMiddleware } from 'astro:middleware';
import { getOverrides } from './lib/store.js';
import { isManaged, isPublished, normalizePath } from './lib/pages.js';
import { isAuthed } from './lib/auth.js';

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

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
