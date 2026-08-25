/**
 * Shell Component - Main App Layout
 * Renders sidebar + main content area
 * Handles responsive grid layout
 */

import React from 'react';
import Sidebar from './Sidebar';

const Shell = ({ children, currentView, onViewChange }) => {
  return (
    <div className="app-shell">
      <Sidebar currentView={currentView} onViewChange={onViewChange} />
      <main className="main-content">
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Shell;
