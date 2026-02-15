
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Role } from '../types';
import { db } from '../services/mockDb';
import { LogIn, Crown, AlertCircle, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulasi delay jaringan untuk UX
    setTimeout(() => {
      const users = db.getUsers();
      // SECURITY FIX: Validasi email DAN password
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        onLogin(user);
      } else {
        setError('Kredensial salah. Silakan periksa email dan kata sandi Anda.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1c2e] via-[#2a2d4a] to-[#1a1c2e] px-4">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white/20">
        <div className="p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-indigo-600/10 p-5 rounded-[30px] mb-6 border border-indigo-600/20">
              <LogIn className="w-12 h-12 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-black text-[#1a1c2e] tracking-tight text-center">E-Absensi Pro</h1>
            <p className="text-gray-500 font-medium text-center">Masuk ke sistem presensi aman</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Email</label>
              <input 
                type="email" 
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="super@sekolah.com"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all font-medium disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Kata Sandi</label>
              <input 
                type="password" 
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all font-medium disabled:opacity-50"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold text-center border border-red-100 flex items-center justify-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Masuk Dashboard'
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Belum punya akun? <Link to="/register" className="text-indigo-600 font-black hover:underline">Daftar</Link>
            </p>
          </div>
        </div>
        
        <div className="bg-[#1a1c2e] p-6 text-center group cursor-help">
          <p className="text-[10px] text-indigo-400 font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-2">
            <ShieldCheck className="w-3 h-3" /> Encrypted Credentials
          </p>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default Login;
