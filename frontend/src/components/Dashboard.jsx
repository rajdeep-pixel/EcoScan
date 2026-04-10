import { Trash2 } from 'lucide-react';

export default function Dashboard({ reports }) {
  const total      = reports.length;
  const inProgress = reports.filter(r => r.status === 'in-progress').length;
  const cleaned    = reports.filter(r => r.status === 'cleaned').length;

  return (
    <header className="fixed top-0 left-[260px] right-0 z-[1000] flex items-center justify-between px-5 py-3
                       bg-[#0d1117] border-b border-white/[0.08] gap-4">
      {/* Brand */}
      <div className="flex items-center gap-2 font-black text-base tracking-tight flex-shrink-0">
        <Trash2 size={20} className="text-indigo-400" />
        <span className="text-indigo-400">Eco</span><span className="text-white">Scan</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2.5 flex-1 justify-end flex-wrap">
        <div className="flex items-center gap-2 bg-[#1f2937] border border-white/[0.08] rounded-xl px-3.5 py-1.5 text-[0.82rem] font-semibold whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-slate-400">Reported</span>
          <span className="text-[1.05rem] font-black text-white">{total}</span>
        </div>
        <div className="flex items-center gap-2 bg-[#1f2937] border border-white/[0.08] rounded-xl px-3.5 py-1.5 text-[0.82rem] font-semibold whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-orange-400" />
          <span className="text-slate-400">In Progress</span>
          <span className="text-[1.05rem] font-black text-white">{inProgress}</span>
        </div>
        <div className="flex items-center gap-2 bg-[#1f2937] border border-white/[0.08] rounded-xl px-3.5 py-1.5 text-[0.82rem] font-semibold whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-slate-400">Cleaned</span>
          <span className="text-[1.05rem] font-black text-white">{cleaned}</span>
        </div>
      </div>
    </header> );
}
