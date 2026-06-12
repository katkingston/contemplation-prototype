/**
 * Local adapter — AsyncStorage-backed, works on iOS/Android/web.
 * Default for the prototype. The Supabase adapter implements the same
 * AppServices interface; switching providers never touches screens.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppData,
  AppServices,
  AnswerValue,
  DiaryEntry,
  EMPTY_DATA,
  Settings,
} from '@/services/types';
import type { ProductType } from '@/content/copy';

const KEY = 'contemplation/app-data/v1';

let uidCounter = 0;
function uid(): string {
  uidCounter += 1;
  return `${Date.now().toString(36)}-${uidCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export class LocalServices implements AppServices {
  private cache: AppData | null = null;

  private async read(): Promise<AppData> {
    if (this.cache) return this.cache;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      this.cache = raw ? { ...EMPTY_DATA, ...(JSON.parse(raw) as AppData) } : { ...EMPTY_DATA };
    } catch {
      this.cache = { ...EMPTY_DATA };
    }
    return this.cache;
  }

  private async write(mutate: (d: AppData) => void): Promise<void> {
    const d = await this.read();
    mutate(d);
    this.cache = d;
    await AsyncStorage.setItem(KEY, JSON.stringify(d));
  }

  async loadAll(): Promise<AppData> {
    const d = await this.read();
    return JSON.parse(JSON.stringify(d)) as AppData;
  }

  async acceptDisclaimer(): Promise<void> {
    await this.write((d) => {
      d.disclaimerAcceptedAt = new Date().toISOString();
      d.onboardingStep = 'free';
    });
  }

  async setOnboardingStep(step: AppData['onboardingStep']): Promise<void> {
    await this.write((d) => {
      d.onboardingStep = step;
    });
  }

  async createAccount(email: string, username: string): Promise<void> {
    await this.write((d) => {
      d.profile = { email, username, createdAt: new Date().toISOString() };
    });
  }

  async deleteAccount(): Promise<void> {
    this.cache = null;
    await AsyncStorage.removeItem(KEY);
  }

  async exportData(): Promise<string> {
    const d = await this.read();
    return JSON.stringify(d, null, 2);
  }

  async saveIntake(answers: Record<string, AnswerValue>): Promise<void> {
    await this.write((d) => {
      d.intake = answers;
      d.onboardingStep = 'done';
    });
  }

  async saveSurvey(seriesId: string, answers: Record<string, AnswerValue>): Promise<void> {
    await this.write((d) => {
      d.surveys.push({ seriesId, answers, createdAt: new Date().toISOString() });
    });
  }

  async recordContemplationComplete(
    seriesId: string,
    contemplationId: string,
    seconds: number,
  ): Promise<void> {
    await this.write((d) => {
      const p = d.progress[seriesId] ?? {
        seriesId,
        currentIndex: 0,
        completedAt: null,
        lastOpened: null,
        replayCount: 0,
        useAltQuestions: false,
      };
      p.currentIndex += 1;
      p.lastOpened = todayISO();
      d.progress[seriesId] = p;
      d.sessions.push({ id: uid(), seriesId, contemplationId, seconds, date: todayISO() });
    });
  }

  async markSeriesComplete(seriesId: string): Promise<void> {
    await this.write((d) => {
      const p = d.progress[seriesId];
      if (p && !p.completedAt) p.completedAt = new Date().toISOString();
      // Reveal the diary for this series — hiding is a filter, never a withheld write.
      d.diary.forEach((e) => {
        if (e.seriesId === seriesId) e.isRevealed = true;
      });
    });
  }

  async startReplay(seriesId: string, useAltQuestions: boolean): Promise<void> {
    await this.write((d) => {
      const p = d.progress[seriesId];
      if (!p) return;
      p.replayCount += 1;
      p.currentIndex = 0;
      p.completedAt = null;
      p.useAltQuestions = useAltQuestions;
    });
  }

  async saveDiaryEntry(e: Omit<DiaryEntry, 'id' | 'createdAt' | 'isRevealed'>): Promise<void> {
    await this.write((d) => {
      d.diary.push({
        ...e,
        id: uid(),
        createdAt: new Date().toISOString(),
        isRevealed: false,
      });
    });
  }

  async grantAccess(productType: ProductType, seriesId: string | null = null): Promise<void> {
    await this.write((d) => {
      const now = new Date();
      let expiresAt: string | null = null;
      if (productType === 'monthly') {
        expiresAt = new Date(now.getTime() + 30 * 86400_000).toISOString();
      } else if (productType === 'annual') {
        expiresAt = new Date(now.getTime() + 365 * 86400_000).toISOString();
      }
      d.grants.push({
        id: uid(),
        productType,
        seriesId: productType === 'series_pack' ? seriesId : null,
        startsAt: now.toISOString(),
        expiresAt,
        mock: true,
      });
    });
  }

  async saveSettings(s: Partial<Settings>): Promise<void> {
    await this.write((d) => {
      d.settings = { ...d.settings, ...s };
    });
  }
}
