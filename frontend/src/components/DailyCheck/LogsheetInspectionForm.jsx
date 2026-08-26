/**
 * LogsheetInspectionForm Component
 * Displays organized form fields for the selected logsheet category
 * Handles multiple readings with concept-specific fields
 */

import { useState } from 'react';
import { LOGSHEET_DEFINITIONS } from '../../config/constants';
import Toast from '../Toast';
import './LogsheetInspectionForm.css';

const LogsheetInspectionForm = ({
  category,
  checkId,
  conceptType,
  onReadingsSaved,
  loading
}) => {
  const [readings, setReadings] = useState([]);
  const [currentReading, setCurrentReading] = useState({});
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const logsheetDef = LOGSHEET_DEFINITIONS[category];

  if (!logsheetDef) {
    return <div className="error">Invalid category selected</div>;
  }

  // Initialize a new reading row
  const addNewRow = () => {
    const newReading = {};
    logsheetDef.fieldGroups.forEach(group => {
      group.fields.forEach(field => {
        newReading[field.name] = '';
      });
    });
    setCurrentReading(newReading);
  };

  // Validate current reading
  const validateReading = () => {
    const newErrors = {};
    let isValid = true;

    // Check required fields
    logsheetDef.fieldGroups.forEach(group => {
      group.fields.forEach(field => {
        if (field.required && !currentReading[field.name]) {
          newErrors[field.name] = `${field.label} is required`;
          isValid = false;
        }
      });
    });

    // Concept-specific validation
    if (conceptType === 'Preventive' && !currentReading.maintenance_description) {
      newErrors.maintenance_description = 'Penjelasan Kegiatan Pemeliharaan is required for Preventive';
      isValid = false;
    }
    if (conceptType === 'Corrective') {
      if (!currentReading.issue_before_description) {
        newErrors.issue_before_description = 'Penjelasan Perbaikan Sebelum is required for Corrective';
        isValid = false;
      }
      if (!currentReading.result_after_description) {
        newErrors.result_after_description = 'Penjelasan Hasil Sesudah is required for Corrective';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Add reading to list
  const handleAddReading = () => {
    if (!validateReading()) {
      setToast({ type: 'error', message: 'Please check required fields' });
      return;
    }

    setReadings([...readings, { ...currentReading }]);
    setCurrentReading({});
    setErrors({});
    setToast({ type: 'success', message: '✅ Reading added to list' });
  };

  // Remove reading from list
  const handleRemoveReading = (index) => {
    setReadings(readings.filter((_, i) => i !== index));
  };

  // Save all readings
  const handleSaveReadings = async () => {
    if (readings.length === 0) {
      setToast({ type: 'error', message: 'Add at least one reading before saving' });
      return;
    }

    try {
      onReadingsSaved(readings, category, conceptType);
    } catch (err) {
      setToast({ type: 'error', message: `Failed to save readings: ${err.message}` });
    }
  };

  // Reset form
  const handleReset = () => {
    setCurrentReading({});
    setErrors({});
  };

  // Render field input
  const renderField = (field) => {
    const value = currentReading[field.name] || '';
    const error = errors[field.name];

    const commonProps = {
      name: field.name,
      value,
      onChange: (e) => {
        setCurrentReading({
          ...currentReading,
          [field.name]: e.target.value
        });
        if (error) {
          const newErrors = { ...errors };
          delete newErrors[field.name];
          setErrors(newErrors);
        }
      },
      placeholder: field.placeholder || '',
    };

    switch (field.type) {
      case 'select':
        return (
          <div className="form-group" key={field.name}>
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <select {...commonProps} id={field.name}>
              <option value="">Select {field.label}</option>
              {field.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {error && <span className="field-error">{error}</span>}
          </div>
        );

      case 'textarea':
        return (
          <div className="form-group" key={field.name}>
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <textarea
              {...commonProps}
              id={field.name}
              rows="3"
            />
            {error && <span className="field-error">{error}</span>}
          </div>
        );

      case 'number':
        return (
          <div className="form-group" key={field.name}>
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              {...commonProps}
              type="number"
              id={field.name}
              step={field.step || '1'}
              min={field.min}
              max={field.max}
            />
            {error && <span className="field-error">{error}</span>}
          </div>
        );

      case 'text':
      default:
        return (
          <div className="form-group" key={field.name}>
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              {...commonProps}
              type="text"
              id={field.name}
            />
            {error && <span className="field-error">{error}</span>}
          </div>
        );
    }
  };

  return (
    <div className="logsheet-inspection-form">
      <div className="form-header">
        <h3>{logsheetDef.name}</h3>
        <p>Logsheet: {LOGSHEET_DEFINITIONS[category].name}</p>
        <p className="concept-type">Konsep: {conceptType}</p>
      </div>

      {/* Current Reading Form */}
      <div className="form-section">
        <h4>📝 Input Data Pembacaan</h4>

        {logsheetDef.fieldGroups.map(group => (
          <fieldset key={group.name} className="field-group">
            <legend>{group.name}</legend>
            <div className="fields-grid">
              {group.fields.map(field => renderField(field))}
            </div>
          </fieldset>
        ))}

        {/* Concept-specific fields */}
        {conceptType === 'Preventive' && (
          <fieldset className="field-group concept-fields">
            <legend>🛠️ Penjelasan Kegiatan Pemeliharaan</legend>
            <div className="fields-grid">
              <div className="form-group">
                <label htmlFor="maintenance_description">
                  Penjelasan Kegiatan Pemeliharaan
                  <span className="required">*</span>
                </label>
                <textarea
                  id="maintenance_description"
                  name="maintenance_description"
                  value={currentReading.maintenance_description || ''}
                  onChange={(e) => {
                    setCurrentReading({
                      ...currentReading,
                      maintenance_description: e.target.value
                    });
                  }}
                  placeholder="Deskripsi detail aktivitas pemeliharaan (10-500 karakter)"
                  rows="3"
                  maxLength="500"
                />
                <span className="char-count">
                  {(currentReading.maintenance_description || '').length} / 500
                </span>
                {errors.maintenance_description && (
                  <span className="field-error">{errors.maintenance_description}</span>
                )}
              </div>
            </div>
          </fieldset>
        )}

        {conceptType === 'Corrective' && (
          <>
            <fieldset className="field-group concept-fields">
              <legend>⚠️ Penjelasan Perbaikan Sebelum</legend>
              <div className="fields-grid">
                <div className="form-group">
                  <label htmlFor="issue_before_description">
                    Deskripsi Gangguan & Tindakan Perbaikan
                    <span className="required">*</span>
                  </label>
                  <textarea
                    id="issue_before_description"
                    name="issue_before_description"
                    value={currentReading.issue_before_description || ''}
                    onChange={(e) => {
                      setCurrentReading({
                        ...currentReading,
                        issue_before_description: e.target.value
                      });
                    }}
                    placeholder="Deskripsi gangguan dan langkah perbaikan (20-1000 karakter)"
                    rows="4"
                    maxLength="1000"
                  />
                  <span className="char-count">
                    {(currentReading.issue_before_description || '').length} / 1000
                  </span>
                  {errors.issue_before_description && (
                    <span className="field-error">{errors.issue_before_description}</span>
                  )}
                </div>
              </div>
            </fieldset>

            <fieldset className="field-group concept-fields">
              <legend>✅ Penjelasan Hasil Sesudah Perbaikan</legend>
              <div className="fields-grid">
                <div className="form-group">
                  <label htmlFor="result_after_description">
                    Kondisi Pasca Perbaikan & Hasil Pengujian
                    <span className="required">*</span>
                  </label>
                  <textarea
                    id="result_after_description"
                    name="result_after_description"
                    value={currentReading.result_after_description || ''}
                    onChange={(e) => {
                      setCurrentReading({
                        ...currentReading,
                        result_after_description: e.target.value
                      });
                    }}
                    placeholder="Hasil perbaikan dan status kesiapan operasional (20-1000 karakter)"
                    rows="4"
                    maxLength="1000"
                  />
                  <span className="char-count">
                    {(currentReading.result_after_description || '').length} / 1000
                  </span>
                  {errors.result_after_description && (
                    <span className="field-error">{errors.result_after_description}</span>
                  )}
                </div>
              </div>
            </fieldset>
          </>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
          >
            ↻ Reset
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddReading}
            disabled={loading}
          >
            ➕ Add Reading
          </button>
        </div>
      </div>

      {/* Readings List */}
      {readings.length > 0 && (
        <div className="readings-list">
          <h4>📋 Readings Added ({readings.length})</h4>
          <div className="readings-table">
            <div className="table-header">
              <div className="col-equipment">Equipment</div>
              <div className="col-status">Status</div>
              <div className="col-actions">Actions</div>
            </div>
            {readings.map((reading, index) => (
              <div key={index} className="table-row">
                <div className="col-equipment">
                  {reading.peralatan || `Reading ${index + 1}`}
                </div>
                <div className="col-status">
                  {reading.status ? (
                    <span className={`status-badge status-${reading.status.toLowerCase()}`}>
                      {reading.status}
                    </span>
                  ) : (
                    '—'
                  )}
                </div>
                <div className="col-actions">
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveReading(index)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="form-footer">
        <button
          type="button"
          className="btn btn-success btn-large"
          onClick={handleSaveReadings}
          disabled={loading || readings.length === 0}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Saving...
            </>
          ) : (
            <>💾 Save All Readings ({readings.length})</>
          )}
        </button>
      </div>

      {/* Toast Notification */}
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

export default LogsheetInspectionForm;
