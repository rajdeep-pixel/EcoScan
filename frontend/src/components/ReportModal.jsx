import { useState, useEffect } from 'react';
import { MapPin, Loader } from 'lucide-react';

export default function ReportModal({ onClose, onSubmit, pinnedLocation, onStartPinning }) {
  const [severity, setSeverity]   = useState('medium');
  const [location, setLocation]   = useState(pinnedLocation || null); // { lat, lng }
  const [locStatus, setLocStatus] = useState(pinnedLocation ? 'ok' : 'idle'); // idle | loading | ok | err
  const [photo, setPhoto]         = useState(null);
  const [desc, setDesc]           = useState('');

  // Sync when parent drops a pin on the map
  useEffect(() => {
    if (pinnedLocation) {
      setLocation(pinnedLocation);
      setLocStatus('ok');
    }
  }, [pinnedLocation]);

  function handleGeolocate() {
    setLocStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus('ok');
      },
      () => setLocStatus('err'),
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  function handleSubmit() {
    if (!location) return;
    onSubmit({ severity, lat: location.lat, lng: location.lng, photo, desc });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div className="modal__header">
          <span className="modal__title">🗑️ Report a Waste Spot</span>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Severity */}
        <div>
          <div className="modal__label">Severity</div>
          <div className="severity-group">
            {['low', 'medium', 'high'].map(s => (
              <button
                key={s}
                className={`severity-btn ${severity === s ? `active-${s}` : ''}`}
                onClick={() => setSeverity(s)}
              >
                {s === 'low' ? '🟢' : s === 'medium' ? '🟠' : '🔴'} {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Location — CONSTRAINT 1 compliant: no text input, only GPS or map-click */}
        <div>
          <div className="modal__label">Location (required)</div>
          <div className={`location-row ${locStatus === 'ok' ? 'ok' : locStatus === 'err' ? 'err' : ''}`}>
            <MapPin size={16} />
            <span style={{ flex: 1, fontSize: '0.82rem' }}>
              {locStatus === 'idle'    && 'No location set — use GPS or click the map'}
              {locStatus === 'loading' && 'Getting location…'}
              {locStatus === 'ok'     && `📍 ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
              {locStatus === 'err'    && 'GPS blocked — please click the map to drop a pin'}
            </span>
            {locStatus === 'loading'
              ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              : <button className="location-btn" onClick={handleGeolocate} disabled={locStatus === 'loading'}>
                  Use GPS
                </button>
            }
          </div>

          {/* Map pin option */}
          <button
            onClick={() => { onStartPinning(); onClose(); }}
            style={{
              marginTop: 8, width: '100%', background: 'transparent', border: '1px dashed #6366f1',
              color: '#6366f1', borderRadius: 8, padding: '7px 0', fontSize: '0.82rem',
              fontWeight: 600, cursor: 'pointer'
            }}
          >
            📌 Drop pin on map instead
          </button>
        </div>

        {/* Description */}
        <div>
          <div className="modal__label">Brief description</div>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="e.g. Overflowing dumpster near bus stop…"
            rows={2}
            style={{
              width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontSize: '0.88rem',
              resize: 'none', fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Photo */}
        <div>
          <div className="modal__label">Photo (optional)</div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="photo-input"
            onChange={e => setPhoto(e.target.files[0])}
          />
        </div>

        {/* Submit */}
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={locStatus !== 'ok'}
        >
          {locStatus !== 'ok' ? 'Set a location first' : '📤 Submit Report'}
        </button>
      </div>
    </div>
  );
}
