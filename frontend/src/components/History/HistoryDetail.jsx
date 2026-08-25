/**
 * HistoryDetail Component - Display Full Details of Daily Check
 * Shows all readings by equipment type with inline graphs
 * Render as expand-in-place detail view (read-only)
 */

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useApiGet } from '../../hooks/useApi';
import './History.css';

const HistoryDetail = ({ recordId, onClose }) => {
  const { data: check, loading, error, fetch } = useApiGet(`/daily-check/${recordId}`);
  const [selectedEquipment, setSelectedEquipment] = useState({
    chiller: true,
    pump: true,
    ahu: true
  });

  useEffect(() => {
    fetch();
  }, [recordId]);

  if (loading) {
    return (
      <div className="history-detail">
        <div className="history-detail-header">
          <h3>Loading...</h3>
          <button className="btn btn-small" onClick={onClose}>✕</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-detail">
        <div className="history-detail-header">
          <h3>Error</h3>
          <button className="btn btn-small" onClick={onClose}>✕</button>
        </div>
        <div className="alert alert-error">
          Failed to load check details: {error}
        </div>
      </div>
    );
  }

  if (!check?.data) {
    return null;
  }

  const data = check.data;
  const readings = data.readings || [];
  const personnel = data.personnel || [];

  // Group readings by equipment type
  const chillerReadings = readings.filter(r => r.equipment_type === 'chiller');
  const pumpReadings = readings.filter(r => r.equipment_type === 'pump');
  const ahuReadings = readings.filter(r => r.equipment_type === 'ahu');

  // Prepare graph data for all selected equipment types on one graph
  const getGraphData = () => {
    const timeMap = new Map();

    // Aggregate readings by timestamp
    readings.forEach(r => {
      const time = new Date(r.timestamp).toLocaleTimeString('id-ID');
      if (!timeMap.has(time)) {
        timeMap.set(time, { timestamp: time });
      }

      const entry = timeMap.get(time);
      const eqType = r.equipment_type.toUpperCase();

      // Add voltage readings for this equipment
      entry[`${eqType}_R`] = r.R;
      entry[`${eqType}_S`] = r.S;
      entry[`${eqType}_T`] = r.T;
    });

    return Array.from(timeMap.values());
  };

  const graphData = getGraphData();

  return (
    <div className="history-detail">
      <div className="history-detail-header">
        <div>
          <h3>Daily Check #{data.id}</h3>
          <p className="detail-meta">
            {new Date(data.date).toLocaleDateString('id-ID')} • {data.shift} • {data.start_time}
          </p>
        </div>
        <button
          className="btn btn-small"
          onClick={onClose}
          aria-label="Close details"
        >
          ✕
        </button>
      </div>

      {/* Personnel Section */}
      {personnel.length > 0 && (
        <div className="detail-section">
          <h4 className="detail-section-title">👥 Personnel ({personnel.length})</h4>
          <div className="personnel-list">
            {personnel.map(p => (
              <span key={p.id} className="personnel-badge">
                {p.name} <small>({p.role})</small>
              </span>
            ))}
          </div>
        </div>
      )}

      {data.notes && (
        <div className="detail-notes">
          <strong>Notes:</strong> {data.notes}
        </div>
      )}

      {/* Inline Graph Section */}
      {readings.length > 0 && (
        <div className="detail-section">
          <h4 className="detail-section-title">📈 Voltage Readings Graph (Multi-Equipment)</h4>

          {/* Equipment Multi-Select */}
          <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={selectedEquipment.chiller}
                onChange={(e) => setSelectedEquipment({...selectedEquipment, chiller: e.target.checked})}
                disabled={chillerReadings.length === 0}
              />
              <span>❄️ Chiller ({chillerReadings.length})</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={selectedEquipment.pump}
                onChange={(e) => setSelectedEquipment({...selectedEquipment, pump: e.target.checked})}
                disabled={pumpReadings.length === 0}
              />
              <span>💧 Pump ({pumpReadings.length})</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={selectedEquipment.ahu}
                onChange={(e) => setSelectedEquipment({...selectedEquipment, ahu: e.target.checked})}
                disabled={ahuReadings.length === 0}
              />
              <span>🌬️ AHU ({ahuReadings.length})</span>
            </label>
          </div>

          {/* Graph with Multiple Equipment Lines */}
          {graphData.length > 0 && (selectedEquipment.chiller || selectedEquipment.pump || selectedEquipment.ahu) ? (
            <div style={{ width: '100%', height: '350px', marginBottom: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" angle={-45} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />

                  {/* Chiller Lines */}
                  {selectedEquipment.chiller && chillerReadings.length > 0 && (
                    <>
                      <Line type="monotone" dataKey="CHILLER_R" stroke="#0284C7" name="Chiller R" strokeWidth={2} />
                      <Line type="monotone" dataKey="CHILLER_S" stroke="#0284C7" strokeDasharray="5 5" name="Chiller S" />
                      <Line type="monotone" dataKey="CHILLER_T" stroke="#0284C7" strokeDasharray="10 5" name="Chiller T" />
                    </>
                  )}

                  {/* Pump Lines */}
                  {selectedEquipment.pump && pumpReadings.length > 0 && (
                    <>
                      <Line type="monotone" dataKey="PUMP_R" stroke="#10B981" name="Pump R" strokeWidth={2} />
                      <Line type="monotone" dataKey="PUMP_S" stroke="#10B981" strokeDasharray="5 5" name="Pump S" />
                      <Line type="monotone" dataKey="PUMP_T" stroke="#10B981" strokeDasharray="10 5" name="Pump T" />
                    </>
                  )}

                  {/* AHU Lines */}
                  {selectedEquipment.ahu && ahuReadings.length > 0 && (
                    <>
                      <Line type="monotone" dataKey="AHU_R" stroke="#F59E0B" name="AHU R" strokeWidth={2} />
                      <Line type="monotone" dataKey="AHU_S" stroke="#F59E0B" strokeDasharray="5 5" name="AHU S" />
                      <Line type="monotone" dataKey="AHU_T" stroke="#F59E0B" strokeDasharray="10 5" name="AHU T" />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted">Select at least one equipment type to view graph</p>
          )}

          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '8px' }}>
            💡 Solid lines = R phase • Dashed lines = S phase • Dash-dot lines = T phase
          </p>
        </div>
      )}

      {/* Readings Table - Show all selected equipment readings */}
      {readings.length > 0 && (selectedEquipment.chiller || selectedEquipment.pump || selectedEquipment.ahu) && (
        <div className="detail-section">
          <h4 className="detail-section-title">📊 All Readings Detail</h4>
          <div className="detail-table-scroll">
            <table className="detail-table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Location</th>
                  <th>Equipment Name</th>
                  <th>R (V)</th>
                  <th>S (V)</th>
                  <th>T (V)</th>
                  <th>Temp In (°C)</th>
                  <th>Temp Out (°C)</th>
                  <th>Notes</th>
                  <th>Anomaly</th>
                </tr>
              </thead>
              <tbody>
                {readings
                  .filter(r => {
                    if (r.equipment_type === 'chiller') return selectedEquipment.chiller;
                    if (r.equipment_type === 'pump') return selectedEquipment.pump;
                    if (r.equipment_type === 'ahu') return selectedEquipment.ahu;
                    return false;
                  })
                  .map((reading, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>
                          {reading.equipment_type === 'chiller' ? '❄️ Chiller' :
                           reading.equipment_type === 'pump' ? '💧 Pump' :
                           '🌬️ AHU'}
                        </strong>
                      </td>
                      <td>{reading.location}</td>
                      <td>{reading.peralatan}</td>
                      <td>{reading.R ?? '—'}</td>
                      <td>{reading.S ?? '—'}</td>
                      <td>{reading.T ?? '—'}</td>
                      <td>{reading.in_temp ?? '—'}</td>
                      <td>{reading.out_temp ?? '—'}</td>
                      <td>{reading.keterangan || '—'}</td>
                      <td>{reading.anomaly_detected ? '⚠️ Yes' : '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {readings.length === 0 && (
        <div className="history-empty">
          <p>📭 No readings recorded for this check</p>
        </div>
      )}
    </div>
  );
};

export default HistoryDetail;
