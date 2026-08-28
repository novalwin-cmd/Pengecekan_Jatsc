/**
 * DailyCheckComplete Component
 * Completion summary with export options
 */

import { useState, useEffect, useRef } from 'react';
import { useApiGet, useApiPost } from '../../hooks/useApi';
import { useExport } from '../../hooks/useExport';
import Toast from '../Toast';
import MonitoringGraphs from './MonitoringGraphs';
import ApprovalChecklist from './ApprovalChecklist';
import './DailyCheck.css';
import './MonitoringGraphs.css';

const DailyCheckComplete = ({ checkId, onNewCheck, onEdit }) => {
  const [check, setCheck] = useState(null);
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [approvalTimestamp, setApprovalTimestamp] = useState(null);
  const abortControllerRef = useRef(null);
  const { data: checkData, fetch: fetchCheck } = useApiGet(`/daily-check/${checkId}`);
  const { post: postApprove } = useApiPost();
  const { exportCSV, exportXLSX, exportPDF } = useExport();

  useEffect(() => {
    fetchCheck();
  }, [checkId]);

  useEffect(() => {
    if (checkData?.data) {
      setCheck(checkData.data);
      setIsApproved(checkData.data.is_approved || false);
      // Store approval timestamp if approved
      if (checkData.data.is_approved && checkData.data.approved_at) {
        setApprovalTimestamp(new Date(checkData.data.approved_at));
      }
    }
  }, [checkData]);

  const handleExport = async (format) => {
    if (!check) {
      setToast({ type: 'error', message: '❌ Check data not loaded' });
      return;
    }

    // PDF export requires both approvals
    if (format === 'pdf' && (!check.supervisor_approved || !check.technical_manager_approved)) {
      setToast({
        type: 'error',
        message: '❌ Both Supervisor and Technical Manager approvals required for PDF export'
      });
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

  const handleApprovalChange = () => {
    // Refresh the check data when approval status changes
    fetchCheck();
  };

  const handleApprovalToggle = async (approved) => {
    const toggleId = `${Date.now()}-${approved}`;
    setApprovingId(toggleId);

    try {
      const result = await postApprove(`/daily-check/${checkId}/approve`, {
        is_approved: approved
      });

      if (result?.success) {
        // Update timestamp immediately for better UX
        if (approved) {
          setApprovalTimestamp(new Date());
        } else {
          setApprovalTimestamp(null);
        }

        setToast({
          type: 'success',
          message: approved ? '✅ Daily check approved' : '✅ Approval removed'
        });
      } else {
        throw new Error(result?.error || 'Failed to update approval status');
      }
    } catch (error) {
      console.error('Error updating approval status:', error);
      setToast({
        type: 'error',
        message: `❌ Failed: ${error.message || 'Try again'}`
      });
      // Revert the checkbox state on error
      setIsApproved(!approved);
    } finally {
      setApprovingId(null);
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

      {/* NEW: Two-Level Approval Checklist */}
      <ApprovalChecklist
        checkId={checkId}
        checkData={check}
        onApprovalChange={handleApprovalChange}
      />

      {/* Export Section */}
      <div className="export-section">
        <h3>📥 Export Data</h3>
        <div className="export-info">
          <p>Download this daily check in your preferred format:</p>
          {!(check.supervisor_approved && check.technical_manager_approved) && (
            <div className="export-warning">
              <span className="icon">⚠️</span>
              <span>PDF export requires both Supervisor and Technical Manager approvals</span>
            </div>
          )}
        </div>
        <div className="export-buttons">
          <button
            className="btn btn-primary"
            onClick={() => handleExport('csv')}
            disabled={exporting}
            title="CSV export available anytime"
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
            title="XLSX export available anytime"
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
            className={`btn ${check.supervisor_approved && check.technical_manager_approved ? 'btn-success' : 'btn-disabled'}`}
            onClick={() => handleExport('pdf')}
            disabled={exporting || !check.supervisor_approved || !check.technical_manager_approved}
            title={check.supervisor_approved && check.technical_manager_approved ? 'PDF export now available' : 'PDF export requires both approvals'}
          >
            {exporting ? (
              <>
                <span className="spinner"></span>
                Exporting...
              </>
            ) : (
              <>
                {check.supervisor_approved && check.technical_manager_approved ? '✅ PDF' : '📋 PDF (Locked)'}
              </>
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
