import { useState } from 'react';
import logo from '../assets/logo.png';
import CursorGlow from './CursorGlow';

export default function LandingPage({ onAuthenticate, t, lang, setLang, loading }) {
  const [mode, setMode] = useState('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');

  const handleStart = () => {
    if (mode === 'register' && !name.trim()) {
      alert(t.userNameRequired);
      return;
    }
    if (!email.trim() || !password.trim()) {
      alert(t.authFieldsRequired);
      return;
    }
    onAuthenticate({
      mode,
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    });
  };

  return (
    <div className="fixed inset-0 flex flex-col items-start justify-center overflow-hidden font-['Outfit'] bg-black pl-10 md:pl-24 lg:pl-32 search-cursor">
      <CursorGlow />

      {/* Language Switch - Top Right (Floating Style) */}
      <div className="fixed top-10 right-10 z-50 flex items-center gap-6">
        <button
          onClick={() => setLang('en')}
          className={`text-[0.75rem] font-black tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer border-0 bg-transparent
            ${lang === 'en' ? 'text-emerald-500 scale-110' : 'text-white/20 hover:text-white/40'}`}
        >
          ENG
        </button>
        <button
          onClick={() => setLang('hi')}
          className={`text-[1.1rem] font-black transition-all duration-300 cursor-pointer border-0 bg-transparent
            ${lang === 'hi' ? 'text-emerald-500 scale-110' : 'text-white/20 hover:text-white/40'}`}
        >
          हिन्दी
        </button>
      </div>

      <div className="relative z-20 flex flex-col items-center max-w-[440px] w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Animated Brand Header */}
        <div className="mb-12 group">
          <div className="relative mb-6 transform transition-transform duration-700 group-hover:scale-105">
            <div className="absolute -inset-4 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-700" />
            <img src={logo} alt="EcoScan" className="relative w-48 h-auto drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]" />
          </div>
          <div className="text-center">
            <h1 className="text-6xl font-black tracking-tighter mb-3 bg-gradient-to-b from-white via-white to-emerald-400 bg-clip-text text-transparent drop-shadow-sm leading-tight">
              EcoScan
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-emerald-500/30" />
              <p className="text-[0.7rem] font-bold tracking-[0.4em] text-emerald-500/80 uppercase">
                {t.heroSub}
              </p>
              <div className="h-[1px] w-8 bg-emerald-500/30" />
            </div>
          </div>
        </div>

        {/* Dynamic Auth Card */}
        <div className="w-full bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-3 border border-white/10 shadow-2xl relative overflow-hidden group/card transition-all duration-500 hover:border-emerald-500/20">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          
          {/* Mode Toggle */}
          <div className="flex p-2 gap-2 mb-4 bg-black/40 rounded-3xl relative z-10">
            {['register', 'login'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 px-6 rounded-2xl text-[0.7rem] font-black tracking-widest uppercase transition-all duration-500
                  ${mode === m 
                    ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
              >
                {t[m]}
              </button>
            ))}
          </div>

          <div className="space-y-3 p-2 relative z-10">
            {mode === 'register' && (
              <input
                type="text"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/30 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white text-sm focus:outline-none focus:border-emerald-500/40 transition-all font-medium placeholder:text-white/20"
              />
            )}
            <input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/30 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white text-sm focus:outline-none focus:border-emerald-500/40 transition-all font-medium placeholder:text-white/20"
            />
            <input
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/30 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white text-sm focus:outline-none focus:border-emerald-500/40 transition-all font-medium placeholder:text-white/20"
            />

            {mode === 'register' && (
              <div className="flex gap-2 bg-black/20 p-2 rounded-2xl border border-white/5">
                {['citizen', 'volunteer'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 py-3 rounded-xl text-[0.65rem] font-bold tracking-widest uppercase transition-all
                      ${role === r ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/30 hover:text-white/50'}`}
                  >
                    {t[r]}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black rounded-[1.5rem] py-4 px-6 font-black text-sm uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'register' ? t.createAccount : t.startScanning}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Technical Footer */}
        <div className="mt-12 flex flex-col items-center gap-4 opacity-40">
          <div className="flex gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[0.6rem] font-bold tracking-[0.3em] uppercase mb-1">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[0.6rem] font-medium uppercase tracking-widest">Orbital Online</span>
              </div>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[0.6rem] font-bold tracking-[0.3em] uppercase mb-1">Region</span>
              <span className="text-[0.6rem] font-medium uppercase tracking-widest text-emerald-400">Global Scan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
