import { useState, useEffect } from 'react';
import { X, Trophy, Medal, Star, Loader2 } from 'lucide-react';
import { fetchLeaderboard } from '../api/reports';

export default function Leaderboard({ onClose, t, theme }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRanking() {
      try {
        const data = await fetchLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    getRanking();
  }, []);

  const colors = ['bg-emerald-700', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-rose-500'];

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-md flex items-center justify-center p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-[2.5rem]
                      bg-[var(--bg-main)] backdrop-blur-3xl
                      border border-white/[0.12]
                      shadow-[0_40px_100px_rgba(0,0,0,0.6)]
                      p-8 flex flex-col gap-7
                      animate-[slideUp_0.4s_cubic-bezier(0.2,0.8,0.2,1)]">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl btn-green-gradient flex items-center justify-center text-white shadow-lg rotate-3">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[var(--text-main)] m-0 tracking-tighter">{t.leaderboard}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[0.72rem] text-slate-500 font-bold uppercase tracking-[0.15em] m-0">{t.topContributors}</p>
                <span className="flex items-center gap-1 bg-red-500/15 border border-red-500/30 rounded-full px-2 py-0.5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[0.6rem] font-black text-red-400 uppercase tracking-widest">{t.live}</span>
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/[0.1]
                       text-white/50 hover:text-white flex items-center justify-center
                       cursor-pointer transition-all hover:rotate-90">
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4 min-h-[350px] max-h-[450px] overflow-y-auto pr-2 no-scrollbar">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-emerald-600 gap-4 opacity-60">
              <Loader2 size={42} className="animate-spin" />
              <span className="text-sm font-black uppercase tracking-widest">{t.calculatingRankings}</span>
            </div>
          ) : leaderboard.length > 0 ? (
            leaderboard.map((v, i) => {
              const rankIcon = i === 0 ? <Trophy size={16} className="text-yellow-400" /> :
                             i === 1 ? <Medal size={16} className="text-slate-300" /> :
                             i === 2 ? <Star size={16} className="text-orange-400" /> : null;
              
              const profileColor = colors[v.name.length % colors.length];
              const initials = v.name.split(' ').map(n => n[0]).join('').toUpperCase();

              return (
                <div key={v.name} className="flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded-3xl p-5 transition-all hover:bg-white/[0.08] hover:translate-x-1 group">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md ${profileColor} border border-white/10`}>
                        {initials}
                      </div>
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[var(--bg-main)] shadow-sm
                        ${i === 0 ? 'bg-yellow-500' : 
                          i === 1 ? 'bg-slate-400' :
                          i === 2 ? 'bg-orange-500' :
                          'bg-white/10'}`}>
                        {rankIcon || <span className="text-[10px] font-black text-white">{i + 1}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[1.05rem] font-black text-[var(--text-main)] group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{v.name}</span>
                      <span className="text-[0.7rem] text-slate-500 font-bold uppercase tracking-wider">
                        {v.cleanups} {t.cleaned}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[1.5rem] font-black text-emerald-600 tracking-tighter leading-none">{v.score}</span>
                    <span className="text-[0.6rem] text-slate-600 font-black uppercase tracking-[0.2em]">{t.points}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-700 gap-4 opacity-20">
              <Trophy size={64} strokeWidth={1} />
              <span className="text-sm font-black uppercase tracking-widest">{t.noCleanups}</span>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/[0.06] text-center">
          <p className="text-[0.68rem] text-slate-500 font-bold uppercase tracking-wider italic">
            {t.scoringInfo}
          </p>
        </div>
      </div>
    </div>
  );
}
