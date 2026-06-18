import { useState, Suspense, lazy } from 'react';
import CursorGlow from './CursorGlow';
import ecoscanTitle from '../assets/ecoscan_title.png';

const Globe = lazy(() => import('./Globe'));

/* ── tiny feature pill ── */
function Pill({ emoji, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                     text-[0.62rem] font-semibold tracking-wide
                     border border-white/[0.08] bg-white/[0.03] text-slate-400
                     hover:border-emerald-500/30 hover:text-emerald-400
                     transition-all duration-200 cursor-default">
      <span>{emoji}</span>{label}
    </span>
  );
}

/* ── input field ── */
function Field({ type = 'text', placeholder, value, onChange, autoComplete }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03]
                 px-4 py-3 text-[0.85rem] font-medium text-white
                 placeholder:text-slate-600
                 focus:border-emerald-500/40 focus:bg-white/[0.05] focus:outline-none
                 transition-all duration-150"
    />
  );
}

export default function LandingPage({ onAuthenticate, t, lang, setLang, loading, authError }) {
  const [mode, setMode] = useState('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [showValidation, setShowValidation] = useState(false);

  const isRegister = mode === 'register';
  const isValid = (!isRegister || name.trim()) && email.trim() && password.trim() && (!isRegister || password.length >= 8);

  const handleSubmit = () => {
    setShowValidation(true);
    if (!isValid) return;
    onAuthenticate({ mode, name: name.trim(), email: email.trim(), password, role });
  };

  const handleModeChange = (m) => { setMode(m); setShowValidation(false); };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-y-auto overflow-x-hidden bg-[#050507] font-['Outfit']">
      <CursorGlow />

      {/* ── Ambient background blobs ── */}
      <style>{`
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-50px) scale(1.08)} 66%{transform:translate(-40px,70px) scale(0.94)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-70px,40px) scale(1.1)} 66%{transform:translate(50px,-60px) scale(0.92)} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,60px) scale(1.12)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up-1 { animation: fadeUp 0.7s ease both; }
        .fade-up-2 { animation: fadeUp 0.7s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.2s ease both; }
        .fade-up-4 { animation: fadeUp 0.7s 0.3s ease both; }
      `}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"
          style={{ background:'radial-gradient(circle, #059669 0%, transparent 70%)', opacity:0.12, filter:'blur(60px)', animation:'blob1 16s ease-in-out infinite' }} />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full"
          style={{ background:'radial-gradient(circle, #0d9488 0%, transparent 70%)', opacity:0.1, filter:'blur(80px)', animation:'blob2 20s ease-in-out infinite', animationDelay:'3s' }} />
        <div className="absolute top-[40%] left-[35%] w-[400px] h-[400px] rounded-full hidden sm:block"
          style={{ background:'radial-gradient(circle, #065f46 0%, transparent 70%)', opacity:0.08, filter:'blur(100px)', animation:'blob3 24s ease-in-out infinite', animationDelay:'6s' }} />
      </div>

      {/* ── Top nav bar ── */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between
                      px-6 sm:px-10 py-4 border-b border-white/[0.05]">
        <img src={ecoscanTitle} alt="EcoScan"
          className="h-5 sm:h-6 w-auto object-contain opacity-80 pointer-events-none" />

        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-full px-1.5 py-1">
          {[{ id:'en', label:'EN' }, { id:'hi', label:'हि' }].map(l => (
            <button key={l.id} onClick={() => setLang(l.id)}
              className={`px-3 py-1 rounded-full text-[0.62rem] font-bold tracking-widest uppercase
                         cursor-pointer border-0 transition-all duration-200
                         ${lang === l.id
                           ? 'bg-emerald-500/20 text-emerald-400'
                           : 'text-slate-600 hover:text-slate-400 bg-transparent'}`}>
              {l.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className="relative z-20 flex min-h-[100dvh] w-full items-center
                      px-5 sm:px-10 lg:px-16 xl:px-24 pt-24 pb-12">
        <div className="w-full flex items-center justify-between gap-12 lg:gap-16">

          {/* ──── LEFT: Auth card ──── */}
          <div className="w-full max-w-[440px] flex flex-col gap-6 mx-auto lg:mx-0 justify-center">

            {/* Mobile Hero text */}
            <div className="fade-up-1 flex flex-col gap-4 lg:hidden mb-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 self-start
                              px-3 py-1.5 rounded-full
                              border border-emerald-500/20 bg-emerald-500/[0.06]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[0.6rem] font-bold uppercase tracking-widest text-emerald-400">
                  AI-Powered • Community Platform
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-[2rem] sm:text-[2.4rem] font-bold leading-[1.15] text-white tracking-tight">
                {t.heroTitle || <>Spot waste.<br />Report it. Clean it.</>}
              </h1>

              {/* Sub */}
              <p className="text-[0.82rem] text-slate-500 leading-relaxed max-w-[360px]">
                {t.heroSub || 'EcoScan connects citizens and volunteers through AI-verified waste cleanup — making every cleanup count on a live global map.'}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mt-1">
                <Pill emoji="🗺️" label="Live Map" />
                <Pill emoji="🤖" label="AI Verified" />
                <Pill emoji="🏆" label="Leaderboard" />
                <Pill emoji="🔥" label="Heatmap" />
                <Pill emoji="🎨" label="8 Themes" />
              </div>
            </div>

            {/* Desktop Auth Title */}
            <div className="hidden lg:flex flex-col gap-2 fade-up-1">
              <h2 className="text-[1.8rem] font-bold text-white tracking-tight">
                {isRegister ? 'Welcome to EcoScan' : 'Welcome back'}
              </h2>
              <p className="text-[0.85rem] text-slate-400">
                {isRegister 
                  ? 'Sign up to start tracking and cleaning waste globally.' 
                  : 'Log in to continue your environmental impact.'}
              </p>
            </div>

            {/* ── Auth Card ── */}
            <div className="fade-up-2 w-full rounded-2xl border border-white/[0.07]
                            bg-white/[0.025] backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.5)]
                            overflow-hidden">

              {/* Tab switcher */}
              <div className="flex border-b border-white/[0.07]">
                {['register', 'login'].map(m => (
                  <button key={m} onClick={() => handleModeChange(m)}
                    className={`flex-1 py-3.5 text-[0.68rem] font-bold uppercase tracking-widest
                               cursor-pointer border-0 transition-all duration-200
                               ${mode === m
                                 ? 'text-white bg-white/[0.04] border-b-2 border-emerald-500'
                                 : 'text-slate-600 hover:text-slate-400 bg-transparent'}`}>
                    {t[m] || m}
                  </button>
                ))}
              </div>

              {/* Form fields */}
              <div className="p-5 flex flex-col gap-3" onKeyDown={handleKeyDown}>
                {isRegister && (
                  <Field
                    placeholder={t.name || 'Full Name'}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                  />
                )}

                <Field
                  type="email"
                  placeholder={t.email || 'Email Address'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />

                <div className="flex flex-col gap-1.5">
                  <Field
                    type="password"
                    placeholder={isRegister ? (t.enterPassword || 'Create a password') : (t.password || 'Password')}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                  />
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[0.6rem] text-slate-700">
                      {isRegister ? (t.passwordMinHint || 'At least 8 characters') : ''}
                    </span>
                    {isRegister && password.length > 0 && (
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className={`h-0.5 w-8 rounded-full transition-all duration-300
                            ${password.length >= 12 ? 'bg-emerald-500'
                              : password.length >= 8 ? i < 2 ? 'bg-amber-400' : 'bg-white/10'
                              : i === 0 ? 'bg-red-500' : 'bg-white/10'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Role selector (register only) */}
                {isRegister && (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'citizen',   emoji: '👤', desc: 'Report waste spots' },
                      { id: 'volunteer', emoji: '🧹', desc: 'Clean & earn points' },
                    ].map(r => (
                      <button key={r.id} onClick={() => setRole(r.id)}
                        className={`flex flex-col items-start gap-0.5 px-3.5 py-3 rounded-xl
                                   cursor-pointer border transition-all duration-150 text-left
                                   ${role === r.id
                                     ? 'border-emerald-500/40 bg-emerald-500/[0.07] text-white'
                                     : 'border-white/[0.06] bg-transparent text-slate-500 hover:border-white/[0.12] hover:text-slate-300'}`}>
                        <span className="text-base">{r.emoji}</span>
                        <span className="text-[0.68rem] font-bold uppercase tracking-wider">{t[r.id] || r.id}</span>
                        <span className="text-[0.58rem] text-slate-600">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Validation error */}
                {showValidation && !isValid && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl
                                  border border-amber-500/20 bg-amber-500/[0.06] text-amber-300 text-[0.72rem]">
                    <span>⚠️</span>
                    <span>{isRegister && !name.trim()
                      ? (t.userNameRequired || 'Please enter your name.')
                      : !email.trim() || !password.trim()
                        ? (t.authFieldsRequired || 'Please fill in all fields.')
                        : (t.passwordTooShort || 'Password must be at least 8 characters.')}</span>
                  </div>
                )}

                {/* Auth error from server */}
                {authError && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl
                                  border border-rose-500/20 bg-rose-500/[0.06] text-rose-300 text-[0.72rem]">
                    <span>✕</span><span>{authError}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full mt-1 py-3.5 rounded-xl font-bold text-[0.8rem] tracking-wider uppercase
                             bg-emerald-500 hover:bg-emerald-400 text-white border-0 cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-[0_8px_24px_rgba(0,136,81,0.3)]
                             hover:shadow-[0_12px_32px_rgba(0,136,81,0.45)]
                             hover:-translate-y-0.5 active:translate-y-0
                             transition-all duration-200
                             flex items-center justify-center gap-2">
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isRegister ? (t.createAccount || 'Create Account') : (t.login || 'Sign In')}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Switch mode hint */}
                <p className="text-center text-[0.62rem] text-slate-700 pt-1">
                  {isRegister
                    ? <span>Already have an account?{' '}
                        <button onClick={() => handleModeChange('login')} className="text-emerald-500 hover:text-emerald-400 font-semibold cursor-pointer bg-transparent border-0">Sign in</button>
                      </span>
                    : <span>No account yet?{' '}
                        <button onClick={() => handleModeChange('register')} className="text-emerald-500 hover:text-emerald-400 font-semibold cursor-pointer bg-transparent border-0">Register free</button>
                      </span>
                  }
                </p>
              </div>
            </div>

            {/* Social proof micro-line */}
            <p className="fade-up-3 text-center text-[0.6rem] text-slate-700 tracking-wider uppercase">
              Free to use · No credit card required · Open community
            </p>
          </div>

          {/* ──── RIGHT: 3D Globe ──── */}
          <div className="fade-up-4 relative hidden flex-1 items-center justify-center lg:flex min-h-[600px]">
            
            {/* Desktop Hero text overlay centered */}
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
              <div className="relative flex flex-col items-center gap-5 text-center px-4 w-full max-w-[500px]">
                {/* Badge */}
                <div className="inline-flex items-center gap-2
                                px-3 py-1.5 rounded-full
                                border border-emerald-500/20 bg-emerald-500/[0.06]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest text-emerald-400">
                    AI-Powered • Community Platform
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-[2.2rem] sm:text-[3rem] font-bold leading-[1.1] text-white tracking-tight" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
                  {t.heroTitle || <>Spot waste.<br />Report it. Clean it.</>}
                </h1>

                {/* Sub */}
                <p className="text-[0.9rem] text-slate-300 leading-relaxed max-w-[420px]" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  {t.heroSub || 'EcoScan connects citizens and volunteers through AI-verified waste cleanup — making every cleanup count on a live global map.'}
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  <Pill emoji="🗺️" label="Live Map" />
                  <Pill emoji="🤖" label="AI Verified" />
                  <Pill emoji="🏆" label="Leaderboard" />
                  <Pill emoji="🔥" label="Heatmap" />
                  <Pill emoji="🎨" label="8 Themes" />
                </div>
              </div>
            </div>

            {/* Glow ring behind globe */}
            <div className="absolute w-[440px] h-[440px] xl:w-[540px] xl:h-[540px] rounded-full"
              style={{ background:'radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%)' }} />

            <div className="relative aspect-square w-[min(46vw,800px)] min-w-[360px] max-w-[800px]">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500/60 rounded-full animate-spin" />
                </div>
              }>
                <Globe />
              </Suspense>
            </div>

            {/* Stat badges floating around globe */}
            <div className="absolute top-[18%] right-[8%] flex flex-col gap-0.5
                            px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-black/60 backdrop-blur-md">
              <span className="text-[1.4rem] font-bold text-emerald-400 leading-none tabular-nums">12K+</span>
              <span className="text-[0.55rem] text-slate-600 uppercase tracking-widest">Reports Filed</span>
            </div>
            <div className="absolute bottom-[22%] left-[5%] flex flex-col gap-0.5
                            px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-black/60 backdrop-blur-md">
              <span className="text-[1.4rem] font-bold text-amber-400 leading-none tabular-nums">8.5K</span>
              <span className="text-[0.55rem] text-slate-600 uppercase tracking-widest">Cleanups Done</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
