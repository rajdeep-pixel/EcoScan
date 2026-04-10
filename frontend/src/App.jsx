import { useState } from 'react';
import { Plus } from 'lucide-react';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import ReportModal from './components/ReportModal';
import { SEED_REPORTS } from './data/seedReports';
import './index.css';

let nextId = SEED_REPORTS.length + 1;

export default function App() {
  const [started, setStarted]                 = useState(false);
  const [reports, setReports]                 = useState(SEED_REPORTS);
  const [showModal, setShowModal]             = useState(false);
  const [pickingLocation, setPickingLocation] = useState(false);
  const [pinnedLocation, setPinnedLocation]   = useState(null);

  function handleClaimSpot(id) {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'in-progress' } : r));
  }

  function handleNewReport({ severity, lat, lng, photo, desc }) {
    setReports(prev => [...prev, {
      id: nextId++, lat, lng, severity,
      status: 'reported',
      desc: desc || 'New waste spot reported',
      photo,
    }]);
    setPickingLocation(false);
    setPinnedLocation(null);
  }

  function handleMapClick(latlng) {
    if (!pickingLocation) return;
    setPinnedLocation({ lat: latlng.lat, lng: latlng.lng });
    setPickingLocation(false);
    setShowModal(true);
  }

  function handleStartPinning() {
    setPinnedLocation(null);
    setPickingLocation(true);
    setShowModal(false);
  }

  if (!started) return <LandingPage onGetStarted={() => setStarted(true)} />;

  return (
    <>
      <Sidebar onLogout={() => setStarted(false)} />
      <Dashboard reports={reports} />
      <MapView
        reports={reports}
        onClaimSpot={handleClaimSpot}
        onMapClick={handleMapClick}
        pickingLocation={pickingLocation}
      />

      {/* FAB */}
      <button
        onClick={() => { setShowModal(true); setPickingLocation(false); }}
        className="fixed bottom-7 right-6 z-[1000] w-14 h-14 rounded-full bg-indigo-500
                   text-white border-0 flex items-center justify-center cursor-pointer
                   shadow-[0_8px_30px_rgba(99,102,241,0.5)] hover:scale-105
                   hover:shadow-[0_12px_40px_rgba(99,102,241,0.7)] active:scale-95 transition-all"
        title="Report a waste spot"
      >
        <Plus size={28} />
      </button>

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