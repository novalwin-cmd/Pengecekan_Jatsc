/**
 * DailyCheckStart Component
 * Start screen for daily check session
 */

import { useState } from 'react';
import { useApiPost } from '../../hooks/useApi';
import { SHIFTS } from '../../config/constants';
import Toast from '../Toast';
import './DailyCheck.css';

const DailyCheckStart = ({ onCheckStarted }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState(SHIFTS.MORNING);
  const [startTime, setStartTime] = useState(new Date().toTimeString().split(' ')[0]);
  const [toast, setToast] = useState(null);
  const { loading, post } = useApiPost();

  const handleStartCheck = async (e) => {
    e.preventDefault();

    try {
      const response = await post('/daily-check/start', {
        date,
        shift,
        start_time: startTime,
      });

      setToast({
        type: 'success',
        message: `✅ Daily Check #${response.daily_check_id} started!`,
      });

      setTimeout(() => {
        onCheckStarted(response.daily_check_id);
      }, 1000);
    } catch (err) {
      setToast({
        type: 'error',
        message: `❌ Failed to start daily check: ${err.message}`,
      });
    }
  };

  return (
    <div className="daily-check-start-container">
      <div className="daily-check-start-card">
        <div className="start-header">
          <h2>✓ Start Daily Check</h2>
          <p>Begin a new daily inspection session</p>
        </div>

        <form onSubmit={handleStartCheck} className="start-form">
          <div className="form-group">
            <label htmlFor="date">Inspection Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shift">Shift</label>
            <select
              id="shift"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              required
            >
              {Object.values(SHIFTS).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="time">Start Time</label>
            <input
              id="time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Starting...
              </>
            ) : (
              <>🚀 START DAILY CHECK</>
            )}
          </button>
        </form>
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

export default DailyCheckStart;
