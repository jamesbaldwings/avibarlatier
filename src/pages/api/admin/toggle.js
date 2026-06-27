import { isAuthed } from '../../../lib/auth.js';
import { setOverride } from '../../../lib/store.js';
import { isManaged, normalizePath } from '../../../lib/pages.js';

// Toggle a page's published state. Accepts JSON (from the dashboard's fetch)
// or a normal form POST (no-JS fallback), in which case it redirects back.
export async function POST(context) {
  if (!isAuthed(context)) return new Response('Unauthorized', { status: 401 });

  const contentType = context.request.headers.get('content-type') || '';
  const wantsJson = contentType.includes('application/json');

  let path;
  let published;
  if (wantsJson) {
    const body = await context.request.json().catch(() => ({}));
    path = body.path;
    published = !!body.published;
  } else {
    const form = await context.request.formData();
    path = form.get('path');
    const v = form.get('published');
    published = v === 'true' || v === 'on' || v === '1';
  }

  const normalized = normalizePath(path || '');
  if (!isManaged(normalized)) {
    return new Response('Unknown page', { status: 400 });
  }

  await setOverride(normalized, published);

  if (wantsJson) {
    return new Response(JSON.stringify({ ok: true, path: normalized, published }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return context.redirect('/admin/');
}
