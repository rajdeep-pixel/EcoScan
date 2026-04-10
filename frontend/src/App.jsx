import { useState } from 'react';
import { Plus } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import ReportModal from './components/ReportModal';
import { SEED_REPORTS } from './data/seedReports';
import './index.css';

let nextId = SEED_REPORTS.length + 1;

export default function App() {
  const [reports, setReports]         = useState(SEED_REPORTS);
  const [showModal, setShowModal]     = useState(false);
  const [pickingLocation, setPickingLocation] = useState(false);
  const [pinnedLocation, setPinnedLocation]   = useState(null);

  // ── Volunteer claims a spot ──
  function handleClaimSpot(id) {
    setReports(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'in-progress' } : r)
    );
  }

  // ── Someone submits a new report ──
  function handleNewReport({ severity, lat, lng, photo, desc }) {
    const newReport = {
      id: nextId++,
      lat, lng, severity,
      status: 'reported',
      desc: desc || 'New waste spot reported',
      photo,
    };
    setReports(prev => [...prev, newReport]);
    setPickingLocation(false);
    setPinnedLocation(null);
  }

  // ── Map click while picking location ──
  function handleMapClick(latlng) {
    if (!pickingLocation) return;
    setPinnedLocation({ lat: latlng.lat, lng: latlng.lng });
    setPickingLocation(false);
    setShowModal(true);
  }

  // ── User taps "Drop pin on map" inside modal ──
  function handleStartPinning() {
    setPinnedLocation(null);
    setPickingLocation(true);
    setShowModal(false);
  }

  return (
    <>
      <Dashboard reports={reports} />

      <MapView
        reports={reports}
        onClaimSpot={handleClaimSpot}
        onMapClick={handleMapClick}
        pickingLocation={pickingLocation}
      />

      {/* FAB */}
      <button
        className="fab"
        onClick={() => { setShowModal(true); setPickingLocation(false); }}
        title="Report a waste spot"
      >
        <Plus size={28} />
      </button>

      {/* Report Modal */}
      {showModal && (
        <ReportModal
          onClose={() => setShowModal(false)}
          onSubmit={handleNewReport}
          pinnedLocation={pinnedLocation}
          onStartPinning={handleStartPinning}
        />
      )}
    </>
  );
}