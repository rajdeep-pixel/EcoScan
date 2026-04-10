import landingBg from '../assets/landing_bg.png';

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Background map image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 brightness-50 saturate-125"
        style={{ backgroundImage: `url(${landingBg})` }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e]/30 via-[#0a0f1e]/55 to-[#0a0f1e]/90" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6 mt-[12vh]">
        {/* Logo */}
        <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-indigo-500 to-green-500 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(99,102,241,0.5)] mb-1">
          🌿
        </div>

        {/* Title */}
        <h1 className="text-[clamp(2.8rem,8vw,5rem)] font-black tracking-tighter bg-gradient-to-br from-white to-indigo-300 bg-clip-text text-transparent m-0 leading-none">
          EcoScan
        </h1>

        <p className="text-indigo-300 font-semibold tracking-widest uppercase text-sm m-0">
          Spot it. Report it. Clean it.
        </p>

        <p className="text-slate-400 text-sm max-w-sm leading-relaxed m-0">
          Connect citizens, volunteers, and authorities to fight illegal garbage dumping — one pin at a time.
        </p>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="mt-4 flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-full text-base font-bold shadow-[0_8px_32px_rgba(99,102,241,0.55)] hover:shadow-[0_14px_40px_rgba(99,102,241,0.7)] hover:-translate-y-1 active:translate-y-0 transition-all duration-200 cursor-pointer border-0"
        >
          Get Started
          <span className="text-lg">→</span>
        </button>

        <p className="text-white/30 text-xs m-0">No sign-up required to explore the map</p>
      </div>
    </div>
  );
}
