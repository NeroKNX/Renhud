import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Trash2, Edit2, Search, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SessionManager, ChatSession } from '../utils/session-manager';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale/es';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSessionId?: string;
  refreshTrigger?: number;
}

export function HistorySidebar({ isOpen, onClose, currentSessionId, refreshTrigger }: HistorySidebarProps) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>(SessionManager.getAllSessions());
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Refresh sessions when refreshTrigger changes
  useEffect(() => {
    setSessions(SessionManager.getAllSessions());
  }, [refreshTrigger]);

  const filteredSessions = sessions
    .filter(session => session.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // Favoritos primero
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      // Luego por fecha de actualización (más reciente primero)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleSelectSession = (sessionId: string) => {
    navigate(`/chat/${sessionId}`);
    onClose();
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta conversación?')) {
      SessionManager.deleteSession(sessionId);
      setSessions(SessionManager.getAllSessions());
      
      if (currentSessionId === sessionId) {
        navigate('/chat');
      }
    }
  };

  const handleStartEdit = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = (sessionId: string) => {
    if (editTitle.trim()) {
      SessionManager.renameSession(sessionId, editTitle.trim());
      setSessions(SessionManager.getAllSessions());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 md:w-96 bg-[#16192a] border-r border-[#252942] z-50 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="px-5 py-6 border-b border-[#252942]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-mono text-gray-100">Historial</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#1e2238] rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar conversaciones..."
                  className="w-full bg-[#0f1018] border border-[#2d3250] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-100 font-mono focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Sessions list */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare size={48} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 font-mono">
                    {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones aún'}
                  </p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                      session.isFavorite
                        ? currentSessionId === session.id
                          ? 'bg-gradient-to-br from-yellow-500/10 to-[#1e2238] border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]'
                          : 'bg-gradient-to-br from-yellow-500/5 to-[#0f1018] border-yellow-500/30 hover:border-yellow-500/50 hover:bg-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                        : currentSessionId === session.id
                          ? 'bg-[#1e2238] border-[#4f46e5]/50'
                          : 'bg-[#0f1018] border-[#2d3250] hover:border-[#4f46e5]/30 hover:bg-[#1a1d2e]'
                    }`}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    {editingId === session.id ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(session.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          onBlur={() => handleSaveEdit(session.id)}
                          autoFocus
                          className="w-full bg-[#16192a] border border-[#4f46e5] rounded px-2 py-1 text-sm text-gray-100 font-mono focus:outline-none"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            {session.isFavorite && (
                              <Star size={14} className="text-yellow-400 fill-yellow-400 flex-shrink-0 mt-0.5" />
                            )}
                            <h3 className="text-sm font-mono text-gray-100 line-clamp-2 flex-1">
                              {session.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              onClick={(e) => handleStartEdit(session, e)}
                              className="p-1 hover:bg-[#2d3250] rounded transition-colors"
                              title="Renombrar"
                            >
                              <Edit2 size={14} className="text-gray-500" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              className="p-1 hover:bg-[#2d3250] rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={14} className="text-gray-500" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-mono">
                            {session.messages.length} mensajes
                          </span>
                          <span className="text-xs text-gray-600 font-mono">
                            {formatDistanceToNow(new Date(session.updatedAt), { 
                              addSuffix: true,
                              locale: es 
                            })}
                          </span>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}