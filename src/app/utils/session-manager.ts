export type ModelType = 'claude-sonnet' | 'llama-70b' | 'mistral-7b';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  model?: ModelType;
  isDeep?: boolean;
  files?: { name: string; type: string; data: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

function getUser(): { user_id: string; isGuest: boolean } | null {
  try {
    const raw = localStorage.getItem('ren_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function isRegistered(): boolean {
  const u = getUser();
  return !!u && !u.isGuest && !!u.user_id;
}

// Cache local de solo lectura para respuesta instantánea
let localCache: ChatSession[] | null = null;
const CACHE_KEY = 'ren_sessions_cache';

function readCache(): ChatSession[] {
  if (localCache) return localCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    localCache = raw ? JSON.parse(raw) : [];
  } catch { localCache = []; }
  return localCache;
}

function writeCache(sessions: ChatSession[]): void {
  localCache = sessions;
  // Invitados: no persistir en localStorage (privacidad)
  const u = getUser();
  if (u?.isGuest) return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(sessions));
}

function clearCache(): void {
  localCache = null;
  localStorage.removeItem(CACHE_KEY);
}

export class SessionManager {

  // Cargar del servidor (llamar al inicio de sesión)
  static async loadFromServer(): Promise<void> {
    const u = getUser();
    if (!u || u.isGuest) return;

    try {
      const res = await fetch(`/api/sessions?user_id=${u.user_id}`);
      const data = await res.json();

      if (!data.sessions || data.sessions.length === 0) {
        // Sin sesiones en servidor, usar las locales si existen
        return;
      }

      // Cargar sesiones completas (con mensajes)
      const fullSessions: ChatSession[] = [];
      for (const meta of data.sessions) {
        try {
          const detail = await fetch(`/api/sessions/${meta.id}?user_id=${u.user_id}`);
          const d = await detail.json();
          if (d.session) fullSessions.push(d.session);
        } catch { fullSessions.push(meta as ChatSession); }
      }

      if (fullSessions.length > 0) {
        writeCache(fullSessions);
      }
    } catch {
      // Sin conexión: mantener cache local
    }
  }

  // API sincrónica (usa cache local)
  static getAllSessions(): ChatSession[] {
    return readCache();
  }

  static getSession(sessionId: string): ChatSession | null {
    return readCache().find(s => s.id === sessionId) || null;
  }

  static getCurrentSessionId(): string | null {
    return localStorage.getItem('ren_current_session');
  }

  static setCurrentSessionId(id: string): void {
    localStorage.setItem('ren_current_session', id);
  }

  static createSession(): ChatSession {
    const session: ChatSession = {
      id: Date.now().toString(),
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sessions = readCache();
    sessions.unshift(session);
    writeCache(sessions);
    this.setCurrentSessionId(session.id);
    this.syncToServer(sessions);
    return session;
  }

  static updateSession(sessionId: string, messages: Message[]): void {
    const sessions = readCache();
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return;

    sessions[idx].messages = messages;
    sessions[idx].updatedAt = new Date().toISOString();
    const first = messages.find(m => m.isUser);
    if (first && sessions[idx].title === 'Nueva conversación') {
      sessions[idx].title = first.text.slice(0, 50) + (first.text.length > 50 ? '...' : '');
    }
    writeCache(sessions);
    this.syncToServer(sessions);
  }

  static deleteSession(sessionId: string): void {
    const u = getUser();
    if (u && !u.isGuest) {
      fetch(`/api/sessions/${sessionId}?user_id=${u.user_id}`, { method: 'DELETE' }).catch(() => {});
    }
    const sessions = readCache().filter(s => s.id !== sessionId);
    writeCache(sessions);
    this.syncToServer(sessions);
    if (this.getCurrentSessionId() === sessionId) {
      localStorage.removeItem('ren_current_session');
    }
  }

  static renameSession(sessionId: string, title: string): void {
    const sessions = readCache();
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx].title = title;
      writeCache(sessions);
      this.syncToServer(sessions);
    }
  }

  static toggleFavorite(sessionId: string): void {
    const sessions = readCache();
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx].isFavorite = !sessions[idx].isFavorite;
      writeCache(sessions);
      this.syncToServer(sessions);
    }
  }

  // Sincronización inmediata con servidor
  private static async syncToServer(sessions: ChatSession[]): Promise<void> {
    const u = getUser();
    if (!u || u.isGuest) return;

    try {
      await fetch('/api/sessions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: u.user_id, sessions }),
      });
    } catch { /* offline */ }
  }

  // Guardar al cerrar/recargar página
  static initAutoSave(): void {
    window.addEventListener('beforeunload', () => {
      const sessions = readCache();
      const u = getUser();
      if (!u || u.isGuest || sessions.length === 0) return;
      navigator.sendBeacon('/api/sessions/save', new Blob([JSON.stringify({ user_id: u.user_id, sessions })], { type: 'application/json' }));
    });
  }

  // Cerrar sesión: limpiar cache local
  // Limpiar TODO el almacenamiento local (para invitados)
  static clearAllLocal(): void {
    clearCache();
    localStorage.removeItem('ren_current_session');
  }

  static logout(): void {
    clearCache();
    localStorage.removeItem('ren_current_session');
    localStorage.removeItem('ren_user');
  }
}
