import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import { DEFAULT_CENTER, DEFAULT_ZOOM, SEVERITY_COLOR } from '../data/seedReports';

// Captures map clicks and passes them up so the Report modal can use them
function MapClickCapture({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick && onMapClick(e.latlng) });
  return null;
}

export default function MapView({ reports, onClaimSpot, onMapClick, pickingLocation }) {
  return (
    <div className="map-container">
      {pickingLocation && (
        <div className="map-hint">📍 Click anywhere on the map to drop a pin</div>
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
              weight: report.status === 'cleaned' ? 3 : 2,
              fillOpacity: report.status === 'cleaned' ? 0.4 : 0.85,
              dashArray: report.status === 'in-progress' ? '4 4' : null,
            }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div className="popup-title">🗑️ {report.desc}</div>
                <div className="popup-meta">
                  {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                </div>
                <span className={`popup-badge ${report.severity}`}>
                  {report.severity.toUpperCase()}
                </span>

                {report.status === 'reported' && (
                  <button
                    className="claim-btn"
                    onClick={() => onClaimSpot(report.id)}
                  >
                    🙋 Claim for Cleanup
                  </button>
                )}
                {report.status === 'in-progress' && (
                  <div className="status-inprogress">⚡ Volunteer On the Way</div>
                )}
                {report.status === 'cleaned' && (
                  <div className="status-cleaned">✅ Cleaned!</div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item"><div className="legend-dot" style={{ background: '#22c55e' }} />Low</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#f97316' }} />Medium</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#ef4444' }} />High</div>
      </div>
    </div>
  );
}
