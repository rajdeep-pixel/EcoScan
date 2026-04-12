import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import ReportModal from './components/ReportModal';
import Leaderboard from './components/Leaderboard';
import { translations } from './i18n/translations';
import { Plus } from 'lucide-react';
import { fetchCurrentUser, loginUser, registerUser } from './api/auth';
import { fetchReports, createReport, claimReport, submitCleanup } from './api/reports';
import './index.css';

export default function App() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ecoscan_session')) || null;
    } catch {
      return null;
    }
  });
  const [lang, setLang] = useState(localStorage.getItem('ecoScanLang') || 'en');
  const [reports, setReports] = useState([]);
  const [pickingLocation, setPickingLocation] = useState(false);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('REPORT');
  const [activeReportId, setActiveReportId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [mapMode, setMapMode] = useState(localStorage.getItem('ecoScanMapMode') || 'street');

  const t = { ...translations.en, ...(translations[lang] || {}) };

  useEffect(() => {
    localStorage.setItem('ecoScanLang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('ecoScanMapMode', mapMode);
  }, [mapMode]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!session?.token) {
      setReports([]);
      return;
    }
    loadReports();
  }, [session?.token]);

  useEffect(() => {
    if (!session?.token) return;

    let ignore = false;
    async function syncSession() {
      try {
        const { user } = await fetchCurrentUser(session.token);
        if (!ignore) {
          const nextSession = { ...session, user };
          setSession(nextSession);
          localStorage.setItem('ecoscan_session', JSON.stringify(nextSession));
        }
      } catch (error) {
        if (!ignore) {
          localStorage.removeItem('ecoscan_session');
          setSession(null);
        }
      }
    }

    syncSession();
    return () => {
      ignore = true;
    };
  }, [session?.token]);

  async function loadReports() {
    setLoading(true);
    try {
      const data = await fetchReports();
      setReports(data || []);
    } catch (err) {
      console.warn('Failed to load reports:', err.message);
      setReports([]);
    }
    setLoading(false);
  }

  async function handleAuthenticate(credentials) {
    setAuthLoading(true);
    try {
      const response = credentials.mode === 'register'
        ? await registerUser(credentials)
        : await loginUser(credentials);

      const nextSession = {
        token: response.token,
        user: response.user,
      };
      localStorage.setItem('ecoscan_session', JSON.stringify(nextSession));
      setSession(nextSession);
    } catch (error) {
      alert(error?.response?.data?.detail || t.authFailed);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleClaimSpot(id, openProof = false) {
    if (session?.user?.role !== 'volunteer') {
      alert(t.volunteerOnlyAction);
      return;
    }

    if (openProof) {
      setActiveReportId(id);
      setModalMode('PROOF');
      setShowModal(true);
      return;
    }

    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'in-progress', volunteer_name: session.user.name } : r));
    try { 
      await claimReport(id); 
      await loadReports();
    } catch (err) { 
      console.warn('Claim failed:', err.message); 
    }
  }

  async function handleNewReport({ severity, lat, lng, photo, desc, landmark, mode, reportId }) {
    if (mode === 'PROOF') {
      try {
        await submitCleanup(reportId, photo);
        await loadReports(); 
      } catch (err) {
        alert(err?.response?.data?.detail || t.cleanupFailed);
      }
      return;
    }

    try {
      const newReport = await createReport({ 
        lat, lng, severity, desc, landmark,
        imageData: photo,
      });
      setReports(prev => [...prev, newReport]);
      await loadReports();
    } catch (err) {
      alert(err?.response?.data?.detail || t.reportFailed);
    }
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

  function handleOpenReportModal() {
    setModalMode('REPORT');
    setPickingLocation(false);
    setShowModal(true);
  }

  if (!session?.token) {
    return <LandingPage onAuthenticate={handleAuthenticate} t={t} lang={lang} setLang={setLang} loading={authLoading} />;
  }

  const sidebarWidth = isSidebarOpen ? 312 : 67;

  return (
    <div>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        onLogout={() => {
          localStorage.removeItem('ecoscan_session');
          setSession(null);
        }}
        reports={reports}
        t={t}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        currentUser={session.user}
      />
      <Dashboard
        reports={reports}
        t={t}
        lang={lang}
        setLang={setLang}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        mapMode={mapMode}
        setMapMode={setMapMode}
        userName={session.user?.name}
      />

      <div
        className="fixed top-[92px] bottom-0 right-0 z-10 transition-all duration-300"
        style={{ left: (isMobile || !isSidebarOpen) ? 0 : sidebarWidth }}
      >
        <MapView
          reports={reports}
          onClaimSpot={handleClaimSpot}
          onMapClick={handleMapClick}
          pickingLocation={pickingLocation}
          t={t}
          mapMode={mapMode}
          currentUser={session.user}
        />
      </div>

      {loading && (
        <div className="fixed top-20 right-6 z-[1100] bg-green-600/90 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
          {t.loadingReports}
        </div>
      )}

      <button
        onClick={handleOpenReportModal}
        className="fixed bottom-7 right-6 z-[1000] w-14 h-14 rounded-full btn-green-gradient
                   text-white border-0 flex items-center justify-center cursor-pointer
                   shadow-[0_8px_30px_rgba(34,197,94,0.5)] hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={28} />
      </button>

      {showModal && (
        <ReportModal
          onClose={() => setShowModal(false)}
          onSubmit={handleNewReport}
          pinnedLocation={pinnedLocation}
          onStartPinning={handleStartPinning}
          mode={modalMode}
          reportId={activeReportId}
          t={t}
          currentUser={session.user}
        />
      )}

      {showLeaderboard && (
        <Leaderboard
          onClose={() => setShowLeaderboard(false)}
          t={t}
        />
      )}
    </div>
  );
}
