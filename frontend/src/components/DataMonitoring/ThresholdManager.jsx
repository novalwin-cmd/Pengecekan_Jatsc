/**
 * ThresholdManager Component
 * Edit and manage equipment thresholds
 */

import { useState, useEffect } from 'react';
import { useApiGet, useApiPut } from '../../hooks/useApi';
import Toast from '../Toast';
import './DataMonitoring.css';

const ThresholdManager = ({ equipmentType, parameter }) => {
  const [thresholds, setThresholds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [toast, setToast] = useState(null);

  const { data: thresholdsData, fetch: fetchThresholds } = useApiGet(
    `/thresholds?equipment_type=${equipmentType}`
  );
  const { loading: posting, put: saveThreshold } = useApiPut();

  useEffect(() => {
    fetchThresholds();
  }, [equipmentType]);

  useEffect(() => {
    if (thresholdsData?.data) {
      setThresholds(thresholdsData.data);
    }
  }, [thresholdsData]);

  const handleEdit = (threshold) => {
    setEditingId(threshold.id);
    setEditValues({
      min_value: threshold.min_value,
      max_value: threshold.max_value,
      alert_level: threshold.alert_level,
      is_active: threshold.is_active,
    });
  };

  const handleSave = async (thresholdId) => {
    try {
      await saveThreshold(`/thresholds/${thresholdId}`, editValues);
      setToast({ type: 'success', message: '✅ Threshold updated!' });
      setEditingId(null);
      fetchThresholds();
    } catch (err) {
      setToast({ type: 'error', message: `❌ Failed to save threshold` });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  return (
    <div className="threshold-manager">
      <h3>⚙️ Threshold Configuration</h3>
      <p className="threshold-description">
        Edit minimum and maximum thresholds for {equipmentType} equipment.
        Readings outside these ranges will be flagged as anomalies.
      </p>

      <div className="thresholds-grid">
        {thresholds.length === 0 ? (
          <p className="no-thresholds">No thresholds configured for this equipment</p>
        ) : (
          thresholds.map(threshold => (
            <div key={threshold.id} className="threshold-card">
              <div className="threshold-header">
                <h4>{threshold.parameter}</h4>
                <span className={`alert-badge ${threshold.alert_level}`}>
                  {threshold.alert_level === 'warning' ? '⚠️ Warning' : '🔴 Critical'}
                </span>
              </div>

              {editingId === threshold.id ? (
                <div className="threshold-edit-form">
                  <div className="form-group-small">
                    <label>Min Value</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editValues.min_value || ''}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          min_value: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                    />
                  </div>

                  <div className="form-group-small">
                    <label>Max Value</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editValues.max_value || ''}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          max_value: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                    />
                  </div>

                  <div className="form-group-small">
                    <label>Alert Level</label>
                    <select
                      value={editValues.alert_level}
                      onChange={(e) =>
                        setEditValues({ ...editValues, alert_level: e.target.value })
                      }
                    >
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="form-group-small">
                    <label>
                      <input
                        type="checkbox"
                        checked={editValues.is_active}
                        onChange={(e) =>
                          setEditValues({ ...editValues, is_active: e.target.checked })
                        }
                      />
                      Active
                    </label>
                  </div>

                  <div className="threshold-edit-buttons">
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => handleSave(threshold.id)}
                      disabled={posting}
                    >
                      ✓ Save
                    </button>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={handleCancel}
                      disabled={posting}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="threshold-display">
                  <div className="threshold-value">
                    <span className="label">Min:</span>
                    <span className="value">
                      {threshold.min_value ?? '—'}
                    </span>
                  </div>
                  <div className="threshold-value">
                    <span className="label">Max:</span>
                    <span className="value">
                      {threshold.max_value ?? '—'}
                    </span>
                  </div>
                  <div className="threshold-status">
                    {threshold.is_active ? (
                      <span className="badge-active">🟢 Active</span>
                    ) : (
                      <span className="badge-inactive">⚫ Inactive</span>
                    )}
                  </div>

                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => handleEdit(threshold)}
                  >
                    ✏️ Edit
                  </button>
                </div>
              )}
            </div>
          ))
        )}
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

export default ThresholdManager;
