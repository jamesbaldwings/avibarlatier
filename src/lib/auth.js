// Minimal stateless admin auth for a single-user dashboard.
//
// Login compares the submitted password against the ADMIN_PASSWORD env var.
// On success we set an httpOnly cookie holding a token derived from the
// password (HMAC of a fixed message, keyed by the password). The token is
// re-derivable on every request, so auth survives restarts with no session
// store, and changing ADMIN_PASSWORD invalidates all existing cookies.

import crypto from 'node:crypto';

export const COOKIE_NAME = 'ab_admin';
const TOKEN_MESSAGE = 'avibarlatier-admin-v1';

function adminPassword() {
  return process.env.ADMIN_PASSWORD || '';
}

/** True when an admin password has been configured. */
export function isConfigured() {
  return adminPassword().length > 0;
}

function timingSafeEqualStr(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** The cookie value for the current password. */
export function sessionToken() {
  return crypto.createHmac('sha256', adminPassword()).update(TOKEN_MESSAGE).digest('hex');
}

/** Validate a login attempt. */
export function checkPassword(submitted) {
  if (!isConfigured()) return false;
  return timingSafeEqualStr(submitted, adminPassword());
}

/** Validate the admin cookie on a request (context has `.cookies`). */
export function isAuthed(context) {
  if (!isConfigured()) return false;
  const token = context.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return timingSafeEqualStr(token, sessionToken());
}

/** Set the admin session cookie. */
export function setSession(context) {
  context.cookies.set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: context.url.protocol === 'https:',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/** Clear the admin session cookie. */
export function clearSession(context) {
  context.cookies.delete(COOKIE_NAME, { path: '/' });
}
