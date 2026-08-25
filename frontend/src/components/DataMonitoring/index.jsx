/**
 * DataMonitoring Component - Complete monitoring dashboard
 * Historical graphs, threshold management, anomaly detection
 */

import { useState } from 'react';
import GraphViewer from './GraphViewer';
import GraphViewerMulti from './GraphViewerMulti';
import ThresholdManager from './ThresholdManager';
import './DataMonitoring.css';

const DataMonitoring = () => {
  const [selectedEquipment, setSelectedEquipment] = useState({
    chiller: true,
    pump: true,
    ahu: true
  });
  const [parameter, setParameter] = useState('voltage_R');
  const [timeRange, setTimeRange] = useState('month');
  const [showThresholds, setShowThresholds] = useState(false);

  const handleEquipmentToggle = (type) => {
    setSelectedEquipment(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const parameters = {
    chiller: [
      { value: 'voltage_R', label: 'Voltage R (V)' },
      { value: 'voltage_S', label: 'Voltage S (V)' },
      { value: 'voltage_T', label: 'Voltage T (V)' },
      { value: 'temp_in', label: 'Temperature In (°C)' },
      { value: 'temp_out', label: 'Temperature Out (°C)' },
    ],
    pump: [
      { value: 'voltage_R', label: 'Voltage R (V)' },
      { value: 'voltage_S', label: 'Voltage S (V)' },
      { value: 'voltage_T', label: 'Voltage T (V)' },
    ],
    ahu: [
      { value: 'voltage_R', label: 'Voltage R (V)' },
      { value: 'voltage_S', label: 'Voltage S (V)' },
      { value: 'voltage_T', label: 'Voltage T (V)' },
    ],
  };

  const handleExportGraph = () => {
    // Export all visible graphs
    const containers = document.querySelectorAll('.graph-container');
    if (containers.length === 0) return;

    containers.forEach((container, idx) => {
      const canvas = container.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        const equipType = Object.keys(selectedEquipment).filter(k => selectedEquipment[k])[idx];
        link.download = `graph-${equipType}-${parameter}-${timeRange}.png`;
        link.click();
      }
    });
  };

  return (
    <div className="data-monitoring-container">
      {/* Header */}
      <div className="monitoring-header">
        <h1>📊 Data Monitoring Dashboard</h1>
        <p>View historical equipment readings with threshold analysis</p>
      </div>

      {/* Controls */}
      <div className="monitoring-controls">
        <div className="control-group">
          <label>Select Equipment Types (Multiple)</label>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {['chiller', 'pump', 'ahu'].map(type => (
              <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={selectedEquipment[type]}
                  onChange={() => handleEquipmentToggle(type)}
                />
                <span style={{ fontSize: '16px' }}>
                  {type === 'chiller' ? '❄️ Chiller' : type === 'pump' ? '💧 Pump' : '🌬️ AHU'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label htmlFor="parameter">Parameter (Same for all selected)</label>
          <select
            id="parameter"
            value={parameter}
            onChange={(e) => setParameter(e.target.value)}
            className="control-select"
          >
            <optgroup label="Voltage">
              <option value="voltage_R">Voltage R (V)</option>
              <option value="voltage_S">Voltage S (V)</option>
              <option value="voltage_T">Voltage T (V)</option>
            </optgroup>
            <optgroup label="Temperature (Chiller Only)">
              <option value="temp_in">Temperature In (°C)</option>
              <option value="temp_out">Temperature Out (°C)</option>
            </optgroup>
          </select>
        </div>

        <div className="control-group">
          <label>Time Range</label>
          <div className="time-range-buttons">
            {[
              { value: 'month', label: 'Monthly' },
              { value: '6-month', label: '6 Months' },
              { value: 'year', label: 'Yearly' }
            ].map(range => (
              <button
                key={range.value}
                className={`time-range-btn ${timeRange === range.value ? 'active' : ''}`}
                onClick={() => setTimeRange(range.value)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-actions">
          <button className="btn btn-primary" onClick={handleExportGraph}>
            📥 Export Graph
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowThresholds(!showThresholds)}
          >
            {showThresholds ? '📊 Hide Thresholds' : '⚙️ Manage Thresholds'}
          </button>
        </div>
      </div>

      {/* Combined Graph Viewer - All Selected Equipment on ONE Graph */}
      {Object.values(selectedEquipment).some(v => v) ? (
        <div className="monitoring-graph">
          <GraphViewerMulti
            selectedEquipment={selectedEquipment}
            parameter={parameter}
            timeRange={timeRange}
          />
        </div>
      ) : (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: 'var(--color-bg-alt)',
          borderRadius: '8px',
          color: 'var(--color-text-muted)'
        }}>
          <p>📭 Select at least one equipment type to view graphs</p>
        </div>
      )}

      {/* Threshold Manager - Show for all selected equipment */}
      {showThresholds && Object.values(selectedEquipment).some(v => v) && (
        <div className="monitoring-thresholds">
          <h3>⚙️ Threshold Configuration for Selected Equipment</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {selectedEquipment.chiller && (
              <ThresholdManager
                equipmentType="chiller"
                parameter={parameter}
              />
            )}
            {selectedEquipment.pump && (
              <ThresholdManager
                equipmentType="pump"
                parameter={parameter}
              />
            )}
            {selectedEquipment.ahu && (
              <ThresholdManager
                equipmentType="ahu"
                parameter={parameter}
              />
            )}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="monitoring-info">
        <div className="info-card">
          <h3>📈 How to Read the Graph</h3>
          <ul>
            <li><strong>Blue Line:</strong> Equipment readings over time</li>
            <li><strong>Green Dashed Line:</strong> Minimum threshold</li>
            <li><strong>Red Dashed Line:</strong> Maximum threshold</li>
            <li><strong>Red Dots:</strong> Anomalies detected (threshold exceeded)</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>⚠️ Anomaly Detection</h3>
          <ul>
            <li>Readings exceeding max threshold are marked as anomalies</li>
            <li>Readings below min threshold are also flagged</li>
            <li>Thresholds can be edited by clicking "⚙️ Manage Thresholds"</li>
            <li>Alert levels: Warning or Critical</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>📊 Time Ranges</h3>
          <ul>
            <li><strong>Monthly:</strong> Last 30 days of data</li>
            <li><strong>6 Months:</strong> Last 6 months of data</li>
            <li><strong>Yearly:</strong> Last 12 months of data</li>
            <li>Data is aggregated from all daily checks</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataMonitoring;
