import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import renAvatar from 'figma:asset/f7525c5786cfe4f02e861fff75eac3f54b4332bd.png';

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, displayName: username }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al crear cuenta');
        setIsLoading(false);
        return;
      }

      // Mostrar código de recuperación antes de entrar
      if (data.recoveryCode) {
        setRecoveryCode(data.recoveryCode);
        setIsLoading(false);
      } else {
        localStorage.setItem('ren_user', JSON.stringify({
          user_id: username.toLowerCase().trim(),
          name: data.username,
          role: 'user',
        }));
        navigate('/chat');
      }
    } catch {
      alert('Error de conexión con el servidor');
      setIsLoading(false);
    }
  };

  // Pantalla de código de recuperación después de registro exitoso
  if (recoveryCode) {
    return (
      <div className="min-h-dvh flex flex-col justify-center px-4 py-6 sm:py-12 overflow-y-auto" style={{ backgroundColor: '#0f1018' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto text-center"
        >
          <div className="bg-[#16192a] border border-[#252942] rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
            <div className="text-5xl mb-4">🔑</div>
            <h1 className="text-xl font-mono text-gray-100 mb-2">¡Cuenta creada!</h1>
            <p className="text-sm text-gray-400 mb-6">Guarda este código. Lo necesitarás si olvidas tu contraseña.</p>
            
            <div className="bg-[#0a0d14] border-2 border-[#4f46e5]/40 rounded-xl p-4 mb-4">
              <span className="text-3xl font-mono font-bold tracking-[0.3em] text-[#818cf8]">{recoveryCode}</span>
            </div>
            
            <p className="text-xs text-amber-400/80 mb-6 flex items-center justify-center gap-1">
              ⚠️ No lo pierdas. No podremos recuperarlo.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const userStr = localStorage.getItem('ren_user');
                if (userStr) navigate('/chat');
                else {
                  localStorage.setItem('ren_user', JSON.stringify({
                    user_id: username.toLowerCase().trim(),
                    name: username,
                    role: 'user',
                  }));
                  navigate('/chat');
                }
              }}
              className="w-full py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-mono rounded-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
            >
              Ya lo guardé, entrar al chat
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-4 py-6 sm:py-12 overflow-y-auto" style={{ backgroundColor: 'var(--ren-bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100 transition-colors mb-8 font-mono group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </button>

        {/* Card */}
        <div className="bg-[#16192a] border border-[#252942] rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#0a0d14] flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.4)] border-2 border-[#4f46e5]/40">
              <img src={renAvatar} alt="Ren" className="w-full h-full object-cover brightness-125" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-mono text-gray-100 mb-2">Crear cuenta</h1>
            <p className="text-sm text-gray-400 font-mono">Comienza tu experiencia con Ren</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                Nombre completo
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  className="w-full bg-[#0f1018] border border-[#2d3250] rounded-lg px-12 py-3 text-gray-100 font-mono text-sm focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full bg-[#0f1018] border border-[#2d3250] rounded-lg px-12 py-3 text-gray-100 font-mono text-sm focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="w-full bg-[#0f1018] border border-[#2d3250] rounded-lg px-12 py-3 text-gray-100 font-mono text-sm focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="text-xs font-mono text-gray-500 leading-relaxed">
              Al crear una cuenta, aceptas nuestros{' '}
              <button type="button" className="text-[#6366f1] hover:text-[#4f46e5] transition-colors">
                Términos de Servicio
              </button>{' '}
              y{' '}
              <button type="button" className="text-[#6366f1] hover:text-[#4f46e5] transition-colors">
                Política de Privacidad
              </button>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-mono rounded-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </motion.button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm font-mono text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-[#6366f1] hover:text-[#4f46e5] transition-colors"
              >
                Iniciar sesión
              </button>
            </p>
          </div>

          {/* Guest mode */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                const guestId = 'guest_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('ren_user', JSON.stringify({ user_id: guestId, isGuest: true, name: 'Invitado' }));
                navigate('/chat');
              }}
              className="text-xs font-mono text-gray-500 hover:text-[#6366f1] transition-colors underline underline-offset-4"
            >
              Continuar como invitado
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}