/**
 * DailyCheckComplete Component
 * Completion summary with export options
 */

import { useState, useEffect } from 'react';
import { useApiGet } from '../../hooks/useApi';
import { useExport } from '../../hooks/useExport';
import Toast from '../Toast';
import MonitoringGraphs from './MonitoringGraphs';
import './DailyCheck.css';
import './MonitoringGraphs.css';

const DailyCheckComplete = ({ checkId, onNewCheck, onEdit }) => {
  const [check, setCheck] = useState(null);
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);
  const { data: checkData, fetch: fetchCheck } = useApiGet(`/daily-check/${checkId}`);
  const { exportCSV, exportXLSX, exportPDF } = useExport();

  useEffect(() => {
    fetchCheck();
  }, [checkId]);

  useEffect(() => {
    if (checkData?.data) {
      setCheck(checkData.data);
    }
  }, [checkData]);

  const handleExport = async (format) => {
    if (!check) {
      setToast({ type: 'error', message: '❌ Check data not loaded' });
      return;
    }

    setExporting(true);
    try {
      switch (format) {
        case 'csv':
          exportCSV(check);
          break;
        case 'xlsx':
          exportXLSX(check);
          break;
        case 'pdf':
          exportPDF(check);
          break;
        default:
          break;
      }

      setToast({
        type: 'success',
        message: `✅ Downloaded daily-check-${check.id}.${format}`,
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: `❌ Export failed: ${err.message}`,
      });
    } finally {
      setExporting(false);
    }
  };

  if (!check) {
    return (
      <div className="daily-check-loading">
        <div className="spinner"></div>
        <p>Loading completion summary...</p>
      </div>
    );
  }

  const chillerCount = check.readings?.filter(r => r.equipment_type === 'chiller').length || 0;
  const pumpCount = check.readings?.filter(r => r.equipment_type === 'pump').length || 0;
  const ahuCount = check.readings?.filter(r => r.equipment_type === 'ahu').length || 0;
  const totalReadings = chillerCount + pumpCount + ahuCount;
  const personnelCount = check.personnel?.length || 0;
  const anomalyCount = check.readings?.filter(r => r.anomaly_detected).length || 0;

  return (
    <div className="daily-check-complete-container">
      <div className="complete-header">
        <h2>✅ Daily Check Complete</h2>
        <p>Check #{check.id}</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <div className="card-label">Date</div>
            <div className="card-value">
              {new Date(check.date).toLocaleDateString('id-ID')}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">⏰</div>
          <div className="card-content">
            <div className="card-label">Time</div>
            <div className="card-value">
              {check.start_time} - {check.stop_time || 'N/A'}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <div className="card-label">Personnel</div>
            <div className="card-value">{personnelCount}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <div className="card-label">Total Readings</div>
            <div className="card-value">{totalReadings}</div>
          </div>
        </div>
      </div>

      {/* Reading Breakdown */}
      <div className="readings-breakdown">
        <h3>Reading Breakdown</h3>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <span className="breakdown-icon">❄️</span>
            <span className="breakdown-label">Chiller</span>
            <span className="breakdown-count">{chillerCount}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-icon">💧</span>
            <span className="breakdown-label">Pump</span>
            <span className="breakdown-count">{pumpCount}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-icon">🌬️</span>
            <span className="breakdown-label">AHU</span>
            <span className="breakdown-count">{ahuCount}</span>
          </div>
          {anomalyCount > 0 && (
            <div className="breakdown-item anomaly">
              <span className="breakdown-icon">⚠️</span>
              <span className="breakdown-label">Anomalies</span>
              <span className="breakdown-count">{anomalyCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Monitoring Graphs - All Parameters */}
      {check.readings && check.readings.length > 0 && (
        <MonitoringGraphs readings={check.readings} />
      )}

      {/* Personnel List */}
      {personnelCount > 0 && (
        <div className="personnel-section">
          <h3>Personnel Involved</h3>
          <div className="personnel-items">
            {check.personnel.map((p) => (
              <div key={p.id} className="personnel-item">
                <span className="personnel-name">{p.name}</span>
                <span className="personnel-role-badge">{p.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="export-section">
        <h3>📥 Export Data</h3>
        <p>Download this daily check in your preferred format:</p>
        <div className="export-buttons">
          <button
            className="btn btn-primary"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <span className="spinner"></span>
                Exporting...
              </>
            ) : (
              <>📄 CSV</>
            )}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleExport('xlsx')}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <span className="spinner"></span>
                Exporting...
              </>
            ) : (
              <>📊 XLSX</>
            )}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleExport('pdf')}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <span className="spinner"></span>
                Exporting...
              </>
            ) : (
              <>📋 PDF</>
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="complete-actions">
        <button
          className="btn btn-secondary"
          onClick={() => onEdit(checkId)}
        >
          ✏️ Edit Check
        </button>
        <button
          className="btn btn-success"
          onClick={onNewCheck}
        >
          ✓ New Daily Check
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default DailyCheckComplete;
