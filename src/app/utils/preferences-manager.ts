export type FontSize = 'small' | 'medium' | 'large';
export type ThemeMode = 'dark' | 'light';

export interface UserPreferences {
  fontSize: FontSize;
  theme: ThemeMode;
  soundEnabled: boolean;
  drafts: Record<string, string>;
  skillNewChat: boolean;
}

const PREFERENCES_KEY = 'ren_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  fontSize: 'medium',
  theme: 'dark',
  soundEnabled: false,
  drafts: {},
  skillNewChat: true,
};

export class PreferencesManager {
  static getPreferences(): UserPreferences {
    try {
      const prefsJson = localStorage.getItem(PREFERENCES_KEY);
      if (!prefsJson) return { ...DEFAULT_PREFERENCES };
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(prefsJson) };
    } catch {
      return { ...DEFAULT_PREFERENCES };
    }
  }

  static updatePreferences(updates: Partial<UserPreferences>): void {
    const current = this.getPreferences();
    const updated = { ...current, ...updates };
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    } catch { /* localStorage might be full */ }
    // Sincronizar con servidor si hay userId disponible
    const userStr = localStorage.getItem('ren_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.user_id && !user.isGuest) {
          fetch('/api/prefs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.user_id, prefs: updated }),
          }).catch(() => {}); // Silencioso si falla
        }
      } catch {}
    }
  }

  static async loadFromServer(): Promise<void> {
    try {
      const userStr = localStorage.getItem('ren_user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      if (!user.user_id || user.isGuest) return;
      const res = await fetch(`/api/prefs?user_id=${user.user_id}`);
      const data = await res.json();
      if (data.prefs && Object.keys(data.prefs).length > 0) {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(data.prefs));
      }
    } catch { /* servidor no disponible, usar localStorage */ }
  }

  static setTheme(theme: ThemeMode): void {
    this.updatePreferences({ theme });
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }

  static applyTheme(theme: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }

  static setFontSize(size: FontSize): void {
    this.updatePreferences({ fontSize: size });
  }

  static setSoundEnabled(enabled: boolean): void {
    this.updatePreferences({ soundEnabled: enabled });
  }

  static setSkillNewChat(enabled: boolean): void {
    this.updatePreferences({ skillNewChat: enabled });
  }

  static setSkillNewChat(enabled: boolean): void {
    this.updatePreferences({ skillNewChat: enabled });
  }

  static saveDraft(sessionId: string, text: string): void {
    const prefs = this.getPreferences();
    prefs.drafts[sessionId] = text;
    this.updatePreferences({ drafts: prefs.drafts });
  }

  static getDraft(sessionId: string): string {
    const prefs = this.getPreferences();
    return prefs.drafts[sessionId] || '';
  }

  static clearDraft(sessionId: string): void {
    const prefs = this.getPreferences();
    delete prefs.drafts[sessionId];
    this.updatePreferences({ drafts: prefs.drafts });
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(PREFERENCES_KEY);
      localStorage.removeItem('ren_user');
    } catch {}
  }

  static playNotificationSound(): void {
    const prefs = this.getPreferences();
    if (!prefs.soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch {}
  }
}

export const fontSizes = {
  small: '14px',
  medium: '16px',
  large: '18px',
};
