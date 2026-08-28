/**
 * DailyCheckActive Component (Updated)
 * Main active check session - category-based inspection with personnel management
 * Supports all 4 logsheets in one session with organized category selection
 */

import { useState, useEffect } from 'react';
import { useApiPost, useApiGet } from '../../hooks/useApi';
import { ROLES, LOGSHEET_CATEGORIES } from '../../config/constants';
import CategorySelector from './CategorySelector';
import LogsheetInspectionForm from './LogsheetInspectionForm';
import Toast from '../Toast';
import './DailyCheck.css';

const DailyCheckActive = ({ checkId, onCheckStopped }) => {
  // Session data
  const [check, setCheck] = useState(null);

  // Category selection
  const [selectedCategory, setSelectedCategory] = useState(LOGSHEET_CATEGORIES.BEBAN_LISTRIK);

  // Personnel management
  const [newPersonnelName, setNewPersonnelName] = useState('');
  const [newPersonnelRole, setNewPersonnelRole] = useState('Operator');

  // Session notes
  const [notes, setNotes] = useState('');

  // UI state
  const [toast, setToast] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    personnel: true,
    categories: true,
    form: true,
  });

  // API hooks
  const { loading: loadingCheck, post: postPersonnel } = useApiPost();
  const { loading: loadingStop, post: stopCheck } = useApiPost();
  const { loading: loadingRead, post: addReading } = useApiPost();
  const { data: checkData, fetch: fetchCheck } = useApiGet(`/daily-check/${checkId}`);

  // Fetch check data on mount
  useEffect(() => {
    fetchCheck();
  }, [checkId]);

  // Update check state when data changes
  useEffect(() => {
    if (checkData?.data) {
      setCheck(checkData.data);
    }
  }, [checkData]);

  // Handle add personnel
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

      // Fetch immediately - no delay!
      fetchCheck();
    } catch (err) {
      setToast({ type: 'error', message: '❌ Failed to add personnel' });
    }
  };

  // Handle save readings (from LogsheetInspectionForm)
  const handleReadingsSaved = async (readings, category, conceptType) => {
    try {
      let savedCount = 0;

      // Save each reading to backend
      for (const reading of readings) {
        try {
          await addReading(`/daily-check/${checkId}/reading`, {
            equipment_type: category,
            concept_type: check.concept_type,
            category: category,
            ...reading,
          });
          savedCount++;
        } catch (err) {
          console.error('Error saving reading:', err);
        }
      }

      setToast({
        type: 'success',
        message: `✅ ${savedCount}/${readings.length} readings saved!`,
      });

      // Fetch immediately - no delay!
      fetchCheck();
    } catch (err) {
      setToast({ type: 'error', message: '❌ Failed to save readings' });
    }
  };

  // Handle stop check
  const handleStopCheck = async () => {
    if (!window.confirm('Stop this daily check? Make sure all data is entered.')) {
      return;
    }

    try {
      const stopTime = new Date().toTimeString().split(' ')[0];
      await stopCheck(`/daily-check/${checkId}/stop`, {
        stop_time: stopTime,
        notes,
      });

      setToast({
        type: 'success',
        message: '✅ Daily check completed!',
      });

      // Complete immediately - no delay!
      onCheckStopped(checkId);
    } catch (err) {
      setToast({ type: 'error', message: '❌ Failed to stop check' });
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // Loading state
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
      {/* Header */}
      <div className="daily-check-header">
        <div>
          <h2>Daily Check #{check.id} - Active</h2>
          <p>
            Date: {new Date(check.date).toLocaleDateString('id-ID')} • Shift: {check.shift}
            • Konsep: {check.concept_type}
          </p>
        </div>
      </div>

      {/* Personnel Section */}
      <div className="daily-check-section">
        <div
          className="section-header"
          onClick={() => toggleSection('personnel')}
          role="button"
          tabIndex="0"
        >
          <h3>👥 Personnel Participating</h3>
          <span className="toggle-icon">
            {expandedSections.personnel ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections.personnel && (
          <div className="section-content">
            {check.personnel?.length > 0 && (
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
        )}
      </div>

      {/* Category Selection */}
      <CategorySelector
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Logsheet Inspection Form */}
      <LogsheetInspectionForm
        category={selectedCategory}
        checkId={checkId}
        conceptType={check.concept_type}
        onReadingsSaved={handleReadingsSaved}
        loading={loadingRead}
      />

      {/* Notes Section */}
      <div className="daily-check-section">
        <div
          className="section-header"
          onClick={() => toggleSection('notes')}
          role="button"
          tabIndex="0"
        >
          <h3>📝 Session Notes</h3>
          <span className="toggle-icon">
            {expandedSections.notes ? '▼' : '▶'}
          </span>
        </div>

        {expandedSections.notes && (
          <div className="section-content">
            <textarea
              placeholder="Additional notes for this daily check..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="notes-textarea"
              rows="4"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="daily-check-actions">
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

export default DailyCheckActive;
