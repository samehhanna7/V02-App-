import { useState, useEffect, useCallback } from 'react';
import { loadSessions } from './utils/storage';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import LogSession from './pages/LogSession';
import History from './pages/History';
import Program from './pages/Program';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sessions, setSessions] = useState(() => loadSessions());
  const [toast, setToast] = useState(null);

  // Keep sessions in sync (in case of concurrent tabs, though unlikely)
  const refreshSessions = useCallback(() => {
    setSessions(loadSessions());
  }, []);

  const handleSessionSaved = useCallback((session) => {
    refreshSessions();
    setToast({
      message: `Session #${session.session_number} saved!`,
      type: 'success',
    });
    setActiveTab('dashboard');
  }, [refreshSessions]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    // Scroll to top on tab change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <div className="min-h-svh bg-bg-primary flex flex-col">
      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={dismissToast}
        />
      )}

      {/* Page content — padded for bottom nav */}
      <main className="flex-1 max-w-lg mx-auto w-full pb-24">
        {activeTab === 'dashboard' && (
          <Dashboard
            sessions={sessions}
            onNavigate={handleTabChange}
          />
        )}
        {activeTab === 'log' && (
          <LogSession
            sessions={sessions}
            onSessionSaved={handleSessionSaved}
          />
        )}
        {activeTab === 'history' && (
          <History sessions={sessions} />
        )}
        {activeTab === 'program' && (
          <Program />
        )}
      </main>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
