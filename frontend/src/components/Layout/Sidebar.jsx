/**
 * Sidebar Component - Navigation
 * Displays app title and navigation buttons
 * Primary workflow: Daily Check → History → Monitoring
 */

import React from 'react';
import { VIEWS } from '../../config/constants';

const Sidebar = ({ currentView, onViewChange }) => {
  const handleNavClick = (view) => {
    onViewChange(view);
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">📋 JATSC</h1>
        <p className="sidebar-subtitle">Daily Monitoring</p>
      </div>

      <div className="sidebar-nav">
        <button
          className={`nav-button ${currentView === VIEWS.DAILY_CHECK ? 'active' : ''}`}
          onClick={() => handleNavClick(VIEWS.DAILY_CHECK)}
        >
          <span>✓</span>
          <span>Daily Check</span>
        </button>

        <button
          className={`nav-button ${currentView === VIEWS.HISTORY ? 'active' : ''}`}
          onClick={() => handleNavClick(VIEWS.HISTORY)}
        >
          <span>📚</span>
          <span>History</span>
        </button>

        <button
          className={`nav-button ${currentView === VIEWS.DATA_MONITORING ? 'active' : ''}`}
          onClick={() => handleNavClick(VIEWS.DATA_MONITORING)}
        >
          <span>📊</span>
          <span>Monitoring</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
