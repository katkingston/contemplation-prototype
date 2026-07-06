/**
 * Supabase adapter — the real backend (Phase B).
 *
 * Activation: create a project, run supabase/schema.sql + supabase/setup-extras.sql,
 * fill .env (URL + anon key), set EXPO_PUBLIC_DATA_PROVIDER=supabase.
 *
 * Shape: implements the same AppServices contract as the local adapter, so no
 * screen changes. Pre-auth onboarding state (disclaimer, free taste, mock plan
 * choice) is held in the local store and imported to the cloud on first
 * sign-in, then cleared — testers keep their history across the switch.
 *
 * Production notes:
 * - Mock grants are inserted client-side under a PROTOTYPE-ONLY RLS policy;
 *   Phase C replaces this with the RevenueCat webhook Edge Function.
 * - deleteAccount invokes the `delete-account` Edge Function (true deletion,
 *   Apple 5.1.1(v)); until it's deployed we fall back to sign-out + local wipe.
 */
import {
  AppData,
  AppServices,
  AnswerValue,
  DiaryEntry,
  EMPTY_DATA,
  DEFAULT_SETTINGS,
  Settings,
  SeriesProgress,
} from '@/services/types';
import type { ProductType } from '@/content/copy';
import { LocalServices } from '@/services/local';
import { getSupabase } from './client';

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function localDate(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export class SupabaseServices implements AppServices {
  /** Pre-auth onboarding state lives locally until first sign-in. */
  private pre = new LocalServices();

  private async userId(): Promise<string | null> {
    const { data } = await getSupabase().auth.getSession();
    return data.session?.user?.id ?? null;
  }

  // ---------- load ----------

  async loadAll(): Promise<AppData> {
    const sb = getSupabase();
    const uid_ = await this.userId();
    if (!uid_) return this.pre.loadAll(); // onboarding before login

    const [profile, progress, diary, sessions, grants] = await Promise.all([
      sb.from('profiles').select('*').eq('user_id', uid_).maybeSingle(),
      sb.from('user_progress').select('*').eq('user_id', uid_),
      sb.from('diary_entries').select('*').eq('user_id', uid_).order('created_at'),
      sb.from('contemplation_sessions').select('*').eq('user_id', uid_),
      sb.from('access_grants').select('*').eq('user_id', uid_),
    ]);

    const p = profile.data;
    const data: AppData = {
      ...EMPTY_DATA,
      disclaimerAcceptedAt: p?.disclaimer_accepted_at ?? new Date().toISOString(),
      profile: {
        email: p?.email ?? '',
        username: p?.username ?? '',
        createdAt: p?.created_at ?? new Date().toISOString(),
      },
      intake: null, // stored server-side, never shown back — screens don't need it
      surveys: [],
      settings: { ...DEFAULT_SETTINGS, ...((p?.settings as Partial<Settings>) ?? {}) },
      onboardingStep: (p?.onboarding_step as AppData['onboardingStep']) ?? 'done',
      progress: Object.fromEntries(
        (progress.data ?? []).map((r) => [
          r.series_id,
          {
            seriesId: r.series_id,
            currentIndex: r.current_index,
            completedAt: r.completed_at,
            lastOpened: r.last_opened,
            lastCompletedAt: r.last_completed_at ?? null,
            replayCount: r.replay_count,
            useAltQuestions: r.use_alt_questions,
          } satisfies SeriesProgress,
        ]),
      ),
      sessions: (sessions.data ?? []).map((r) => ({
        id: r.id,
        seriesId: r.series_id,
        contemplationId: r.contemplation_id,
        seconds: r.seconds,
        date: r.session_date,
      })),
      grants: (grants.data ?? []).map((r) => ({
        id: r.id,
        productType: r.product_type as ProductType,
        seriesId: r.series_id,
        startsAt: r.starts_at,
        expiresAt: r.expires_at,
        mock: true, // all client-written grants are mock in the prototype
      })),
      diary: [],
    };

    // Diary: resolve signed URLs for stored audio paths so MemoPlayer works untouched.
    const rows = diary.data ?? [];
    const paths = rows.map((r) => r.audio_path).filter(Boolean) as string[];
    const signed: Record<string, string> = {};
    if (paths.length) {
      const { data: urls } = await sb.storage.from('memos').createSignedUrls(paths, 3600);
      (urls ?? []).forEach((u, i) => {
        if (u.signedUrl) signed[paths[i]] = u.signedUrl;
      });
    }
    data.diary = rows.map((r) => ({
      id: r.id,
      seriesId: r.contemplation_id?.split('-c')[0] ?? '',
      contemplationId: r.contemplation_id,
      prompt: r.prompt,
      text: r.text,
      audioUri: r.audio_path ? (signed[r.audio_path] ?? null) : null,
      audioDurationSec: r.audio_duration_sec,
      createdAt: r.created_at,
      isRevealed: r.is_revealed,
    }));
    // seriesId isn't a diary column (schema keys by contemplation); recover it
    // from the id convention `s1-impermanence-c3`, falling back to progress.
    data.diary.forEach((e) => {
      if (!e.seriesId || !e.seriesId.startsWith('s')) {
        const m = e.contemplationId.match(/^(.*)-c\d+$/);
        e.seriesId = m ? m[1] : e.seriesId;
      }
    });
    return data;
  }

  // ---------- auth ----------

  async requestEmailCode(email: string): Promise<void> {
    const { error } = await getSupabase().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  }

  async verifyEmailCode(email: string, code: string, username: string): Promise<void> {
    const sb = getSupabase();
    const { error } = await sb.auth.verifyOtp({ email, token: code, type: 'email' });
    if (error) throw error;
    const uid_ = await this.userId();
    if (!uid_) throw new Error('Sign-in did not produce a session.');
    await sb
      .from('profiles')
      .upsert({ user_id: uid_, email, username, onboarding_step: 'intake' });
    await this.importLocalOnFirstSignIn(uid_);
  }

  /** Local mock path — not used when OTP methods exist, but kept for safety. */
  async createAccount(email: string, username: string): Promise<void> {
    await this.pre.createAccount(email, username);
  }

  async signOut(): Promise<void> {
    await getSupabase().auth.signOut();
    await this.pre.deleteAccount(); // clear any pre-auth remnants
  }

  /** One-time: move pre-auth/local prototype data up to the cloud. */
  private async importLocalOnFirstSignIn(uid_: string): Promise<void> {
    const sb = getSupabase();
    try {
      // Only a TRUE first sign-in imports. A returning user signing in on a
      // new device already has cloud data — importing that device's pre-auth
      // scraps would append duplicate rows (and re-inject local mock grants).
      const { count } = await sb
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid_);
      if (count && count > 0) {
        await this.pre.deleteAccount(); // discard pre-auth scraps — cloud is truth
        return;
      }
      const local = await this.pre.loadAll();
      const updates: Record<string, unknown> = {};
      if (local.disclaimerAcceptedAt) updates.disclaimer_accepted_at = local.disclaimerAcceptedAt;
      if (Object.keys(local.settings).length) updates.settings = local.settings;
      if (Object.keys(updates).length) {
        await sb.from('profiles').update(updates).eq('user_id', uid_);
      }
      for (const g of local.grants) {
        await sb.from('access_grants').insert({
          user_id: uid_,
          product_type: g.productType,
          series_id: g.seriesId,
          starts_at: g.startsAt,
          expires_at: g.expiresAt,
        });
      }
      for (const [sid, pr] of Object.entries(local.progress)) {
        await sb.from('user_progress').upsert({
          user_id: uid_,
          series_id: sid,
          current_index: pr.currentIndex,
          completed_at: pr.completedAt,
          last_opened: pr.lastOpened,
          last_completed_at: pr.lastCompletedAt,
          replay_count: pr.replayCount,
          use_alt_questions: pr.useAltQuestions,
        });
      }
      for (const s of local.sessions) {
        await sb.from('contemplation_sessions').insert({
          user_id: uid_,
          series_id: s.seriesId,
          contemplation_id: s.contemplationId,
          seconds: s.seconds,
          session_date: s.date,
        });
      }
      for (const e of local.diary) {
        // Text imports cleanly; local audio (file:/blob:) is uploaded best-effort.
        let audioPath: string | null = null;
        if (e.audioUri && !e.audioUri.startsWith('http')) {
          audioPath = await this.uploadMemo(uid_, e.audioUri).catch(() => null);
        }
        await sb.from('diary_entries').insert({
          user_id: uid_,
          contemplation_id: e.contemplationId,
          prompt: e.prompt,
          text: e.text,
          audio_path: audioPath,
          audio_duration_sec: e.audioDurationSec,
          created_at: e.createdAt,
          is_revealed: e.isRevealed,
        });
      }
      await this.pre.deleteAccount(); // clear the local store — cloud is now truth
    } catch {
      // Import is best-effort; never block sign-in on it.
    }
  }

  // ---------- lifecycle ----------

  async acceptDisclaimer(): Promise<void> {
    const uid_ = await this.userId();
    if (!uid_) return this.pre.acceptDisclaimer();
    await getSupabase()
      .from('profiles')
      .update({ disclaimer_accepted_at: new Date().toISOString(), onboarding_step: 'free' })
      .eq('user_id', uid_);
  }

  async setOnboardingStep(step: AppData['onboardingStep']): Promise<void> {
    const uid_ = await this.userId();
    if (!uid_) return this.pre.setOnboardingStep(step);
    await getSupabase().from('profiles').update({ onboarding_step: step }).eq('user_id', uid_);
  }

  async deleteAccount(): Promise<void> {
    const sb = getSupabase();
    // True deletion (Apple 5.1.1(v)) — server-side Edge Function. If the call
    // fails for ANY reason (not deployed, server error, network), we throw so
    // the UI reports failure — never claim deletion that didn't happen.
    const { error } = await sb.functions.invoke('delete-account');
    if (error) {
      throw new Error(
        'Account deletion failed on the server — nothing was deleted. Please try again.',
      );
    }
    await sb.auth.signOut().catch(() => {});
    await this.pre.deleteAccount();
  }

  async exportData(): Promise<string> {
    // Redact signed memo URLs: they are live, unauthenticated links to private
    // recordings — an exported/shared JSON must not carry them.
    const data = await this.loadAll();
    const diary = data.diary.map((e) => ({
      ...e,
      audioUri: e.audioUri ? '[voice memo stored in your account]' : null,
    }));
    return JSON.stringify({ ...data, diary }, null, 2);
  }

  // ---------- intake / surveys ----------

  async saveIntake(answers: Record<string, AnswerValue>): Promise<void> {
    const uid_ = await this.userId();
    if (!uid_) return this.pre.saveIntake(answers);
    const sb = getSupabase();
    await sb.from('intake_answers').insert({ user_id: uid_, answers });
    await sb.from('profiles').update({ onboarding_step: 'done' }).eq('user_id', uid_);
  }

  async saveSurvey(seriesId: string, answers: Record<string, AnswerValue>): Promise<void> {
    const uid_ = await this.userId();
    if (!uid_) return this.pre.saveSurvey(seriesId, answers);
    await getSupabase()
      .from('survey_answers')
      .insert({ user_id: uid_, series_id: seriesId, answers });
  }

  // ---------- progress ----------

  async recordContemplationComplete(
    seriesId: string,
    contemplationId: string,
    seconds: number,
    opts?: { backdate?: boolean },
  ): Promise<void> {
    const uid_ = await this.userId();
    if (!uid_) return this.pre.recordContemplationComplete(seriesId, contemplationId, seconds, opts);
    const sb = getSupabase();
    const { data: row } = await sb
      .from('user_progress')
      .select('*')
      .eq('user_id', uid_)
      .eq('series_id', seriesId)
      .maybeSingle();
    const completedAt = opts?.backdate
      ? new Date(Date.now() - 50 * 3600_000).toISOString()
      : new Date().toISOString();
    await sb.from('user_progress').upsert({
      user_id: uid_,
      series_id: seriesId,
      current_index: (row?.current_index ?? 0) + 1,
      completed_at: row?.completed_at ?? null,
      last_opened: localDate(),
      last_completed_at: completedAt,
      replay_count: row?.replay_count ?? 0,
      use_alt_questions: row?.use_alt_questions ?? false,
    });
    await sb.from('contemplation_sessions').insert({
      user_id: uid_,
      series_id: seriesId,
      contemplation_id: contemplationId,
      seconds,
      session_date: localDate(),
    });
  }

  async markSeriesComplete(seriesId: string): Promise<void> {
    const uid_ = await this.userId();
    if (!uid_) return this.pre.markSeriesComplete(seriesId);
    const sb = getSupabase();
    await sb
      .from('user_progress')
      .update({ completed_at: new Date().toISOString() })
      .eq('user_id', uid_)
      .eq('series_id', seriesId)
      .is('completed_at', null);
    // Reveal is a flag flip — the write happened at save time (hard rule).
    await sb
      .from('diary_entries')
      .update({ is_revealed: true })
      .eq('user_id', uid_)
      .like('contemplation_id', `${seriesId}-%`);
  }

  async startReplay(seriesId: string, useAltQuestions: boolean): Promise<void> {
    const uid_ = await this.userId();
    if (!uid_) return this.pre.startReplay(seriesId, useAltQuestions);
    const sb = getSupabase();
    const { data: row } = await sb
      .from('user_progress')
      .select('replay_count')
      .eq('user_id', uid_)
      .eq('series_id', seriesId)
      .maybeSingle();
    await sb
      .from('user_progress')
      .update({
        replay_count: (row?.replay_count ?? 0) + 1,
        current_index: 0,
        completed_at: null,
        use_alt_questions: useAltQuestions,
      })
      .eq('user_id', uid_)
      .eq('series_id', seriesId);
  }

  // ---------- diary ----------

  private async uploadMemo(uid_: string, localUri: string): Promise<string> {
    const sb = getSupabase();
    // Only device-local recordings — never fetch remote URLs into the bucket.
    if (!/^(file|blob|content):/.test(localUri)) {
      throw new Error('Invalid memo source');
    }
    const resp = await fetch(localUri);
    const buf = await resp.arrayBuffer();
    // ~60s of AAC/Opus is well under 2MB; 8MB is generous headroom, and the
    // bucket enforces the same cap server-side (setup-extras.sql).
    if (buf.byteLength > 8 * 1024 * 1024) {
      throw new Error('Voice memo exceeds the maximum size');
    }
    const ext = localUri.includes('.webm') ? 'webm' : 'm4a';
    const path = `${uid_}/${uid()}.${ext}`;
    const { error } = await sb.storage.from('memos').upload(path, buf, {
      contentType: ext === 'webm' ? 'audio/webm' : 'audio/m4a',
    });
    if (error) throw error;
    return path;
  }

  async saveDiaryEntry(e: Omit<DiaryEntry, 'id' | 'createdAt' | 'isRevealed'>): Promise<void> {
    const uid_ = await this.userId();
    if (!uid_) return this.pre.saveDiaryEntry(e);
    const sb = getSupabase();
    let audioPath: string | null = null;
    if (e.audioUri) {
      audioPath = await this.uploadMemo(uid_, e.audioUri).catch(() => null);
    }
    await sb.from('diary_entries').insert({
      user_id: uid_,
      contemplation_id: e.contemplationId,
      prompt: e.prompt,
      text: e.text,
      audio_path: audioPath,
      audio_duration_sec: e.audioDurationSec,
      is_revealed: false, // saved immediately, hidden until series completion
    });
  }

  // ---------- access ----------

  async grantAccess(productType: ProductType, seriesId: string | null = null): Promise<void> {
    const uid_ = await this.userId();
    if (!uid_) return this.pre.grantAccess(productType, seriesId);
    const now = new Date();
    let expiresAt: string | null = null;
    if (productType === 'monthly') expiresAt = new Date(now.getTime() + 30 * 86400_000).toISOString();
    if (productType === 'annual') expiresAt = new Date(now.getTime() + 365 * 86400_000).toISOString();
    // PROTOTYPE ONLY (see setup-extras.sql) — Phase C moves this to the webhook.
    await getSupabase().from('access_grants').insert({
      user_id: uid_,
      product_type: productType,
      series_id: productType === 'series_pack' ? seriesId : null,
      starts_at: now.toISOString(),
      expires_at: expiresAt,
    });
  }

  async cancelAccess(): Promise<void> {
    const uid_ = await this.userId();
    if (!uid_) return this.pre.cancelAccess();
    await getSupabase()
      .from('access_grants')
      .update({ expires_at: new Date().toISOString() })
      .eq('user_id', uid_)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
  }

  // ---------- settings ----------

  async saveSettings(s: Partial<Settings>): Promise<void> {
    const uid_ = await this.userId();
    if (!uid_) return this.pre.saveSettings(s);
    const sb = getSupabase();
    const { data: p } = await sb.from('profiles').select('settings').eq('user_id', uid_).maybeSingle();
    await sb
      .from('profiles')
      .update({ settings: { ...((p?.settings as object) ?? {}), ...s } })
      .eq('user_id', uid_);
  }
}
