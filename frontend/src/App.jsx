/**
 * App Component - Main Application Shell
 * Manages view state and layout
 * Simplified to Daily Check workflow with History and Monitoring
 */

import { useState } from 'react';
import Shell from './components/Layout/Shell';
import HistoryList from './components/History/HistoryList';
import HistoryDetail from './components/History/HistoryDetail';
import DailyCheck from './components/DailyCheck';
import DataMonitoring from './components/DataMonitoring';
import Toast from './components/Toast';
import { VIEWS } from './config/constants';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState(VIEWS.DAILY_CHECK);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [toast, setToast] = useState(null);

  return (
    <Shell currentView={currentView} onViewChange={setCurrentView}>
      {/* Daily Check View - Primary Entry Point */}
      {currentView === VIEWS.DAILY_CHECK && (
        <DailyCheck />
      )}

      {/* History View - View and analyze past daily checks */}
      {currentView === VIEWS.HISTORY && (
        <>
          <HistoryList onSelectRecord={setSelectedRecordId} />
          {selectedRecordId && (
            <HistoryDetail
              recordId={selectedRecordId}
              onClose={() => setSelectedRecordId(null)}
            />
          )}
        </>
      )}

      {/* Data Monitoring View - Historical analytics and graphs */}
      {currentView === VIEWS.DATA_MONITORING && (
        <DataMonitoring />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Shell>
  );
}

export default App;
