import { useState, useEffect } from 'react';
import { MapPin, Loader, X } from 'lucide-react';

export default function ReportModal({ onClose, onSubmit, pinnedLocation, onStartPinning, mode = 'REPORT', reportId = null, t }) {
  const [severity, setSeverity]   = useState('medium');
  const [location, setLocation]   = useState(pinnedLocation || null);
  const [locStatus, setLocStatus] = useState(pinnedLocation ? 'ok' : 'idle');
  const [photo, setPhoto]         = useState(null);
  const [desc, setDesc]           = useState('');
  const [landmark, setLandmark]   = useState('');

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
    if (mode === 'REPORT' && !location) return;
    if (!photo) return;

    const payload = {
      severity,
      lat: location?.lat ?? null,
      lng: location?.lng ?? null,
      desc,
      landmark,
      mode,
      reportId
    };
    
    // Convert photo to base64 if it exists
    if (photo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSubmit({ 
          ...payload,
          photo: reader.result, 
        });
        onClose();
      };
      reader.readAsDataURL(photo);
    } else {
      onSubmit({ ...payload, photo: null });
      onClose();
    }
  }

  const severityConfig = {
    low:    { label: t.low,    active: 'border-emerald-600/50 text-emerald-400 bg-emerald-600/10' },
    medium: { label: t.medium, active: 'border-orange-400/50 text-orange-300 bg-orange-400/10' },
    high:   { label: t.high,   active: 'border-red-400/50 text-red-300 bg-red-400/10' },
  };

  const isProof = mode === 'PROOF';

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Glass modal */}
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl
                      bg-black/60 backdrop-blur-3xl backdrop-saturate-150
                      border border-white/[0.05]
                      shadow-[0_32px_64px_rgba(0,0,0,0.6)]
                      p-7 flex flex-col gap-5
                      animate-[slideUp_0.3s_ease]">

        {/* Header */}
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg text-white/90">
            {isProof ? t.uploadProof : t.reportWaste}
          </span>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1]
                       text-white/50 hover:text-white flex items-center justify-center
                       cursor-pointer transition-colors">
            <X size={16} />
          </button>
        </div>

        {!isProof && (
          <>
            {/* Severity */}
            <div>
              <div className="text-[0.72rem] font-semibold uppercase tracking-wider text-white/40 mb-2.5">{t.severity}</div>
              <div className="flex gap-2">
                {(['low', 'medium', 'high']).map(s => (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className={`flex-1 py-2.5 rounded-xl border font-bold text-[0.85rem] cursor-pointer transition-all
                      ${severity === s ? severityConfig[s].active : 'border-white/[0.08] text-white/30 bg-white/[0.04]'}`}
                  >
                    {severityConfig[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="text-[0.72rem] font-semibold uppercase tracking-wider text-white/40 mb-2.5">{t.locationRequired}</div>
              <div className={`flex items-center gap-2.5 bg-black/30 rounded-[1.5rem] px-5 py-3.5 border
                ${locStatus === 'ok'  ? 'border-emerald-500/40 text-emerald-400' :
                  locStatus === 'err' ? 'border-red-400/40 text-red-300'     :
                  'border-white/5 text-white/40'}`}
              >
                <MapPin size={15} />
                <span className="flex-1 text-[0.82rem]">
                  {locStatus === 'idle'    && t.noLocation}
                  {locStatus === 'loading' && t.gettingLocation}
                  {locStatus === 'ok'     && `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
                  {locStatus === 'err'    && t.gpsBlocked}
                </span>
                {locStatus === 'loading'
                  ? <Loader size={15} className="animate-spin" />
                  : <button onClick={handleGeolocate} disabled={locStatus === 'loading'}
                      className="bg-white/5 text-white/80 border border-white/5 rounded-xl px-4 py-2 text-[0.78rem] font-bold cursor-pointer whitespace-nowrap hover:bg-white/10 transition-colors disabled:opacity-50">
                      {t.useGps}
                    </button>
                }
              </div>

              <button
                onClick={() => { onStartPinning(); onClose(); }}
                className="mt-2 w-full bg-transparent border border-dashed border-white/[0.15] text-white/40 rounded-[1.5rem] py-3 text-[0.82rem] font-semibold cursor-pointer hover:bg-white/5 hover:text-white/60 transition-all"
              >
                {t.dropPin}
              </button>
            </div>

            {/* Description */}
            <div>
              <div className="text-[0.72rem] font-semibold uppercase tracking-wider text-white/40 mb-2.5">{t.description}</div>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder={t.placeholderDesc}
                rows={2}
                className="w-full bg-black/30 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white text-sm focus:outline-none focus:border-emerald-500/40 transition-all font-medium placeholder:text-white/40 resize-none font-[inherit]"
              />
            </div>

            {/* Landmark */}
            <div>
              <div className="text-[0.72rem] font-semibold uppercase tracking-wider text-white/40 mb-2.5">{t.landmarkLabel}</div>
              <input
                type="text"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                placeholder={t.landmarkPlaceholder}
                className="w-full bg-black/30 border border-white/5 rounded-[1.5rem] py-4 px-6 text-white text-sm focus:outline-none focus:border-emerald-500/40 transition-all font-medium placeholder:text-white/40 font-[inherit]"
              />
            </div>
          </>
        )}

        {/* Photo */}
        <div>
          <div className="text-[0.72rem] font-semibold uppercase tracking-wider text-white/40 mb-2.5">
          {isProof ? `${t.after} ${(t.photoOptional ?? '(optional)').replace('(', '').replace(')', '')}` : (t.photoOptional ?? '(optional)')}
          </div>
          <input
            type="file" accept="image/*" capture="environment"
            onChange={e => setPhoto(e.target.files[0])}
            className="w-full bg-black/30 border border-dashed border-white/10 rounded-[1.5rem] px-5 py-4 text-white/40 text-sm cursor-pointer
                       file:bg-white/5 file:text-white file:border file:border-white/10 file:rounded-xl file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-wider file:mr-4 file:cursor-pointer hover:file:bg-white/10 transition-all"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={(!isProof && locStatus !== 'ok') || !photo}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 px-6 rounded-[1.5rem] font-black tracking-widest uppercase text-sm cursor-pointer transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
        >
          {isProof 
            ? t.submitProof 
            : (locStatus !== 'ok' ? t.setLocFirst : t.submitReport)
          }
        </button>
      </div>
    </div>
  );
}
