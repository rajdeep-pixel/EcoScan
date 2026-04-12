import { useState, useEffect, useRef } from 'react';
import logo from '../assets/logo.png';

function FluidBackground() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();

    const baseBlobs = Array.from({ length: 6 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 500 + 300,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      color: `hsla(140, 80%, 8%, 0.45)`,
      magnetism: 0.008
    }));

    const accentBlobs = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 200 + 100,
      vx: (Math.random() - 0.5) * 2.5,
      vy: (Math.random() - 0.5) * 2.5,
      color: `hsla(150, 70%, 20%, 0.35)`,
      magnetism: 0.025
    }));

    const allBlobs = [...baseBlobs, ...accentBlobs];

    const render = () => {
      ctx.fillStyle = '#010604';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      allBlobs.forEach(blob => {
        blob.x += blob.vx;
        blob.y += blob.vy;

        const dx = mouse.current.x - blob.x;
        const dy = mouse.current.y - blob.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 800) {
          blob.x += dx * blob.magnetism;
          blob.y += dy * blob.magnetism;
        }

        if (blob.x < -blob.radius) blob.x = canvas.width + blob.radius;
        if (blob.x > canvas.width + blob.radius) blob.x = -blob.radius;
        if (blob.y < -blob.radius) blob.y = canvas.height + blob.radius;
        if (blob.y > canvas.height + blob.radius) blob.y = -blob.radius;

        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.filter = 'blur(110px)';
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-80" />;
}

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
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden font-['Outfit'] bg-black">
      <FluidBackground />

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

      <div className="relative z-10 w-full max-w-[480px] px-6 flex flex-col items-center mb-[15px]">
        
        {/* Responsive Massive Branding (Anchored Title) */}
        <div className="flex flex-col items-center mb-10">
            <div className="relative mb-[-72px] md:mb-[-96px] z-0">
                <div className="absolute inset-0 bg-emerald-600/20 blur-[140px] animate-pulse rounded-full" />
                <img src={logo} alt="Logo" className="relative w-72 h-72 md:w-96 md:h-96 object-contain drop-shadow-[0_0_80px_rgba(5,150,105,0.7)]" />
            </div>
            <h1 className="relative z-10 text-7xl md:text-8xl font-black tracking-[calc(-0.06em)] m-0 leading-[0.8] bg-gradient-to-r from-white via-emerald-600 to-emerald-900 bg-clip-text text-transparent">
                EcoScan
            </h1>
            <p className="relative z-10 text-[#059669]/60 text-[0.65rem] md:text-[0.75rem] font-black uppercase tracking-[0.5em] mt-5">{t.tagline}</p>
        </div>

        {/* Tailored Auth Panel (Centered Screen Fit) */}
        <div className="w-full bg-black/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 shadow-[0_45px_120px_rgba(0,0,0,0.9)] flex flex-col gap-3.5 transition-all hover:border-emerald-500/10 active:scale-[0.99] duration-500 mb-[15px]">
          
          {/* Row 1: Mode Toggle */}
          <div className="flex justify-center">
               <div className="relative w-full h-[46px] bg-black/40 rounded-xl p-1 flex border border-white/5">
                  <div 
                    className="absolute top-1 bottom-1 bg-gradient-to-br from-[#059669] to-[#064e3b] rounded-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_4px_15px_rgba(5,150,105,0.4)]"
                    style={{ 
                        left: mode === 'register' ? '4px' : 'calc(50% + 1px)', 
                        width: 'calc(50% - 5px)' 
                    }}
                  />
                  <button 
                    onClick={() => setMode('register')}
                    className={`relative z-10 flex-1 text-[0.6rem] font-black uppercase tracking-widest transition-colors duration-300 ${mode === 'register' ? 'text-white' : 'text-white/20 hover:text-white/35'}`}
                  >
                    {t.register}
                  </button>
                  <button 
                  onClick={() => setMode('login')}
                  className={`relative z-10 flex-1 text-[0.6rem] font-black uppercase tracking-widest transition-colors duration-300 ${mode === 'login' ? 'text-white' : 'text-white/20 hover:text-white/35'}`}
                  >
                    {t.login}
                  </button>
                 </div>
          </div>

          {/* Row 2: Horizontal Name & Email pairing */}
          <div className={`grid gap-3 transition-all duration-300 ${mode === 'register' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {mode === 'register' && (
                    <input
                        type="text"
                        placeholder={t.enterName}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-[46px] bg-white/[0.03] border border-white/5 rounded-xl px-5 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-medium"
                    />
                )}
                <input
                    type="email"
                    placeholder={t.enterEmail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[46px] bg-white/[0.03] border border-white/5 rounded-xl px-5 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-medium"
                />
          </div>

          {/* Row 3: Password */}
          <div className="w-full">
                <input
                    type="password"
                    placeholder={t.enterPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                    className="w-full h-[46px] bg-white/[0.03] border border-white/5 rounded-xl px-5 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-medium outline-none"
                />
          </div>

          {/* Row 4: Role Section */}
          {mode === 'register' && (
                <div className="w-full flex justify-center">
                    <div className="w-full flex gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
                        {['citizen', 'volunteer'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={`flex-1 py-2.5 rounded-lg text-[0.6rem] font-black uppercase tracking-[0.2em] transition-all duration-300
                                    ${role === r ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-600/25' : 'bg-transparent text-white/10 hover:text-white/20 border border-transparent'}`}
                            >
                                {r === 'citizen' ? t.citizen : t.volunteer}
                            </button>
                        ))}
                    </div>
                </div>
          )}

          {/* Row 5: Final Action Button */}
          <div className="pt-2 border-t border-white/[0.05] flex justify-center">
                <button
                    onClick={handleStart}
                    disabled={loading}
                    className="w-full h-[50px] bg-gradient-to-r from-[#059669] to-[#047857] text-white rounded-[1.1rem] font-black uppercase tracking-[0.3em] text-[0.7rem] flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(5,150,105,0.3)] hover:shadow-[0_20px_70px_rgba(5,150,105,0.5)] active:scale-[0.98] transition-all duration-500 disabled:opacity-50"
                >
                    {loading ? <Loader /> : (mode === 'register' ? t.createAccount : t.signIn)}
                    {!loading && <span className="text-xl mt-[-2.5px]">&rarr;</span>}
                </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
}
