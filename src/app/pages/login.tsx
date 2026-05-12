import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import renAvatar from 'figma:asset/f7525c5786cfe4f02e861fff75eac3f54b4332bd.png';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryUser, setRecoveryUser] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryPass, setRecoveryPass] = useState('');

  const handleResetPassword = async () => {
    if (!recoveryUser || !recoveryCode || !recoveryPass) return alert('Completa todos los campos');
    setIsLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: recoveryUser, recoveryCode, newPassword: recoveryPass }),
      });
      const data = await res.json();
      setIsLoading(false);
      if (res.ok) {
        alert(data.message || 'Contraseña actualizada. Ya puedes iniciar sesión.');
        setShowRecovery(false);
      } else {
        alert(data.error || 'Error al restablecer');
      }
    } catch {
      setIsLoading(false);
      alert('Error de conexión');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al iniciar sesión');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('ren_user', JSON.stringify({
        user_id: data.token,
        name: data.username,
        role: data.role,
      }));
      navigate('/chat');
    } catch {
      alert('Error de conexión con el servidor');
      setIsLoading(false);
    }
  };

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
            <h1 className="text-2xl font-mono text-gray-100 mb-2">Iniciar sesión</h1>
            <p className="text-sm text-gray-400 font-mono">Bienvenido de vuelta a Ren</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username or Email */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                Usuario o correo electrónico
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario o email@ejemplo.com"
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
                  placeholder="••••••••"
                  required
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

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-mono rounded-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </motion.button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-sm font-mono text-gray-400">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-[#6366f1] hover:text-[#4f46e5] transition-colors"
              >
                Crear cuenta
              </button>
            </p>
          </div>

          {/* Forgot password */}
          <div className="mt-3 text-center">
            <button
              onClick={() => setShowRecovery(!showRecovery)}
              className="text-xs font-mono text-gray-500 hover:text-[#818cf8] transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {showRecovery && (
            <div className="mt-4 p-4 bg-[#0f1018] border border-[#2d3250] rounded-xl">
              <p className="text-xs font-mono text-gray-400 mb-3">Ingresa tu usuario, el código de recuperación y una nueva contraseña.</p>
              <input
                type="text"
                placeholder="Usuario"
                value={recoveryUser}
                onChange={(e) => setRecoveryUser(e.target.value)}
                className="w-full bg-[#1a1d2e] border border-[#2d3250] rounded-lg px-3 py-2 text-gray-100 text-sm mb-2 focus:outline-none focus:border-[#4f46e5]"
              />
              <input
                type="text"
                placeholder="Código de recuperación"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                className="w-full bg-[#1a1d2e] border border-[#2d3250] rounded-lg px-3 py-2 text-gray-100 text-sm mb-2 focus:outline-none focus:border-[#4f46e5]"
              />
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={recoveryPass}
                onChange={(e) => setRecoveryPass(e.target.value)}
                className="w-full bg-[#1a1d2e] border border-[#2d3250] rounded-lg px-3 py-2 text-gray-100 text-sm mb-3 focus:outline-none focus:border-[#4f46e5]"
              />
              <button
                onClick={handleResetPassword}
                disabled={isLoading}
                className="w-full py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-mono text-sm rounded-lg transition-all disabled:opacity-50"
              >
                {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
              </button>
            </div>
          )}

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