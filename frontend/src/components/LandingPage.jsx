import { useState, Suspense, lazy } from 'react';
import CursorGlow from './CursorGlow';
import ecoscanTitle from '../assets/ecoscan_title.png';

const Globe = lazy(() => import('./Globe'));

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

      {/* Interactive Fluid Gradient Background Blobs */}
      <style>{`
        @keyframes blob-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(80px, -60px) scale(1.1); }
          50% { transform: translate(-40px, 80px) scale(0.95); }
          75% { transform: translate(60px, 40px) scale(1.05); }
        }
        @keyframes blob-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-70px, 50px) scale(1.08); }
          50% { transform: translate(60px, -70px) scale(0.92); }
          75% { transform: translate(-30px, -40px) scale(1.12); }
        }
        @keyframes blob-drift-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, 70px) scale(1.15); }
          66% { transform: translate(-60px, -30px) scale(0.9); }
        }
        @keyframes blob-drift-4 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(-50px, -70px) scale(1.1) rotate(5deg); }
          50% { transform: translate(70px, 30px) scale(0.95) rotate(-5deg); }
          75% { transform: translate(20px, -50px) scale(1.08) rotate(3deg); }
        }
      `}</style>
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        <div
          className="absolute top-[5%] left-[2%] w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background: '#10b981',
            filter: 'blur(100px)',
            animation: 'blob-drift-1 14s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[5%] right-[15%] w-[450px] h-[450px] rounded-full opacity-25"
          style={{
            background: '#14b8a6',
            filter: 'blur(90px)',
            animation: 'blob-drift-2 18s ease-in-out infinite',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: '#34d399',
            filter: 'blur(110px)',
            animation: 'blob-drift-3 20s ease-in-out infinite',
            animationDelay: '5s',
          }}
        />
        <div
          className="absolute top-[8%] right-[5%] w-[350px] h-[350px] rounded-full opacity-35"
          style={{
            background: '#065f46',
            filter: 'blur(80px)',
            animation: 'blob-drift-4 16s ease-in-out infinite',
            animationDelay: '3s',
          }}
        />
      </div>

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

      <div className="relative z-20 flex flex-col items-center max-w-[440px] w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 -translate-y-20">
        {/* Brand Header */}
        <div className="mb-12 group">
          <div className="text-center">
            
            <div className="relative -mb-16 select-none flex justify-center z-30 translate-y-12 pointer-events-none">
              <img 
                src={ecoscanTitle} 
                alt="EcoScan" 
                className="w-[130%] h-auto max-w-[600px] drop-shadow-[0_10px_35px_rgba(16,185,129,0.5)] filter-distressed pointer-events-none transform origin-bottom" 
              />
            </div>
            <div className="flex items-center justify-center gap-3 relative z-20">
              <p className="text-[0.7rem] font-bold tracking-[0.4em] text-emerald-500/80 uppercase">
                {t.tagline || t.heroSub}
              </p>
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
                placeholder={t.name || "Full Name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/30 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white text-sm focus:outline-none focus:border-emerald-500/40 transition-all font-medium placeholder:text-white/40"
              />
            )}
            <input
              type="email"
              placeholder={t.email || "Email Address"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/30 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white text-sm focus:outline-none focus:border-emerald-500/40 transition-all font-medium placeholder:text-white/40"
            />
            <input
              type="password"
              placeholder={t.password || "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/30 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white text-sm focus:outline-none focus:border-emerald-500/40 transition-all font-medium placeholder:text-white/40"
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
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.5rem] py-4 px-6 font-black text-sm uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'register' ? (t.createAccount || 'Create Account') : (t.login || 'Login')}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
      
      <div className="absolute right-[-5%] md:right-[2%] top-1/2 -translate-y-1/2 w-[460px] md:w-[636px] lg:w-[726px] aspect-square pointer-events-none md:pointer-events-auto z-[5] hidden sm:block">
        <Suspense fallback={null}>
          <Globe />
        </Suspense>
      </div>
    </div>

  );
}
