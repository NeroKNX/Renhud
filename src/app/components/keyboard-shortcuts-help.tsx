import { X, Keyboard } from 'lucide-react';
import { useState, useEffect } from 'react';

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true); // por defecto true, cambia con useEffect

  useEffect(() => {
    // Detectar si el dispositivo SOPORTA hover (tiene mouse/teclado) vs solo táctil
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    // También detectar si hay teclado físico (userAgent check básico)
    const hasKeyboard = !('ontouchstart' in window) || navigator.maxTouchPoints === 0;
    setIsTouchDevice(!(hasHover || hasKeyboard));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + /: Abrir ayuda de atajos
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      // Esc: Cerrar ayuda
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const shortcuts = [
    { keys: ['Ctrl', 'K'], mac: ['⌘', 'K'], description: 'Nueva sesión' },
    { keys: ['Ctrl', 'H'], mac: ['⌘', 'H'], description: 'Abrir historial' },
    { keys: ['Ctrl', 'E'], mac: ['⌘', 'E'], description: 'Exportar conversación' },
    { keys: ['Ctrl', '/'], mac: ['⌘', '/'], description: 'Mostrar atajos' },
    { keys: ['Esc'], mac: ['Esc'], description: 'Cerrar panel' },
  ];

  const isMac = navigator.userAgent.includes('Mac');

  return (
    <>
      {/* Floating help button — solo en dispositivos con teclado/mouse */}
      {!isTouchDevice && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-3 bg-[#1a1d2e] hover:bg-[#1e2238] border border-[#2d3250] hover:border-[#4f46e5]/50 rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all group z-40"
          title="Atajos de teclado (Ctrl+/)"
          style={{ animation: 'pulseButton 3s ease-in-out infinite' }}
        >
          <Keyboard size={20} className="text-gray-400 group-hover:text-[#6366f1] transition-colors" />
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          />

          {/* Modal content */}
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#16192a] border border-[#2d3250] rounded-xl shadow-2xl z-50 p-6"
            style={{ animation: 'slideIn 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Keyboard size={20} className="text-[#6366f1]" />
                <h2 className="text-lg font-mono text-gray-100">Atajos de Teclado</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[#1a1d2e] rounded transition-colors"
              >
                <X size={18} className="text-gray-400 hover:text-gray-300" />
              </button>
            </div>

            {/* Shortcuts list */}
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-[#0f1018] rounded-lg border border-[#1e2238] hover:border-[#2d3250] transition-colors"
                >
                  <span className="text-sm font-mono text-gray-300">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {(isMac ? shortcut.mac : shortcut.keys).map((key, i) => (
                      <span key={i}>
                        <kbd className="px-2 py-1 text-xs font-mono bg-[#1a1d2e] text-gray-300 border border-[#2d3250] rounded shadow-sm">
                          {key}
                        </kbd>
                        {i < (isMac ? shortcut.mac : shortcut.keys).length - 1 && (
                          <span className="mx-1 text-gray-500">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-[#1e2238]">
              <p className="text-xs font-mono text-gray-500 text-center">
                Presiona <kbd className="px-1.5 py-0.5 bg-[#1a1d2e] border border-[#2d3250] rounded text-gray-400">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-[#1a1d2e] border border-[#2d3250] rounded text-gray-400">/</kbd> para abrir esta ayuda
              </p>
            </div>
          </div>
        </>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes pulseButton {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}