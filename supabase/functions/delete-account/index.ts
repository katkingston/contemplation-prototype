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
 */
// @ts-nocheck — Deno runtime types; this file is deployed, not bundled in the app.
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const anon = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
      error: userErr,
    } = await anon.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1. Storage: remove the user's voice memos.
    const { data: objects } = await admin.storage.from('memos').list(user.id, { limit: 1000 });
    if (objects?.length) {
      await admin.storage.from('memos').remove(objects.map((o) => `${user.id}/${o.name}`));
    }

    // 2. Auth user — cascades delete all per-user rows via FKs.
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) throw delErr;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
