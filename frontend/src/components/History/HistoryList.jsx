/**
 * HistoryList Component - Display Daily Checks
 * Fetches and displays list of all daily checks
 * Click row to expand detail view with graphs
 */

import { useEffect } from 'react';
import { useApiGet } from '../../hooks/useApi';
import './History.css';

const HistoryList = ({ onSelectRecord }) => {
  const { data, loading, error, fetch } = useApiGet('/daily-checks');

  useEffect(() => {
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="history-loading">
        <div className="spinner"></div>
        <p>Loading daily checks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        ❌ Failed to load daily checks: {error}
      </div>
    );
  }

  const checks = data?.data || [];

  if (checks.length === 0) {
    return (
      <div className="history-empty">
        <p>📭 No daily checks yet</p>
        <small>Start a new daily check to get started</small>
      </div>
    );
  }

  return (
    <div className="history-list-container">
      <h2 className="history-list-title">Daily Check History</h2>

      <div className="history-table-scroll">
        <table className="history-table bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Shift</th>
              <th>Time</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Readings</th>
              <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((check) => {
              const readingsCount = check.readings_count || 0;
              const statusBadge = check.status === 'completed' ? '✅ Completed' : '⏱️ Active';

              return (
                <tr key={check.id}>
                  <td>#{check.id}</td>
                  <td>{new Date(check.date).toLocaleDateString('id-ID')}</td>
                  <td>{check.shift}</td>
                  <td>{check.start_time}</td>
                  <td style={{ textAlign: 'center' }}>{statusBadge}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="readings-badge">{readingsCount}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-small btn-primary"
                      onClick={() => onSelectRecord(check.id)}
                      title="View details and graphs"
                      aria-label={`View check ${check.id}`}
                    >
                      📈
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryList;
