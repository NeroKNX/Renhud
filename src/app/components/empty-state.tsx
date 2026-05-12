import { Sparkles, Zap, Code, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EmptyStateProps {
  isGuest?: boolean;
}

export function EmptyState({ isGuest = false }: EmptyStateProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hasKeyboard = !('ontouchstart' in window) || navigator.maxTouchPoints === 0;
    setIsTouchDevice(!(hasHover || hasKeyboard));
  }, []);
  const suggestions = [
    {
      icon: Code,
      title: "Ayuda con código",
      text: "Explícame cómo funciona async/await en JavaScript",
    },
    {
      icon: Zap,
      title: "Ideas creativas",
      text: "Dame ideas para un proyecto de inteligencia artificial",
    },
    {
      icon: MessageSquare,
      title: "Conversación",
      text: "¿Cuáles son las tendencias tecnológicas para 2026?",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      {/* Main icon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#4f46e5] to-[#6366f1] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4f46e5]/30">
          <Sparkles size={40} className="text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#0f1018] flex items-center justify-center">
          <span className="text-xs">✨</span>
        </div>
      </div>

      {/* Welcome message */}
      <h2 className="text-2xl md:text-3xl font-mono text-gray-100 mb-3 text-center">
        ¡Hola! Soy Ren
      </h2>
      <p className="text-sm md:text-base font-mono text-gray-400 mb-8 text-center max-w-md">
        Tu asistente de IA listo para ayudarte. Puedo responder preguntas, ayudarte con código, generar ideas y más.
      </p>

      {/* Guest info */}
      {isGuest && (
        <div className="mb-8 px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-lg max-w-md">
          <p className="text-xs font-mono text-amber-400/90 text-center">
            👋 Estás en <strong>modo invitado</strong>. Tus conversaciones se guardan localmente.
          </p>
        </div>
      )}

      {/* Suggestions */}
      <div className="w-full max-w-2xl space-y-3 mb-8">
        <p className="text-xs font-mono text-gray-500 mb-4 text-center">
          Prueba preguntando:
        </p>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => {
              // This would trigger sending the message
              // We'll let the parent component handle this
              const event = new CustomEvent('sendSuggestion', { detail: suggestion.text });
              window.dispatchEvent(event);
            }}
            className="w-full px-4 py-3 bg-[#1a1d2e] hover:bg-[#1e2238] border border-[#1f2234] hover:border-[#4f46e5]/50 rounded-lg transition-all group text-left"
            style={{ animation: `slideUpFade 0.4s ease-out ${index * 0.1}s both` }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#0f1018] rounded-lg group-hover:bg-[#4f46e5]/10 transition-colors">
                <suggestion.icon size={18} className="text-gray-400 group-hover:text-[#6366f1] transition-colors" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-mono text-gray-500 mb-1">
                  {suggestion.title}
                </p>
                <p className="text-sm font-mono text-gray-300 group-hover:text-gray-100 transition-colors">
                  "{suggestion.text}"
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Keyboard hint — solo visible en escritorio */}
      {!isTouchDevice && (
      <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
        <span>💡 Tip:</span>
        <span>Presiona</span>
        <kbd className="px-2 py-1 bg-[#1a1d2e] border border-[#2d3250] rounded text-gray-400">
          Ctrl
        </kbd>
        <span>+</span>
        <kbd className="px-2 py-1 bg-[#1a1d2e] border border-[#2d3250] rounded text-gray-400">
          /
        </kbd>
        <span>para ver todos los atajos</span>
      </div>
      )}

      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}