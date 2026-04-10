import { useState, useEffect } from 'react';
import { MapPin, Loader } from 'lucide-react';

export default function ReportModal({ onClose, onSubmit, pinnedLocation, onStartPinning }) {
  const [severity, setSeverity]   = useState('medium');
  const [location, setLocation]   = useState(pinnedLocation || null);
  const [locStatus, setLocStatus] = useState(pinnedLocation ? 'ok' : 'idle');
  const [photo, setPhoto]         = useState(null);
  const [desc, setDesc]           = useState('');

  useEffect(() => {
    if (pinnedLocation) { setLocation(pinnedLocation); setLocStatus('ok'); }
  }, [pinnedLocation]);

  function handleGeolocate() {
    setLocStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocStatus('ok'); },
      () => setLocStatus('err'),
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  function handleSubmit() {
    if (!location) return;
    onSubmit({ severity, lat: location.lat, lng: location.lng, photo, desc });
    onClose();
  }

  const severityConfig = {
    low:    { emoji: '🟢', active: 'border-green-500 text-green-400 bg-green-500/10' },
    medium: { emoji: '🟠', active: 'border-orange-500 text-orange-400 bg-orange-500/10' },
    high:   { emoji: '🔴', active: 'border-red-500 text-red-400 bg-red-500/10' },
  };

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#111827] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 sm:p-7
                      flex flex-col gap-5 animate-[slideUp_0.25s_ease]">

        {/* Header */}
        <div className="flex justify-between items-center">
          <span className="font-bold text-[1.1rem] text-slate-100">🗑️ Report a Waste Spot</span>
          <button onClick={onClose} className="bg-[#1f2937] text-slate-400 hover:text-slate-200 border-0 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors text-sm">
            ✕
          </button>
        </div>

        {/* Severity */}
        <div>
          <div className="text-[0.75rem] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Severity</div>
          <div className="flex gap-2">
            {(['low', 'medium', 'high']).map(s => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-[0.85rem] cursor-pointer transition-all
                  ${severity === s ? severityConfig[s].active : 'border-white/[0.08] text-slate-500 bg-[#1f2937]'}`}
              >
                {severityConfig[s].emoji} {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="text-[0.75rem] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Location (required)</div>
          <div className={`flex items-center gap-2.5 bg-[#1f2937] rounded-xl px-3.5 py-2.5 border
            ${locStatus === 'ok'  ? 'border-green-500/60 text-green-400' :
              locStatus === 'err' ? 'border-red-500/60 text-red-400'     :
              'border-white/[0.08] text-slate-400'}`}
          >
            <MapPin size={15} />
            <span className="flex-1 text-[0.82rem]">
              {locStatus === 'idle'    && 'No location — use GPS or click the map'}
              {locStatus === 'loading' && 'Getting location…'}
              {locStatus === 'ok'     && `📍 ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
              {locStatus === 'err'    && 'GPS blocked — drop a pin on the map'}
            </span>
            {locStatus === 'loading'
              ? <Loader size={15} className="animate-spin" />
              : <button onClick={handleGeolocate} disabled={locStatus === 'loading'}
                  className="bg-indigo-500 text-white border-0 rounded-lg px-3 py-1.5 text-[0.78rem] font-bold cursor-pointer whitespace-nowrap hover:bg-indigo-600 transition-colors disabled:opacity-50">
                  Use GPS
                </button>
            }
          </div>

          <button
            onClick={() => { onStartPinning(); onClose(); }}
            className="mt-2 w-full bg-transparent border border-dashed border-indigo-500/60 text-indigo-400 rounded-xl py-2 text-[0.82rem] font-semibold cursor-pointer hover:bg-indigo-500/10 transition-colors"
          >
            📌 Drop pin on map instead
          </button>
        </div>

        {/* Description */}
        <div>
          <div className="text-[0.75rem] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Brief description</div>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="e.g. Overflowing dumpster near bus stop…"
            rows={2}
            className="w-full bg-[#1f2937] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-slate-200 text-[0.88rem] resize-none font-[inherit] focus:outline-none focus:border-indigo-500/60"
          />
        </div>

        {/* Photo */}
        <div>
          <div className="text-[0.75rem] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Photo (optional)</div>
          <input
            type="file" accept="image/*" capture="environment"
            onChange={e => setPhoto(e.target.files[0])}
            className="w-full bg-[#1f2937] border-2 border-dashed border-white/[0.08] rounded-xl px-3.5 py-3 text-slate-400 text-[0.85rem] cursor-pointer
                       file:bg-indigo-500 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1.5 file:text-[0.8rem] file:font-bold file:mr-3 file:cursor-pointer"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={locStatus !== 'ok'}
          className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed
                     text-white font-bold text-base rounded-xl border-0 cursor-pointer transition-all hover:-translate-y-0.5"
        >
          {locStatus !== 'ok' ? 'Set a location first' : '📤 Submit Report'}
        </button>
      </div>
    </div>
  );
}
