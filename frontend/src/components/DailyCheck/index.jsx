/**
 * DailyCheck Component
 * Orchestrates Start → Active → Complete flow
 */

import { useState } from 'react';
import DailyCheckStart from './DailyCheckStart';
import DailyCheckActive from './DailyCheckActive';
import DailyCheckComplete from './DailyCheckComplete';

const DailyCheck = () => {
  const [status, setStatus] = useState('start'); // start, active, complete, edit
  const [currentCheckId, setCurrentCheckId] = useState(null);

  const handleCheckStarted = (checkId) => {
    setCurrentCheckId(checkId);
    setStatus('active');
  };

  const handleCheckStopped = (checkId) => {
    setStatus('complete');
  };

  const handleNewCheck = () => {
    setCurrentCheckId(null);
    setStatus('start');
  };

  const handleEdit = (checkId) => {
    setStatus('edit');
  };

  return (
    <div className="daily-check-module">
      {status === 'start' && (
        <DailyCheckStart onCheckStarted={handleCheckStarted} />
      )}

      {status === 'active' && currentCheckId && (
        <DailyCheckActive
          checkId={currentCheckId}
          onCheckStopped={handleCheckStopped}
        />
      )}

      {status === 'complete' && currentCheckId && (
        <DailyCheckComplete
          checkId={currentCheckId}
          onNewCheck={handleNewCheck}
          onEdit={handleEdit}
        />
      )}

      {status === 'edit' && currentCheckId && (
        <DailyCheckActive
          checkId={currentCheckId}
          onCheckStopped={handleNewCheck}
        />
      )}
    </div>
  );
};

export default DailyCheck;
