import { useState, Suspense, lazy } from 'react';
import CursorGlow from './CursorGlow';
import ecoscanTitle from '../assets/ecoscan_title.png';

const Globe = lazy(() => import('./Globe'));

export default function LandingPage({ onAuthenticate, t, lang, setLang, loading, authError }) {
  const [mode, setMode] = useState('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [showValidation, setShowValidation] = useState(false);

  const isRegisterMode = mode === 'register';
  const passwordHint = isRegisterMode
    ? (t.passwordMinHint || 'Use at least 8 characters.')
    : (t.passwordLoginHint || 'Use the password you registered with.');
  const isFormValid = (!isRegisterMode || name.trim()) && email.trim() && password.trim() && (!isRegisterMode || password.length >= 8);

  const handleStart = () => {
    setShowValidation(true);
    if (isRegisterMode && !name.trim()) {
      return;
    }
    if (!email.trim() || !password.trim()) {
      return;
    }
    if (isRegisterMode && password.length < 8) {
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

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setShowValidation(false);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black font-['Outfit'] search-cursor">
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
      <div className="fixed right-4 top-4 z-50 flex items-center gap-4 sm:right-6 sm:top-6 sm:gap-6 lg:right-10 lg:top-10">
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

      <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-[1500px] items-center justify-center px-4 py-4 sm:px-6 sm:py-6 md:px-8 lg:px-10 xl:px-14">
        <div className="flex w-full items-center justify-center gap-8 lg:justify-between xl:gap-12">
          <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-bottom-8 duration-1000 sm:max-w-[480px] lg:max-w-[500px]">
            {/* Brand Header */}
            <div className="mb-6 text-center sm:mb-8 lg:mb-10 lg:text-left">
              <div className="relative mx-auto mb-2 flex w-full justify-center lg:mx-0 lg:justify-start">
                <img
                  src={ecoscanTitle}
                  alt="EcoScan"
                  className="h-auto w-[min(100%,320px)] sm:w-[min(100%,370px)] md:w-[min(100%,410px)] lg:w-[clamp(22rem,27vw,30rem)] drop-shadow-[0_10px_35px_rgba(16,185,129,0.5)] filter-distressed pointer-events-none"
                />
              </div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.32em] text-emerald-500/80 sm:text-[0.72rem] sm:tracking-[0.4em] lg:pl-2">
                {t.tagline || t.heroSub}
              </p>
            </div>

            {/* Dynamic Auth Card */}
            <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.03] p-3 shadow-2xl backdrop-blur-3xl transition-all duration-500 hover:border-emerald-500/20 sm:rounded-[2.5rem] sm:p-4">
              <div className="mb-4 flex gap-2 rounded-3xl bg-black/40 p-2">
                {['register', 'login'].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleModeChange(m)}
                    className={`flex-1 rounded-2xl px-4 py-3 text-[0.68rem] font-black uppercase tracking-[0.18em] transition-all duration-500 sm:px-6 sm:text-[0.72rem]
                      ${mode === m
                        ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                        : 'text-white/40 hover:bg-white/5 hover:text-white/60'}`}
                  >
                    {t[m]}
                  </button>
                ))}
              </div>

              <div className="space-y-3 p-1 sm:p-2">
                {isRegisterMode && (
                  <input
                    type="text"
                    placeholder={t.name || 'Full Name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-[1.35rem] border border-white/5 bg-black/30 px-5 py-4 text-sm font-medium text-white transition-all placeholder:text-white/40 focus:border-emerald-500/40 focus:outline-none sm:px-6"
                  />
                )}
                <input
                  type="email"
                  placeholder={t.email || 'Email Address'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[1.35rem] border border-white/5 bg-black/30 px-5 py-4 text-sm font-medium text-white transition-all placeholder:text-white/40 focus:border-emerald-500/40 focus:outline-none sm:px-6"
                />
                <input
                  type="password"
                  placeholder={isRegisterMode ? (t.enterPassword || 'Create a password') : (t.password || 'Password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[1.35rem] border border-white/5 bg-black/30 px-5 py-4 text-sm font-medium text-white transition-all placeholder:text-white/40 focus:border-emerald-500/40 focus:outline-none sm:px-6"
                />

                <div className="flex items-center justify-between gap-3 px-1 text-[0.72rem] text-white/45">
                  <span>{passwordHint}</span>
                  {isRegisterMode && password.length > 0 && password.length < 8 && (
                    <span className="text-amber-300/90">{t.passwordTooShort || 'Minimum 8 characters'}</span>
                  )}
                </div>

                {isRegisterMode && (
                  <div className="flex gap-2 rounded-2xl border border-white/5 bg-black/20 p-2">
                    {['citizen', 'volunteer'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`flex-1 rounded-xl py-3 text-[0.65rem] font-bold uppercase tracking-widest transition-all
                          ${role === r ? 'bg-emerald-500/10 text-emerald-400' : 'text-white/30 hover:text-white/50'}`}
                      >
                        {t[r]}
                      </button>
                    ))}
                  </div>
                )}

                {showValidation && !isFormValid && (
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
                    {isRegisterMode && !name.trim()
                      ? (t.userNameRequired || 'Please enter your name to continue.')
                      : !email.trim() || !password.trim()
                        ? (t.authFieldsRequired || 'Please fill in email and password.')
                        : (t.passwordTooShort || 'Minimum 8 characters')}
                  </div>
                )}

                {authError && (
                  <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {authError}
                  </div>
                )}

                <button
                  onClick={handleStart}
                  disabled={loading || !isFormValid}
                  className="mt-4 flex w-full items-center justify-center gap-3 rounded-[1.4rem] bg-emerald-500 px-6 py-4 text-sm font-black uppercase tracking-widest text-black shadow-[0_10px_30px_rgba(16,185,129,0.2)] transition-all hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  ) : (
                    <>
                      {isRegisterMode ? (t.createAccount || 'Create Account') : (t.login || 'Login')}
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="relative hidden flex-1 items-center justify-end lg:flex">
            <div className="pointer-events-none relative aspect-square w-[min(40vw,700px)] min-w-[320px] max-w-[700px] xl:w-[min(42vw,760px)]">
              <Suspense fallback={null}>
                <Globe />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
