import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;
const SEVERITY_COLOR = {
  low: '#059669',
  medium: '#ffcc00',
  high: '#ff0033',
};

function MapClickCapture({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick && onMapClick(e.latlng) });
  return null;
}

// Create a solid 'Gem' marker icon to fix drift issues & provide 'solid' feel
const createSolidIcon = (color, size, isCleaning) => {
  return L.divIcon({
    className: 'solid-marker-container',
    html: `
      <div class="solid-marker-inner ${isCleaning ? 'pulse' : ''}" 
           style="background-color: ${color}; width: ${size}px; height: ${size}px; color: ${color};">
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export default function MapView({ reports, onClaimSpot, onMapClick, pickingLocation, t, mapMode, currentUser }) {
  if (!t) return null; 

  const isSatellite = mapMode === 'satellite';
  
  const tileUrl = isSatellite
    ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
    : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

  const attribution = '&copy; <a href="https://www.google.com/mapmaker">Google</a>';

  const filterClass = isSatellite ? 'dark-map-filter' : 'street-map-filter';

  const mapCenter = reports?.length ? [reports[0].lat, reports[0].lng] : DEFAULT_CENTER;

  return (
    <div className={`relative w-full h-full transition-all duration-700 ${filterClass}`}>

      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution={attribution}
          url={tileUrl}
          key={mapMode} 
        />
        <MapClickCapture onMapClick={onMapClick} />

        {reports && Array.isArray(reports) && reports.map(report => {
          const isCleaned = report.status === 'cleaned';
          const isCleaning = report.status === 'in-progress';
          
          // Cleaned/Cleared spots turn Grey. Active ones use severity color.
          const markerColor = isCleaned ? '#64748b' : (SEVERITY_COLOR[report.severity] || '#94a3b8');
          
          const size = report.severity === 'high' ? 28 : report.severity === 'medium' ? 22 : 18;
          const icon = createSolidIcon(markerColor, size, isCleaning);

          return (
            <Marker
              key={report.id}
              position={[report.lat, report.lng]}
              icon={icon}
              opacity={isCleaned ? 0.7 : 1} // Higher opacity than before for 'solid' feel
            >
              <Popup className="custom-popup">
                <div className="min-w-[220px] max-w-[280px] p-1">
                  <div className="font-black text-[1rem] mb-1.5 text-white leading-tight">{report.desc}</div>
                  {report.landmark && (
                    <div className="flex items-center gap-1.5 mb-2 text-[0.75rem] font-bold text-emerald-600/80">
                      <span>📍</span>
                      <span>{report.landmark}</span>
                    </div>
                  )}
                  <div className="text-[0.72rem] text-slate-500 mb-3 font-bold">
                    {t.coord}: {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-block px-3 py-1 rounded-lg text-[0.68rem] font-black uppercase tracking-widest
                      ${report.severity === 'low'    ? 'bg-[#059669]/15 text-[#059669]'  : ''}
                      ${report.severity === 'medium' ? 'bg-[#ffcc00]/15 text-[#ffcc00]' : ''}
                      ${report.severity === 'high'   ? 'bg-[#ff0033]/15 text-[#ff0033]'      : ''}
                    `}>
                      {t[report.severity] || report.severity}
                    </span>
                    {isCleaned ? (
                      <span className="bg-emerald-600/15 text-emerald-500 px-3 py-1 rounded-lg text-[0.68rem] font-black uppercase tracking-widest">
                        {t.cleaned}
                      </span>
                    ) : report.status === 'pending-review' ? (
                      <span className="bg-blue-500/15 text-blue-400 px-3 py-1 rounded-lg text-[0.68rem] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                        {t.aiReview}
                      </span>
                    ) : null}
                  </div>

                  {/* Before/After Card - Shows if after photo exists regardless of official status */}
                  {report.after_image ? (
                    <div className="mb-4">
                      <div className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest mb-2.5">{t.compareImpact}</div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="flex flex-col gap-1.5">
                          <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black shadow-sm">
                            {report.before_image
                              ? <img src={report.before_image} alt="Before" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-white/20 text-[0.65rem] font-bold uppercase tracking-widest">{t.noPhoto}</div>
                            }
                          </div>
                          <span className="text-[0.62rem] text-slate-500 text-center font-black tracking-widest uppercase">{t.before}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="relative aspect-square rounded-xl overflow-hidden border border-emerald-600/30 shadow-[0_4px_15px_rgba(5,150,105,0.2)] bg-black">
                            {report.status === 'pending-review' && (
                                <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-1">
                                         <div className="w-6 h-6 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                                         <span className="text-[0.5rem] font-black text-emerald-600 uppercase tracking-widest">{t.verifying}</span>
                                    </div>
                                </div>
                            )}
                            <img src={report.after_image} alt="After" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[0.62rem] text-emerald-600 text-center font-black tracking-widest uppercase">{t.after}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 mb-4 bg-black shadow-md">
                      {report.before_image
                        ? <img src={report.before_image} alt="Before" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-white/20 text-[0.65rem] font-bold uppercase tracking-widest">{t.noPhotoUploaded}</div>
                      }
                    </div>
                  )}

                  {report.status === 'reported' && currentUser?.role === 'volunteer' && (
                    <button
                      onClick={() => onClaimSpot(report.id)}
                      className="w-full py-3 btn-green-gradient text-white font-black text-[0.8rem] rounded-xl cursor-pointer transition-all shadow-lg uppercase tracking-widest"
                    >
                      {t.claimForCleanup}
                    </button>
                  )}
                  {report.status === 'reported' && currentUser?.role !== 'volunteer' && (
                    <div className="text-[0.72rem] text-slate-500 font-bold uppercase tracking-widest text-center">
                      {t.volunteerOnlyAction}
                    </div>
                  )}
                  {report.status === 'in-progress' && (
                    <div className="flex flex-col gap-2.5">
                      <div className="text-[#ffcc00] text-[0.75rem] font-bold uppercase tracking-widest text-center">{t.volunteerOnWay}</div>
                      {currentUser?.role === 'volunteer' && (
                          <button
                            onClick={() => onClaimSpot(report.id, true)} 
                            className="w-full py-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-600/30 font-black text-[0.8rem] rounded-xl cursor-pointer transition-all uppercase tracking-widest"
                          >
                            {t.submitProof}
                          </button>
                      )}
                    </div>
                  )}
                  {report.status === 'pending-review' && (
                    <div className="mt-3 pt-3 border-t border-white/5 text-[0.72rem] text-blue-300">
                      {report.verification_summary || t.pendingReview}
                    </div>
                  )}
                  {report.status === 'verification-failed' && (
                    <div className="mt-3 pt-3 border-t border-white/5 text-[0.72rem] text-red-300">
                      {report.verification_summary || t.verificationFailed}
                    </div>
                  )}
                  {isCleaned && report.volunteer_name && (
                    <div className="mt-3 pt-3 border-t border-white/5 text-[0.7rem] text-slate-500 flex justify-between items-center px-1">
                      <span className="font-bold italic">{t.cleanedBy} {report.volunteer_name}</span>
                      <span className="font-black text-emerald-600 text-[0.85rem]">+{report.severity === 'high' ? 50 : report.severity === 'medium' ? 25 : 10} {t.points}</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-28 right-6 z-[1000]
                      bg-black/95 backdrop-blur-md
                      border border-white/[0.08] rounded-2xl px-5 py-4
                      flex flex-col gap-3 text-[0.8rem] text-white/90 shadow-2xl font-black uppercase tracking-widest">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-white bg-[#059669] shadow-[0_0_10px_#059669]" />
          {t.low}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-white bg-[#ffcc00] shadow-[0_0_10px_#ffcc00]" />
          {t.medium}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-white bg-[#ff0033] shadow-[0_0_10px_#ff0033]" />
          {t.high}
        </div>
        <div className="pt-2 mt-1 border-t border-white/[0.05] flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-white bg-[#64748b] shadow-[0_0_10px_#64748b]" />
          {t.cleaned}
        </div>
      </div>
    </div>
  );
}
