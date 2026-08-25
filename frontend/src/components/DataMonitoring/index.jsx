/**
 * DataMonitoring Component - Complete monitoring dashboard
 * Historical graphs, threshold management, anomaly detection
 */

import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import GraphViewer from './GraphViewer';
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

  const handleExportGraph = async () => {
    const selectedEquipmentTypes = Object.keys(selectedEquipment).filter(k => selectedEquipment[k]);

    if (selectedEquipmentTypes.length === 0) {
      alert('No graphs to export. Please select at least one equipment type.');
      return;
    }

    try {
      const timestamp = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
      const equipmentNames = selectedEquipmentTypes
        .map(k => k.charAt(0).toUpperCase() + k.slice(1))
        .join('-');

      // Export each graph individually
      for (const equipType of selectedEquipmentTypes) {
        try {
          // Find the graph container for this equipment type
          const allGraphs = document.querySelectorAll('.graph-viewer');
          let targetGraph = null;
          let graphIndex = -1;

          for (let i = 0; i < allGraphs.length; i++) {
            const graph = allGraphs[i];
            // Check if this graph belongs to the current equipment type by looking for equipment name in title
            const title = graph.querySelector('h3, h2, h4');
            if (title && title.textContent.toLowerCase().includes(equipType.toLowerCase())) {
              targetGraph = graph;
              graphIndex = i;
              break;
            }
          }

          if (!targetGraph) {
            console.warn(`Graph not found for equipment type: ${equipType}`);
            continue;
          }

          console.log(`Exporting graph for ${equipType} (index: ${graphIndex})...`);

          // Capture individual graph with better error handling
          const canvas = await html2canvas(targetGraph, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true,
            timeout: 10000
          }).catch(err => {
            console.error(`Failed to capture ${equipType} graph:`, err);
            throw new Error(`Failed to capture ${equipType} graph: ${err.message}`);
          });

          const image = canvas.toDataURL('image/png');
          console.log(`✓ PNG captured for ${equipType}, size: ${(image.length / 1024).toFixed(2)}KB`);

          // Download as PNG
          const link = document.createElement('a');
          link.href = image;
          link.download = `graph-${equipType}-${parameter}-${timeRange}-${timestamp}.png`;
          link.click();
          console.log(`✓ PNG downloaded for ${equipType}`);

          // Also create PDF
          const pdf = new jsPDF('landscape', 'mm', 'a4');
          const imgWidth = 280;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Check if image height exceeds page height
          const pageHeight = pdf.internal.pageSize.getHeight();
          if (imgHeight > pageHeight - 40) {
            console.warn(`Image height (${imgHeight}mm) exceeds page height, will add multiple pages`);
            // For now, scale down to fit
            const scaledHeight = pageHeight - 40;
            pdf.addImage(image, 'PNG', 10, 10, imgWidth, scaledHeight);
          } else {
            pdf.addImage(image, 'PNG', 10, 10, imgWidth, imgHeight);
          }

          pdf.setFontSize(10);
          pdf.text(`Equipment: ${equipType.toUpperCase()} | Parameter: ${parameter} | Range: ${timeRange}`, 10, imgHeight + 20);
          pdf.text(`Exported: ${new Date().toLocaleString('id-ID')}`, 10, imgHeight + 25);
          pdf.save(`graph-${equipType}-${parameter}-${timeRange}-${timestamp}.pdf`);
          console.log(`✓ PDF saved for ${equipType}`);

          // Small delay between exports to avoid issues
          await new Promise(resolve => setTimeout(resolve, 800));
        } catch (equipError) {
          console.error(`Error exporting ${equipType}:`, equipError);
          alert(`Failed to export ${equipType} graph. Check browser console for details.`);
        }
      }

      console.log('✓ Export complete');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export graphs. Please try again. Check browser console for details.');
    }
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

      {/* Grid of Individual Graphs - One per Selected Equipment Type */}
      {Object.values(selectedEquipment).some(v => v) ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {selectedEquipment.chiller && (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', background: 'var(--color-bg-alt)' }}>
              <GraphViewer
                equipmentType="chiller"
                parameter={parameter}
                timeRange={timeRange}
              />
            </div>
          )}
          {selectedEquipment.pump && (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', background: 'var(--color-bg-alt)' }}>
              <GraphViewer
                equipmentType="pump"
                parameter={parameter}
                timeRange={timeRange}
              />
            </div>
          )}
          {selectedEquipment.ahu && (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', background: 'var(--color-bg-alt)' }}>
              <GraphViewer
                equipmentType="ahu"
                parameter={parameter}
                timeRange={timeRange}
              />
            </div>
          )}
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
