import { LogOut, MapPin, User, Clock, ChevronRight, ChevronLeft, Trophy } from 'lucide-react';

const severityStyles = {
  low:    'bg-emerald-600/15 text-emerald-600',
  medium: 'bg-[#ffcc00]/15 text-[#ffcc00]',
  high:   'bg-[#ff0033]/15 text-[#ff0033]',
};

export default function Sidebar({ isOpen, onToggle, onLogout, reports = [], t, onOpenLeaderboard, currentUser }) {
  const userName = currentUser?.name || '';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const myReportsArray = reports.filter(r => r.reporter_name === userName);
  const myCleanedArray = reports.filter(r => r.volunteer_name === userName && r.status === 'cleaned');
  
  const myReports = currentUser?.reports ?? myReportsArray.length;
  const myCleaned = currentUser?.cleanups ?? myCleanedArray.length;

  const total = reports.length;
  const inProgress = reports.filter(r => r.status === 'in-progress').length;
  const globalCleaned = reports.filter(r => r.status === 'cleaned').length;

  const lastUserReport = [...myReportsArray].sort((a, b) => b.id - a.id)[0] || null;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[850] bg-black/60 backdrop-blur-md sm:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-[72px] sm:top-[72px] lg:top-[88px] left-0 bottom-0 z-[900] flex flex-col
                    bg-black border-r border-white/[0.08]
                    transition-all duration-300 ease-in-out
                    ${isOpen 
                      ? 'w-[75%] sm:w-[312px] px-4 sm:px-6 py-4 sm:py-5 translate-x-0' 
                      : 'w-0 sm:w-[67px] px-0 sm:px-0 py-4 sm:py-5 items-center -translate-x-full sm:translate-x-0 overflow-hidden'
                    }`}
      >

        <button
          onClick={onToggle}
          className={`hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-[50%] z-20 w-8 h-8 rounded-full bg-emerald-500
                     text-white shadow-xl items-center justify-center border-0
                     cursor-pointer transition-all hover:scale-110 active:scale-95
                     ${!isOpen && 'right-[33px] translate-x-0'}`}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className={`flex items-center gap-4 pb-6 transition-all duration-300 ${isOpen ? '' : 'sm:justify-center'} ${!isOpen && 'hidden sm:flex'}`}>
          <div className="relative w-12 h-12 flex-shrink-0 rounded-[1.25rem] overflow-hidden border border-white/10 shadow-[0_5px_15px_rgba(16,185,129,0.3)] bg-emerald-500 flex items-center justify-center text-white font-black">
            {initials || 'U'}
          </div>

          {(isOpen) && (
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-black text-[1.1rem] text-white truncate tracking-tight">{userName}</span>
              <span className="flex items-center gap-1.5 text-[0.7rem] text-slate-500 font-black uppercase tracking-[0.2em]">
                {currentUser?.role || t.citizen}
              </span>
            </div>
          )}
        </div>

        <div className={`flex-1 overflow-y-auto no-scrollbar transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {isOpen && (
            <div className="flex flex-col h-full">
              <div className="h-px bg-white/[0.08] my-2 mb-5 sm:mb-8" />

              <div className="mb-5 sm:mb-8 pl-1">
                <div className="flex items-center gap-2.5 text-[0.72rem] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                  <Clock size={13} strokeWidth={3} /> {t.lastReported}
                </div>
                {lastUserReport ? (
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-4 sm:p-5 flex flex-col gap-2.5 shadow-inner">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#ffcc00]" />
                      <span className={`text-[0.68rem] font-black px-3 py-1 rounded-xl uppercase tracking-widest ${severityStyles[lastUserReport.severity]}`}>
                        {t[lastUserReport.severity]}
                      </span>
                    </div>
                    <p className="text-[0.88rem] text-white/80 leading-relaxed m-0 font-bold">
                      {lastUserReport.desc}
                    </p>
                    <span className="text-[0.68rem] text-slate-600 font-bold flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> {t.justNow}
                    </span>
                  </div>
                ) : (
                  <div className="text-[0.75rem] text-slate-600 font-bold italic px-2">{t.noReportsYet}</div>
                )}
              </div>

              <button
                onClick={onOpenLeaderboard}
                className="mb-5 sm:mb-8 flex items-center gap-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.5rem] p-4 sm:p-5 transition-all group cursor-pointer border-0 shadow-[0_10px_30px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:translate-y-0"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-inner">
                  <Trophy size={20} />
                </div>
                <div className="flex flex-col items-start translate-y-0.5">
                  <span className="text-[0.95rem] font-black text-white leading-none uppercase tracking-tighter">{t.leaderboard}</span>
                  <span className="text-[0.6rem] text-white/60 font-black uppercase tracking-[0.2em] mt-1">{t.rankingsAndAwards}</span>
                </div>
              </button>

              <div className="h-px bg-white/[0.08] mb-5 sm:mb-8" />

              <div className="mb-5 sm:mb-8 pr-1 pl-1">
                <div className="text-[0.72rem] font-black uppercase tracking-[0.2em] text-slate-500 mb-5">
                  {t.yourImpact}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-4 sm:p-5 flex flex-col gap-1.5 shadow-sm transition-all hover:bg-white/[0.04] hover:-translate-y-1">
                    <span className="text-[1.8rem] sm:text-[2.2rem] font-black text-emerald-600 leading-none tracking-tighter">{myReports}</span>
                    <span className="text-[0.6rem] sm:text-[0.68rem] text-slate-500 font-black uppercase tracking-widest">{t.reported}</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-4 sm:p-5 flex flex-col gap-1.5 shadow-sm transition-all hover:bg-white/[0.04] hover:-translate-y-1">
                    <span className="text-[1.8rem] sm:text-[2.2rem] font-black text-emerald-600 leading-none tracking-tighter">{myCleaned}</span>
                    <span className="text-[0.6rem] sm:text-[0.68rem] text-slate-500 font-black uppercase tracking-widest">{t.cleaned}</span>
                  </div>
                </div>
              </div>

              {/* Mobile Only Global Stats */}
              <div className="mb-8 pr-1 pl-1 lg:hidden">
                <div className="text-[0.72rem] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 border-t border-white/[0.08] pt-6">
                  {t.globalImpact || 'Global Impact'}
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: t.reported || 'Reported', count: total, color: 'bg-white/20' },
                    { label: t.inProgress || 'In-Progress', count: inProgress, color: 'bg-yellow-500 shadow-[0_0_10px_#eab308]' },
                    { label: t.cleaned || 'Cleaned', count: globalCleaned, color: 'bg-slate-500 shadow-[0_0_10px_#64748b]' }
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 shadow-sm">
                       <div className="flex items-center gap-2.5">
                         <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                         <span className="text-[0.68rem] font-black uppercase tracking-[0.15em] text-white/80">{stat.label}</span>
                       </div>
                       <span className="text-[1.3rem] font-black leading-none text-white">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className={`mt-auto flex items-center gap-3 px-5 py-3.5 sm:py-4
                     bg-red-500/[0.05] border border-red-500/10 text-red-500
                     rounded-[1.5rem] text-[0.85rem] font-black uppercase tracking-[0.2em] cursor-pointer
                     hover:bg-red-500/10 hover:border-red-500/20 transition-all shadow-sm mb-6 sm:mb-2
                     ${isOpen ? 'w-full' : 'w-12 h-12 justify-center px-0'}
                     ${!isOpen && 'hidden sm:flex'}`}
        >
          <User size={18} />
          {isOpen && <span>{t.logOut}</span>}
        </button>
      </aside>
    </>
  );
}
