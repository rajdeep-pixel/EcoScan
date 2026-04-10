import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import { DEFAULT_CENTER, DEFAULT_ZOOM, SEVERITY_COLOR } from '../data/seedReports';

function MapClickCapture({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick && onMapClick(e.latlng) });
  return null;
}

export default function MapView({ reports, onClaimSpot, onMapClick, pickingLocation }) {
  return (
    <div className="fixed top-[58px] left-[260px] right-0 bottom-0 z-10">

      {/* Map click hint */}
      {pickingLocation && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1100]
                        bg-indigo-500/90 text-white text-[0.82rem] font-semibold
                        px-4 py-2 rounded-full pointer-events-none animate-pulse">
          📍 Click anywhere on the map to drop a pin
        </div>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickCapture onMapClick={onMapClick} />

        {reports.map(report => (
          <CircleMarker
            key={report.id}
            center={[report.lat, report.lng]}
            radius={report.severity === 'high' ? 14 : report.severity === 'medium' ? 11 : 9}
            pathOptions={{
              fillColor: SEVERITY_COLOR[report.severity],
              color: report.status === 'in-progress' ? '#f97316' : '#fff',
              weight: 2,
              fillOpacity: report.status === 'cleaned' ? 0.35 : 0.85,
              dashArray: report.status === 'in-progress' ? '4 4' : null,
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="font-bold text-[0.95rem] mb-1 text-slate-100">🗑️ {report.desc}</div>
                <div className="text-[0.78rem] text-slate-400 mb-2">
                  {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                </div>

                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.74rem] font-bold mb-2.5
                  ${report.severity === 'low'    ? 'bg-green-500/15 text-green-400'  : ''}
                  ${report.severity === 'medium' ? 'bg-orange-500/15 text-orange-400' : ''}
                  ${report.severity === 'high'   ? 'bg-red-500/15 text-red-400'      : ''}
                `}>
                  {report.severity.toUpperCase()}
                </span>

                {report.status === 'reported' && (
                  <button
                    onClick={() => onClaimSpot(report.id)}
                    className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-[0.85rem] rounded-lg cursor-pointer transition-colors border-0"
                  >
                    🙋 Claim for Cleanup
                  </button>
                )}
                {report.status === 'in-progress' && (
                  <div className="text-orange-400 text-[0.8rem] font-semibold">⚡ Volunteer On the Way</div>
                )}
                {report.status === 'cleaned' && (
                  <div className="text-green-400 text-[0.8rem] font-semibold">✅ Cleaned!</div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 z-[1000]
                      bg-[rgba(10,15,30,0.85)] backdrop-blur-md
                      border border-white/[0.08] rounded-xl px-3.5 py-2.5
                      flex flex-col gap-1.5 text-[0.78rem] text-slate-400">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-400" />Low</div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-400" />Medium</div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-400" />High</div>
      </div>
    </div>
  );
}
