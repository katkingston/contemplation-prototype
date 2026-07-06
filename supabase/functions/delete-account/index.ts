/**
 * delete-account — true account deletion (Apple guideline 5.1.1(v)).
 * Deletes the caller's storage objects and auth user; row deletion cascades
 * via the foreign keys in schema.sql.
 *
 * Deploy (from contemplation-app/):
 *   npx supabase login
 *   npx supabase link --project-ref <your-project-ref>
 *   npx supabase functions deploy delete-account
 *
 * SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY are injected
 * automatically in the Edge runtime — no secrets to configure.
 *
 * Security posture (hostile-reviewed July 2026):
 * - Identity comes ONLY from the verified JWT (explicit token to getUser) —
 *   no user_id parameter exists, so no confused-deputy path.
 * - Storage purge is paginated, recursive, and FAIL-CLOSED: if any object
 *   can't be removed we abort BEFORE deleting the auth user, so a "deleted"
 *   account can never leave voice memos behind.
 * - Errors return a constant body; details go to function logs only.
 */
// @ts-nocheck — Deno runtime types; this file is deployed, not bundled in the app.
import { createClient } from 'npm:@supabase/supabase-js@2.110.0';

function corsHeaders(req: Request) {
  // Bearer-token auth, no cookies — CORS is hygiene here, not the auth
  // boundary. Reflect the origin so web dev (localhost) and native both work.
  return {
    'Access-Control-Allow-Origin': req.headers.get('Origin') ?? '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function json(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(req) },
  });
}

/** Remove every object under `prefix`, descending into folders, failing loudly. */
async function purgePrefix(admin, prefix: string): Promise<void> {
  for (;;) {
    const { data, error } = await admin.storage.from('memos').list(prefix, { limit: 1000 });
    if (error) throw error;
    if (!data?.length) return;
    const files = data.filter((o) => o.id !== null).map((o) => `${prefix}/${o.name}`);
    const folders = data.filter((o) => o.id === null);
    for (const f of folders) await purgePrefix(admin, `${prefix}/${f.name}`);
    if (files.length) {
      const { error: rmErr } = await admin.storage.from('memos').remove(files);
      if (rmErr) throw rmErr;
    }
    if (!files.length && !folders.length) return;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, 405, { error: 'Method not allowed' });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return json(req, 401, { error: 'Not authenticated' });

    const anon = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    const {
      data: { user },
      error: userErr,
    } = await anon.auth.getUser(token);
    if (userErr || !user) return json(req, 401, { error: 'Not authenticated' });

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1. Storage first (does not cascade from auth.users). Fail-closed: any
    //    error aborts before the account disappears, and the op is retryable.
    await purgePrefix(admin, user.id);

    // 2. Auth user — cascades delete all per-user rows via FKs.
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) throw delErr;

    return json(req, 200, { ok: true });
  } catch (e) {
    console.error('delete-account failed', e);
    return json(req, 500, { error: 'Deletion failed' });
  }
});
