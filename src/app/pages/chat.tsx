import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Settings, Star, History, Plus, User, Download, LogOut, ArrowLeft, Brain } from 'lucide-react';
import { ChatMessage } from '../components/chat-message';
import { TypingIndicator } from '../components/typing-indicator';
import { ChatInput } from '../components/chat-input';
import { EmptyState } from '../components/empty-state';
import { HistorySidebar } from '../components/history-sidebar';
import { SettingsPanel } from '../components/settings-panel';
import { TypingMessage } from '../components/typing-message';
import { KeyboardShortcutsHelp } from '../components/keyboard-shortcuts-help';
import { SkillsPanel } from '../components/skills-panel';
import { SessionManager, Message } from '../utils/session-manager';
import { PreferencesManager, fontSizes } from '../utils/preferences-manager';
import { ModelType, copyToClipboard } from '../utils/model-config';
import renAvatar from 'figma:asset/f7525c5786cfe4f02e861fff75eac3f54b4332bd.png';

export function ChatPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  // Connection indicator
  useEffect(() => {
    const check = () => {
      fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(5000) })
        .then(r => setIsConnected(r.ok))
        .catch(() => setIsConnected(false));
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState<Message | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [hasGeneratedWelcome, setHasGeneratedWelcome] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState(null);
  const [activeSkillName, setActiveSkillName] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Apply saved preferences on mount
  useEffect(() => {
    const prefs = PreferencesManager.getPreferences();
    
    // Apply font size and theme
    document.documentElement.style.setProperty('--base-font-size', fontSizes[prefs.fontSize]);
    PreferencesManager.applyTheme(prefs.theme);
  }, []);

  // Check authentication
  useEffect(() => {
    const userStr = localStorage.getItem('ren_user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setUserName(user.name || user.email?.split('@')[0] || 'Usuario');
    setIsGuest(user.isGuest || false);
    setUserId(user.user_id || '');
    // Cargar preferencias del servidor
    PreferencesManager.loadFromServer().then(() => {
      const prefs = PreferencesManager.getPreferences();
      document.documentElement.style.setProperty('--base-font-size', fontSizes[prefs.fontSize]);
      PreferencesManager.applyTheme(prefs.theme);
    });
  }, [navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Nueva sesión
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleNewSession();
      }
      // Ctrl/Cmd + H: Abrir historial
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setIsHistoryOpen(true);
      }
      // Esc: Cerrar sidebar
      if (e.key === 'Escape' && isHistoryOpen) {
        setIsHistoryOpen(false);
      }
      // Ctrl/Cmd + E: Exportar conversación
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportCurrentSession();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHistoryOpen, currentSessionId, messages]);

  // Check session limit for guests
  useEffect(() => {
    if (isGuest) {
      const sessions = SessionManager.getAllSessions();
      if (sessions.length >= 8 && sessions.length < 10) {
        setShowSessionWarning(true);
      } else if (sessions.length >= 10) {
        setShowSessionWarning(false); // Hide warning, they've reached the limit
      }
    }
  }, [isGuest, currentSessionId]);

  // Prevenir salida accidental (gestos en móvil, cierre)
  useEffect(() => {
    if (messages.length === 0) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isTyping || messages.length > 1) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // Bloquear swipe-back en móvil
    document.body.style.overscrollBehaviorX = 'none';
    document.body.style.touchAction = 'pan-y';

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.body.style.overscrollBehaviorX = '';
      document.body.style.touchAction = '';
    };
  }, [messages, isTyping]);

  // Load or create session
  useEffect(() => {
    // Invitados: limpiar caché local para privacidad
    if (isGuest) {
      SessionManager.clearAllLocal();
    }
    
    // Esperar a cargar sesiones del servidor antes de decidir
    const init = async () => {
      await SessionManager.loadFromServer();
      SessionManager.initAutoSave();

      if (sessionId) {
        const session = SessionManager.getSession(sessionId);
        if (session) {
          setMessages(session.messages);
          setCurrentSessionId(session.id);
          SessionManager.setCurrentSessionId(session.id);
          setHasGeneratedWelcome(session.messages.length > 0);
          setIsFavorite(session?.isFavorite || false);
        } else {
          navigate('/chat');
        }
      } else {
        // Cargar la sesión más reciente del servidor
        const sessions = SessionManager.getAllSessions();
        if (sessions.length > 0) {
          const mostRecent = sessions[0];
          setMessages(mostRecent.messages);
          setCurrentSessionId(mostRecent.id);
          SessionManager.setCurrentSessionId(mostRecent.id);
          setHasGeneratedWelcome(mostRecent.messages.length > 0);
          setIsFavorite(mostRecent?.isFavorite || false);
          navigate(`/chat/${mostRecent.id}`, { replace: true });
        } else {
          createNewSession();
        }
      }
    };
    init();
  }, [sessionId, navigate]);

  const createNewSession = () => {
    // For guests, limit to 10 sessions
    if (isGuest) {
      const sessions = SessionManager.getAllSessions();
      if (sessions.length >= 10) {
        // Delete oldest session
        const oldest = sessions.sort((a, b) => 
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        )[0];
        SessionManager.deleteSession(oldest.id);
      }
    }

    const newSession = SessionManager.createSession();
    
    // Reset all states for clean new session
    setMessages(newSession.messages);
    setCurrentSessionId(newSession.id);
    setHasGeneratedWelcome(false);
    setIsTyping(false);
    setTypingMessage(null);
    setIsFavorite(false);
    
    navigate(`/chat/${newSession.id}`, { replace: true });
    
    // Trigger history sidebar refresh
    setHistoryRefreshTrigger(prev => prev + 1);
  };

  // Save messages when they change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      SessionManager.updateSession(currentSessionId, messages);
    }
  }, [messages, currentSessionId]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Listen for suggestion clicks from EmptyState
  useEffect(() => {
    const handleSuggestion = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        handleSendMessage(customEvent.detail);
      }
    };

    window.addEventListener('sendSuggestion', handleSuggestion);
    return () => window.removeEventListener('sendSuggestion', handleSuggestion);
  }, []);

  // Generate welcome message for empty sessions
  useEffect(() => {
    if (currentSessionId && messages.length === 0 && !hasGeneratedWelcome && !isTyping) {
      setHasGeneratedWelcome(true);
      setIsTyping(true);
      
      // Simulate typing delay for welcome message
      setTimeout(() => {
        const userStr = localStorage.getItem('ren_user');
        const user = userStr ? JSON.parse(userStr) : {};
        const userId = user.user_id || 'invitado';

        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: '__INIT__', user_id: userId, deep: false, history: [], active_skill: activeSkill }),
        })
          .then(r => r.json())
          .then(data => {
            const welcomeMessage: Message = {
              id: Date.now().toString(),
              text: data.text || 'Hola.',
              isUser: false,
              timestamp: new Date().toISOString(),
              model: 'claude-sonnet' as ModelType,
            };
            setMessages([welcomeMessage]);
            setIsTyping(false);
          })
          .catch(() => {
            setMessages([{
              id: Date.now().toString(),
              text: 'Backend no disponible.',
              isUser: false,
              timestamp: new Date().toISOString(),
              model: 'claude-sonnet' as ModelType,
            }]);
            setIsTyping(false);
          });
      }, 1200);
    }
  }, [currentSessionId, messages.length, hasGeneratedWelcome, isTyping]);

  const handleSendMessage = async (text: string, isDeep?: boolean, files?: File[]) => {
    // Convert files to base64 primero (antes de usarlos en el mensaje)
    const filesBase64 = files ? await Promise.all(
      files.map(file => new Promise<{name: string, type: string, data: string}>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve({ name: file.name, type: file.type, data: base64 });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }))
    ) : undefined;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toISOString(),
      files: filesBase64 ? filesBase64.map(f => ({ name: f.name, type: f.type, data: `data:${f.type};base64,${f.data}` })) : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const userStr = localStorage.getItem('ren_user');
    const user = userStr ? JSON.parse(userStr) : {};
    const userId = user.user_id || 'invitado';

    const history = messages
      .filter(m => m.text)
      .map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos para archivos

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          user_id: userId,
          deep: isDeep || false,
          active_skill: activeSkill,
          history,
          files: filesBase64,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.text) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.text,
          isUser: false,
          timestamp: new Date().toISOString(),
          model: 'claude-sonnet' as ModelType,
          isDeep: isDeep,
        };
        setTypingMessage(aiMessage);
      } else {
        setIsTyping(false);
      }
    } catch {
      clearTimeout(timeoutId);
      // Mostrar error
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: '⚠️ Error de conexión. Intenta de nuevo.',
        isUser: false,
        timestamp: new Date().toISOString(),
      }]);
      setIsTyping(false);
    }
  };

  const handleTypingComplete = () => {
    if (typingMessage) {
      setMessages((prev) => [...prev, typingMessage]);
      setTypingMessage(null);
      setIsTyping(false);
    }
  };

  const handleStopTyping = () => {
    if (typingMessage) {
      setMessages((prev) => [...prev, typingMessage]);
      setTypingMessage(null);
      setIsTyping(false);
    }
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    // Actualizar el mensaje editado
    setMessages((prev) => {
      const updated = prev.map((msg) =>
        msg.id === messageId ? { ...msg, text: newText } : msg
      );
      // Truncar mensajes posteriores al editado
      const editIdx = updated.findIndex(m => m.id === messageId);
      const truncated = updated.slice(0, editIdx + 1);
      // Regenerar respuesta desde el mensaje editado
      setTimeout(() => regenerateFrom(truncated, newText), 0);
      return truncated;
    });
  };

  const regenerateFrom = async (history: Message[], lastText: string) => {
    setIsTyping(true);
    const userStr = localStorage.getItem('ren_user');
    const user = userStr ? JSON.parse(userStr) : {};
    const userId = user.user_id || 'invitado';

    const msgHistory = history
      .filter(m => m.text)
      .map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: lastText,
          user_id: userId,
          deep: false,
          history: msgHistory.slice(0, -1),
          active_skill: activeSkill,
        }),
      });
      const data = await res.json();
      if (data.text) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.text,
          isUser: false,
          timestamp: new Date().toISOString(),
          model: 'claude-sonnet' as ModelType,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch {}
    setIsTyping(false);
  };

  const handleNewSession = () => {
    const userStr = localStorage.getItem('ren_user');
    const user = userStr ? JSON.parse(userStr) : {};
    const userId = user.user_id || 'invitado';
    if (messages.length > 0 && userId !== 'invitado') {
      fetch('/api/nueva_sesion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      }).catch(() => {});
    }
    createNewSession();
  };

  const exportCurrentSession = () => {
    if (messages.length === 0) return;

    const session = SessionManager.getSession(currentSessionId);
    if (!session) return;

    const content = `Conversación con Ren - ${session.title}\nFecha: ${new Date(session.updatedAt).toLocaleString()}\n\n${'-'.repeat(60)}\n\n${messages.map(msg => {
      const role = msg.isUser ? 'Usuario' : `Ren${msg.model ? ` (${msg.model})` : ''}`;
      const time = new Date(msg.timestamp).toLocaleTimeString();
      return `[${time}] ${role}:\n${msg.text}\n`;
    }).join('\n' + '-'.repeat(60) + '\n\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ren-chat-${session.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAllSessions = () => {
    const sessions = SessionManager.getAllSessions();
    if (sessions.length === 0) return;

    const content = sessions.map(session => {
      return `${'='.repeat(80)}\nConversación: ${session.title}\nFecha: ${new Date(session.updatedAt).toLocaleString()}\nMensajes: ${session.messages.length}\n${'='.repeat(80)}\n\n${session.messages.map(msg => {
        const role = msg.isUser ? 'Usuario' : `Ren${msg.model ? ` (${msg.model})` : ''}`;
        const time = new Date(msg.timestamp).toLocaleTimeString();
        return `[${time}] ${role}:\n${msg.text}`;
      }).join('\n\n' + '-'.repeat(60) + '\n\n')}\n\n\n`;
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ren-historial-completo-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    SessionManager.logout();
    navigate('/');
  };

  const handleToggleFavorite = () => {
    if (currentSessionId) {
      SessionManager.toggleFavorite(currentSessionId);
      const session = SessionManager.getSession(currentSessionId);
      setIsFavorite(session?.isFavorite || false);
      setHistoryRefreshTrigger(prev => prev + 1);
    }
  };

  // Play notification sound when typing completes
  useEffect(() => {
    if (!isTyping && typingMessage === null && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.isUser) {
        PreferencesManager.playNotificationSound();
      }
    }
  }, [isTyping, typingMessage, messages]);

  return (
    <>
      <div className="min-h-dvh flex flex-col ren-bg-primary overflow-hidden" style={{ overscrollBehaviorX: 'none' }}>
        {/* Main container with max width */}
        <div className="w-full max-w-[860px] mx-auto flex flex-col h-dvh max-h-dvh">
          {/* Header */}
          <header className="px-2 sm:px-4 md:px-6 py-3 md:py-4 border-b border-[var(--ren-border)] flex items-center justify-between gap-2 sm:gap-4 ren-bg-header">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center overflow-hidden border flex-shrink-0"
                style={{
                  backgroundColor: 'var(--ren-bg-tertiary)',
                  borderColor: 'var(--accent-color)',
                  boxShadow: '0 0 15px rgba(79,70,229,0.15)'
                }}
              >
                <img src={renAvatar} alt="Ren" className="w-full h-full object-cover" />
              </div>

              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-mono tracking-tight ren-text-primary flex items-center gap-2">
                  Ren
                  <span className={`inline-block w-2 h-2 rounded-full transition-colors ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Conectado' : 'Sin conexión'} />
                </h1>
                <div className="flex items-center gap-2">
                  {isGuest ? (
                    <span className="flex items-center gap-1 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-amber-500/10 text-amber-400/90 border border-amber-500/30 rounded font-mono">
                      <User size={9} className="sm:w-[10px] sm:h-[10px]" />
                      <span className="hidden xs:inline">Invitado</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-[#4f46e5]/10 text-[#4f46e5]/90 border border-[#4f46e5]/30 rounded font-mono truncate max-w-[100px] sm:max-w-none">
                      <User size={9} className="sm:w-[10px] sm:h-[10px] flex-shrink-0" />
                      {userName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Salir - siempre visible */}
              <button
                onClick={() => navigate('/')}
                className="p-1.5 sm:p-2 hover:bg-[#1a1d2e] border border-transparent hover:border-[#2d3250] rounded-lg transition-colors"
                title="Salir"
              >
                <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 hover:text-gray-300" />
              </button>

              {/* Skills button - siempre visible */}
              <button
                onClick={() => setIsSkillsOpen(true)}
                className="p-1.5 sm:p-2 hover:bg-[#1a1d2e] border border-transparent hover:border-[#2d3250] rounded-lg transition-colors"
                title="Skills"
              >
                <Brain size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 hover:text-gray-300" />
              </button>

              {/* Settings button - siempre visible */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 sm:p-2 hover:bg-[#1a1d2e] border border-transparent hover:border-[#2d3250] rounded-lg transition-colors"
                title="Configuración"
              >
                <Settings size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 hover:text-gray-300" />
              </button>

              {/* Historial - siempre visible */}
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-1.5 sm:p-2 hover:bg-[#1a1d2e] border border-transparent hover:border-[#2d3250] rounded-lg transition-colors"
                title="Historial (Ctrl+H)"
              >
                <History size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 hover:text-gray-300" />
              </button>

              {/* Nueva sesión - siempre visible */}
              <button
                onClick={handleNewSession}
                className="p-1.5 sm:p-2 hover:bg-[#1a1d2e] border border-transparent hover:border-[#2d3250] rounded-lg transition-colors"
                title="Nueva sesión (Ctrl+K)"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 hover:text-gray-300" />
              </button>

              {/* Favorite button - oculto en móvil */}
              <button
                onClick={handleToggleFavorite}
                disabled={messages.length === 0}
                className={`hidden sm:block p-2 hover:bg-[#1a1d2e] border border-transparent hover:border-[#2d3250] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFavorite ? 'text-yellow-400' : 'text-gray-400'
                }`}
                title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Star size={18} className={isFavorite ? 'fill-current' : ''} />
              </button>

              {/* Export button - oculto en móvil */}
              <div className="relative group hidden md:block">
                <button
                  onClick={exportCurrentSession}
                  disabled={messages.length === 0}
                  className="flex items-center gap-2 px-3 py-2 bg-[#1a1d2e] hover:bg-[#1e2238] border border-[#2d3250] hover:border-[#4f46e5]/50 text-gray-300 hover:text-gray-100 rounded-lg transition-all text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed group-hover:rounded-b-none"
                  title="Exportar (Ctrl+E)"
                >
                  <Download size={16} />
                  <span className="hidden lg:inline">Exportar</span>
                </button>

                {/* Dropdown menu */}
                <div className="absolute right-0 top-full hidden group-hover:block w-48 bg-[#1a1d2e] border border-[#2d3250] rounded-b-lg shadow-lg z-10">
                  <button
                    onClick={exportCurrentSession}
                    disabled={messages.length === 0}
                    className="w-full px-4 py-2 text-left text-sm font-mono text-gray-300 hover:bg-[#1e2238] hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Esta conversación
                  </button>
                  <button
                    onClick={exportAllSessions}
                    disabled={SessionManager.getAllSessions().length === 0}
                    className="w-full px-4 py-2 text-left text-sm font-mono text-gray-300 hover:bg-[#1e2238] hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-b-lg"
                  >
                    Todo el historial
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Guest warning for session limit */}
          {isGuest && showSessionWarning && (
            <div className="px-4 md:px-6 py-3 bg-amber-500/5 border-b border-amber-500/20">
              <p className="text-xs font-mono text-amber-400/80 text-center">
                ⚠️ Tienes {SessionManager.getAllSessions().length}/10 sesiones guardadas. Al crear más, se eliminará la más antigua.
              </p>
            </div>
          )}

          {/* Guest info banner */}
          {isGuest && messages.length === 0 && (
            <div className="px-4 md:px-6 py-3 bg-[#4f46e5]/5 border-b border-[#4f46e5]/10">
              <p className="text-xs font-mono text-gray-400 text-center">
                💡 Estás usando Ren como invitado. Tus conversaciones se guardan localmente en tu navegador.
              </p>
            </div>
          )}

          {/* Chat area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 scroll-smooth overscroll-behavior-contain"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#2d3250 transparent',
            }}
          >
            {messages.length === 0 && !isTyping ? (
              <EmptyState isGuest={isGuest} />
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id}>
                    <ChatMessage
                      message={message.text}
                      isUser={message.isUser}
                      timestamp={message.timestamp}
                      model={message.model}
                      isDeep={message.isDeep}
                      files={message.files}
                      onEdit={message.isUser ? (newText) => handleEditMessage(message.id, newText) : undefined}
                    />
                  </div>
                ))}
                {typingMessage && (
                  <TypingMessage
                    fullMessage={typingMessage.text}
                    model={typingMessage.model}
                    timestamp={typingMessage.timestamp}
                    isDeep={typingMessage.isDeep}
                    onComplete={handleTypingComplete}
                    onStop={handleStopTyping}
                  />
                )}
                {isTyping && !typingMessage && <TypingIndicator />}
              </>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isTyping}
            sessionId={currentSessionId}
            activeSkillName={activeSkillName}
            onDeactivateSkill={() => { setActiveSkill(null); setActiveSkillName(null); }}
          />
        </div>
      </div>

      {/* History Sidebar */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentSessionId={currentSessionId}
        refreshTrigger={historyRefreshTrigger}
      />

      {/* Skills Panel */}
      {userId && isSkillsOpen && (
        <SkillsPanel
          userId={userId}
          activeSkill={activeSkill}
          onActivate={(id, name) => {
            const activating = id && !activeSkill;
            setActiveSkill(id);
            setActiveSkillName(id ? (name || null) : null);
            setIsSkillsOpen(false);
            // Al activar una skill, crear chat nuevo para que funcione limpio
            if (activating) {
              setMessages([]);
              handleNewSession();
            }
          }}
          onClose={() => setIsSkillsOpen(false)}
        />
      )}

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSessionId={currentSessionId}
      />

      {/* Keyboard shortcuts help */}
      <KeyboardShortcutsHelp />
    </>
  );
}
