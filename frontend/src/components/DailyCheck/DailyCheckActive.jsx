/**
 * DailyCheckActive Component
 * Main active check session - add personnel and readings
 */

import { useState, useEffect } from 'react';
import { useApiPost, useApiGet } from '../../hooks/useApi';
import { EQUIPMENT_LABELS, EQUIPMENT_FIELDS, DEFAULT_READING, ROLES } from '../../config/constants';
import EquipmentTable from '../InspectionForm/EquipmentTable';
import Toast from '../Toast';
import './DailyCheck.css';

const DailyCheckActive = ({ checkId, onCheckStopped }) => {
  const [check, setCheck] = useState(null);
  const [newPersonnelName, setNewPersonnelName] = useState('');
  const [newPersonnelRole, setNewPersonnelRole] = useState('Operator');
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState(null);

  const [chillerReadings, setChillerReadings] = useState([{ ...DEFAULT_READING.chiller }]);
  const [pumpReadings, setPumpReadings] = useState([]);
  const [ahuReadings, setAhuReadings] = useState([]);

  const { loading: loadingCheck, post: postPersonnel } = useApiPost();
  const { loading: loadingStop, post: stopCheck } = useApiPost();
  const { loading: loadingRead, post: addReading } = useApiPost();
  const { data: checkData, fetch: fetchCheck } = useApiGet(`/daily-check/${checkId}`);

  useEffect(() => {
    fetchCheck();
  }, [checkId]);

  useEffect(() => {
    if (checkData?.data) {
      setCheck(checkData.data);
    }
  }, [checkData]);

  const handleAddPersonnel = async () => {
    if (!newPersonnelName.trim()) {
      setToast({ type: 'error', message: 'Please enter personnel name' });
      return;
    }

    try {
      await postPersonnel(`/daily-check/${checkId}/personnel`, {
        name: newPersonnelName,
        role: newPersonnelRole,
      });

      setNewPersonnelName('');
      setNewPersonnelRole('Operator');
      setToast({ type: 'success', message: '✅ Personnel added!' });

      // Refresh check data
      setTimeout(() => fetchCheck(), 500);
    } catch (err) {
      setToast({ type: 'error', message: `❌ Failed to add personnel` });
    }
  };

  const handleStopCheck = async () => {
    if (!window.confirm('Stop this daily check? Make sure all data is entered.')) {
      return;
    }

    try {
      const stopTime = new Date().toTimeString().split(' ')[0];
      const response = await stopCheck(`/daily-check/${checkId}/stop`, {
        stop_time: stopTime,
        notes,
      });

      setToast({
        type: 'success',
        message: '✅ Daily check completed!',
      });

      setTimeout(() => {
        onCheckStopped(response.daily_check_id);
      }, 1000);
    } catch (err) {
      setToast({ type: 'error', message: `❌ Failed to stop check` });
    }
  };

  if (!check) {
    return (
      <div className="daily-check-loading">
        <div className="spinner"></div>
        <p>Loading daily check...</p>
      </div>
    );
  }

  return (
    <div className="daily-check-active-container">
      <div className="daily-check-header">
        <div>
          <h2>Daily Check #{check.id} - Active</h2>
          <p>Date: {new Date(check.date).toLocaleDateString('id-ID')} • Shift: {check.shift}</p>
        </div>
      </div>

      {/* Personnel Section */}
      <div className="daily-check-section">
        <h3>👥 Personnel Participating</h3>

        {check.personnel.length > 0 && (
          <div className="personnel-list">
            {check.personnel.map((p) => (
              <div key={p.id} className="personnel-badge">
                <span className="personnel-name">{p.name}</span>
                <span className="personnel-role">{p.role}</span>
              </div>
            ))}
          </div>
        )}

        <div className="personnel-input-group">
          <input
            type="text"
            placeholder="Personnel name"
            value={newPersonnelName}
            onChange={(e) => setNewPersonnelName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddPersonnel()}
          />
          <select
            value={newPersonnelRole}
            onChange={(e) => setNewPersonnelRole(e.target.value)}
          >
            {ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-success btn-small"
            onClick={handleAddPersonnel}
            disabled={loadingCheck}
          >
            + Add
          </button>
        </div>
      </div>

      {/* Equipment Readings Section */}
      <div className="daily-check-section">
        <h3>📊 Equipment Readings</h3>

        <EquipmentTable
          title={EQUIPMENT_LABELS.chiller}
          rows={chillerReadings}
          onRowsChange={setChillerReadings}
          fields={EQUIPMENT_FIELDS.chiller}
        />

        <EquipmentTable
          title={EQUIPMENT_LABELS.pump}
          rows={pumpReadings}
          onRowsChange={setPumpReadings}
          fields={EQUIPMENT_FIELDS.pump}
        />

        <EquipmentTable
          title={EQUIPMENT_LABELS.ahu}
          rows={ahuReadings}
          onRowsChange={setAhuReadings}
          fields={EQUIPMENT_FIELDS.ahu}
        />
      </div>

      {/* Notes Section */}
      <div className="daily-check-section">
        <h3>📝 Notes</h3>
        <textarea
          placeholder="Additional notes for this daily check..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="notes-textarea"
        />
      </div>

      {/* Actions */}
      <div className="daily-check-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={loadingStop}
        >
          💾 Save Draft
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleStopCheck}
          disabled={loadingStop}
        >
          {loadingStop ? (
            <>
              <span className="spinner"></span>
              Stopping...
            </>
          ) : (
            <>⏹️ STOP DAILY CHECK</>
          )}
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

export default DailyCheckActive;
