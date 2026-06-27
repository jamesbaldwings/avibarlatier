import { clearSession } from '../../../lib/auth.js';

export async function POST(context) {
  clearSession(context);
  return context.redirect('/admin/login/');
}
