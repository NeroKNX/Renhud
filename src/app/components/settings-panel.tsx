import { X, Volume2, VolumeX, Type, Copy, Check, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PreferencesManager, FontSize, ThemeMode, fontSizes } from '../utils/preferences-manager';
import { SessionManager } from '../utils/session-manager';
import { copyToClipboard } from '../utils/model-config';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentSessionId: string;
}

export function SettingsPanel({ isOpen, onClose, currentSessionId }: SettingsPanelProps) {
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const prefs = PreferencesManager.getPreferences();
    setFontSize(prefs.fontSize);
    setTheme(prefs.theme);
    setSoundEnabled(prefs.soundEnabled);
  }, [isOpen]);

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    PreferencesManager.setFontSize(size);
    // Apply font size to document
    document.documentElement.style.setProperty('--base-font-size', fontSizes[size]);
  };

  const handleThemeToggle = () => {
    const newTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    PreferencesManager.setTheme(newTheme);
    applyThemeOverrides(newTheme);
  };

  // Aplicar overrides de colores para el tema claro
  const applyThemeOverrides = (mode: ThemeMode) => {
    const existing = document.getElementById('ren-theme-overrides');
    if (existing) existing.remove();
    if (mode === 'light') {
      const style = document.createElement('style');
      style.id = 'ren-theme-overrides';
      style.textContent = `
        [data-theme="light"] [class*="bg-[#0f1018"]  { background: #ffffff !important; }
        [data-theme="light"] [class*="bg-[#16192a"]  { background: #ffffff !important; }
        [data-theme="light"] [class*="bg-[#1a1d2e"]  { background: #f5f5f7 !important; }
        [data-theme="light"] [class*="bg-[#1a1d30"]  { background: #f5f5f7 !important; }
        [data-theme="light"] [class*="bg-[#1e2132"]  { background: #f5f5f7 !important; }
        [data-theme="light"] [class*="bg-[#1c1f30"]  { background: #f5f5f7 !important; }
        [data-theme="light"] [class*="bg-[#22253a"]  { background: #f5f5f7 !important; }
        [data-theme="light"] [class*="bg-[#252942"]  { background: #ede9fe !important; }
        [data-theme="light"] [class*="bg-[#0a0d14"]  { background: #f0f0f2 !important; }
        [data-theme="light"] [class*="border-[#0f1018"] { border-color: #e5e7eb !important; }
        [data-theme="light"] [class*="border-[#1a1d2e"] { border-color: #e5e7eb !important; }
        [data-theme="light"] [class*="border-[#1e2238"] { border-color: #e5e7eb !important; }
        [data-theme="light"] [class*="border-[#1f2234"] { border-color: #e5e7eb !important; }
        [data-theme="light"] [class*="border-[#2d3250"] { border-color: #e5e7eb !important; }
        [data-theme="light"] [class*="border-[#252942"] { border-color: #e5e7eb !important; }
        [data-theme="light"] [class*="border-[#2a2d42"] { border-color: #e5e7eb !important; }
        [data-theme="light"] [class*="border-[#3d4260"] { border-color: #e5e7eb !important; }
        [data-theme="light"] text-gray-100,  [data-theme="light"] [class*="text-gray-100"],
        [data-theme="light"] [class*="text-gray-200"],
        [data-theme="light"] [class*="text-gray-300"] { color: #1a1a2e !important; }
        [data-theme="light"] [class*="text-gray-500"] { color: #6b7280 !important; }
        [data-theme="light"] [class*="text-gray-600"] { color: #9ca3af !important; }
        [data-theme="light"] [class*="shadow-"] { box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important; }
        [data-theme="light"] input:not([type="checkbox"]):not([type="file"]),
        [data-theme="light"] textarea { background: #ffffff !important; border-color: #e5e7eb !important; }
        [data-theme="light"] .ren-markdown p,
        [data-theme="light"] .ren-markdown li,
        [data-theme="light"] .ren-markdown td { color: #1a1a2e !important; }
        [data-theme="light"] .ren-markdown strong { color: #111827 !important; }
        [data-theme="light"] .ren-markdown code { background: #f0f0f2 !important; }
        [data-theme="light"] .ren-markdown pre { background: #f0f0f2 !important; }
        [data-theme="light"] .ren-markdown h1, [data-theme="light"] .ren-markdown h2,
        [data-theme="light"] .ren-markdown h3, [data-theme="light"] .ren-markdown h4 { color: #111827 !important; }
      `;
      document.head.appendChild(style);
    }
  };

  // Aplicar overrides al cargar si el tema es claro
  useEffect(() => {
    applyThemeOverrides(theme);
  }, []);

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    PreferencesManager.setSoundEnabled(newValue);
    if (newValue) {
      PreferencesManager.playNotificationSound();
    }
  };

  const handleCopyConversation = async () => {
    const session = SessionManager.getSession(currentSessionId);
    if (!session) return;

    const content = `Conversación con Ren - ${session.title}\n${session.messages.map(msg => {
      const role = msg.isUser ? 'Usuario' : 'Ren';
      return `${role}: ${msg.text}`;
    }).join('\n\n')}`;

    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#1a1d2e] border border-[#2d3250] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d3250]">
              <h2 className="text-lg font-mono text-gray-100">Configuración</h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-[#2d3250] rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Font Size */}
              <div className="space-y-3">
                <label className="text-sm font-mono text-gray-300 flex items-center gap-2">
                  <Type size={16} />
                  Tamaño de fuente
                </label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeChange(size)}
                      className={`flex-1 px-4 py-2.5 rounded-lg border font-mono text-sm transition-all ${
                        fontSize === size
                          ? 'bg-[#4f46e5] border-[#4f46e5] text-white'
                          : 'bg-[#0f1018] border-[#2d3250] text-gray-400 hover:border-[#4f46e5]/50'
                      }`}
                    >
                      {size === 'small' ? 'Pequeño' : size === 'medium' ? 'Medio' : 'Grande'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between py-2 px-3 bg-[#0f1018] rounded-lg border border-[#1e2238]">
                <span className="text-sm font-mono text-gray-300">Tema</span>
                <button
                  onClick={handleThemeToggle}
                  className="p-1.5 rounded-lg bg-[#1a1d2e] border border-[#2d3250] hover:border-[#4f46e5]/50 transition-all"
                  title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                >
                  {theme === 'dark' ? (
                    <Sun size={14} className="text-yellow-400" />
                  ) : (
                    <Moon size={14} className="text-[#818cf8]" />
                  )}
                </button>
              </div>

              {/* Sound */}
              <div className="space-y-3">
                <label className="text-sm font-mono text-gray-300 flex items-center gap-2">
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  Sonido de notificación
                </label>
                <button
                  onClick={handleSoundToggle}
                  className={`w-full px-4 py-2.5 rounded-lg border font-mono text-sm transition-all ${
                    soundEnabled
                      ? 'bg-[#4f46e5] border-[#4f46e5] text-white'
                      : 'bg-[#0f1018] border-[#2d3250] text-gray-400 hover:border-[#4f46e5]/50'
                  }`}
                >
                  {soundEnabled ? 'Activado' : 'Desactivado'}
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-[#2d3250] my-4" />

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleCopyConversation}
                  disabled={!currentSessionId}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#2d3250] bg-[#0f1018] text-gray-300 hover:bg-[#1e2238] hover:border-[#4f46e5]/50 font-mono text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-emerald-400" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copiar conversación completa
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}