import ecoscanTitle from '../assets/ecoscan_title.png';
import { Menu, Map, Globe } from 'lucide-react';

export default function Dashboard({ reports, t, lang, setLang, onToggleSidebar, mapMode, setMapMode, userName }) {
  const reported   = reports.filter(r => r.status === 'reported' || r.status === 'verification-failed').length;
  const inProgress = reports.filter(r => r.status === 'in-progress').length;
  const cleaned    = reports.filter(r => r.status === 'cleaned').length;

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] flex items-center px-4 sm:px-6 py-4 sm:py-3
                       bg-black border-b border-white/[0.08] transition-all duration-300 shadow-2xl">
      
      <div className="flex items-center gap-4 group flex-shrink-0">
        <button onClick={onToggleSidebar} className="sm:hidden w-10 h-10 flex items-center justify-center text-emerald-500 hover:text-white cursor-pointer transition-colors bg-white/5 rounded-xl mr-2">
          <Menu size={24} />
        </button>
        <img src={ecoscanTitle} alt="EcoScan Logo" className="h-10 sm:h-12 lg:h-[4rem] w-auto object-contain transition-transform group-hover:scale-[1.03] origin-left" />
      </div>

      <div className="flex-1 flex justify-center lg:justify-center items-center gap-4 sm:gap-8 pl-2 sm:pl-12">
          <div className="flex gap-2 mr-2 sm:mr-4">
            <button
              onClick={() => setMapMode('street')}
              className={`w-10 h-10 sm:w-10 sm:h-10 rounded-[1rem] sm:rounded-[1rem] flex items-center justify-center transition-all cursor-pointer border-0
                ${mapMode === 'street' ? 'bg-emerald-500 text-white shadow-[0_5px_15px_rgba(16,185,129,0.3)] hover:-translate-y-0.5' : 'bg-transparent text-white/30 hover:text-white/60 hover:bg-white/5'}`}
              title={t.streetView}
            >
              <Map size={18} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`w-10 h-10 sm:w-10 sm:h-10 rounded-[1rem] sm:rounded-[1rem] flex items-center justify-center transition-all cursor-pointer border-0
                ${mapMode === 'satellite' ? 'bg-emerald-500 text-white shadow-[0_5px_15px_rgba(16,185,129,0.3)] hover:-translate-y-0.5' : 'bg-transparent text-white/30 hover:text-white/60 hover:bg-white/5'}`}
              title={t.satelliteView}
            >
              <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          <div className="flex gap-4">
            {[
              { id: 'en', label: t.langEn },
              { id: 'hi', label: t.langHi }
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[0.65rem] sm:text-[0.7rem] font-black transition-all cursor-pointer border-0 tracking-widest uppercase
                  ${lang === l.id ? 'text-emerald-600 scale-110' : 'text-white/50 hover:text-white/80'}`}
              >
                {l.id === 'en' ? 'ENG' : 'हिन्दी'}
              </button>
            ))}
          </div>
      </div>

      <div className="flex items-center gap-10 flex-shrink-0">
        <div className="hidden lg:flex items-center gap-8 transition-all">
          {[
            { id: 'reported',   label: t.reported,   count: reported,   color: null },
            { id: 'inProgress', label: t.inProgress, count: inProgress, color: 'bg-yellow-500 shadow-[0_0_12px_#eab308] animate-pulse' },
            { id: 'cleaned',    label: t.cleaned,    count: cleaned,    color: 'bg-slate-500 shadow-[0_0_10px_#64748b]' }
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3 transition-all">
              {stat.color && (
                <div className={`w-3.5 h-3.5 rounded-full ${stat.color} transition-all duration-500`} />
              )}
              <div className="flex items-center gap-2">
                <span className="text-[0.75rem] font-black uppercase tracking-[0.15em] text-white/80">
                  {stat.label}
                </span>
                <span className="text-[1.3rem] font-black leading-none text-white tracking-tighter opacity-100">
                  {stat.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
