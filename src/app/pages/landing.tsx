import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Brain, Zap, Shield, MessageCircle, ArrowRight } from 'lucide-react';
import renAvatar from 'figma:asset/f7525c5786cfe4f02e861fff75eac3f54b4332bd.png';

export function LandingPage() {
  const navigate = useNavigate();

  const goGuest = () => {
    const guestId = 'guest_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('ren_user', JSON.stringify({ user_id: guestId, isGuest: true, name: 'Invitado' }));
    navigate('/chat');
  };

  return (
    <div className="h-dvh flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--ren-bg-primary)' }}>
      {/* Navigation */}
      <nav className="w-full border-b border-[#1e2238] flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#0a0d14] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-[#4f46e5]/30">
              <img src={renAvatar} alt="Ren" className="w-full h-full object-cover" />
            </div>
            <span className="text-base md:text-lg font-mono text-gray-100 tracking-tight">REN</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-xs md:text-sm font-mono text-gray-400 hover:text-gray-100 transition-colors"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-3 py-1.5 text-xs md:text-sm font-mono text-[#6366f1] hover:text-[#4f46e5] transition-colors"
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg"
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#0a0d14] flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(79,70,229,0.4)] border-2 border-[#4f46e5]/40">
              <img src={renAvatar} alt="REN" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-mono text-gray-100 mb-6">REN</h1>

          {/* Botón principal: chatear ahora */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={goGuest}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-mono rounded-lg transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 text-base mx-auto mb-4"
          >
            <MessageCircle size={18} />
            Chatear ahora
            <ArrowRight size={16} />
          </motion.button>

          <p className="text-xs text-gray-500 font-mono mb-8">
            Sin registro. Empieza al instante.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs font-mono text-gray-500">
            <span className="flex items-center gap-1"><Brain size={12} /> Modelos flexibles</span>
            <span className="flex items-center gap-1"><Zap size={12} /> Sin registro</span>
            <span className="flex items-center gap-1"><Shield size={12} /> Privado</span>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-[#1e2238] py-3 md:py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-600 font-mono">REN — 2026</p>
        </div>
      </footer>
    </div>
  );
}
