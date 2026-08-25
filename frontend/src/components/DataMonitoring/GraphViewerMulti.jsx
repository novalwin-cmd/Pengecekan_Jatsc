/**
 * GraphViewerMulti Component - Display Multiple Equipment on ONE Graph
 * Shows all selected equipment types with different colors on same chart
 */

import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useApiGet } from '../../hooks/useApi';

const GraphViewerMulti = ({ selectedEquipment, parameter, timeRange }) => {
  const [data, setData] = useState([]);
  const [thresholds, setThresholds] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch readings for each selected equipment
  const chillerReadings = useApiGet(selectedEquipment.chiller ? `/data-monitoring/readings?equipment_type=chiller&parameter=${parameter}` : null);
  const pumpReadings = useApiGet(selectedEquipment.pump ? `/data-monitoring/readings?equipment_type=pump&parameter=${parameter}` : null);
  const ahuReadings = useApiGet(selectedEquipment.ahu ? `/data-monitoring/readings?equipment_type=ahu&parameter=${parameter}` : null);

  // Fetch thresholds for selected equipment
  useEffect(() => {
    const fetchThresholds = async () => {
      const newThresholds = {};
      if (selectedEquipment.chiller) {
        const res = await fetch(`http://127.0.0.1:5000/api/thresholds?equipment_type=chiller`);
        const json = await res.json();
        newThresholds.chiller = json.data?.find(t => t.parameter === parameter);
      }
      if (selectedEquipment.pump) {
        const res = await fetch(`http://127.0.0.1:5000/api/thresholds?equipment_type=pump`);
        const json = await res.json();
        newThresholds.pump = json.data?.find(t => t.parameter === parameter);
      }
      if (selectedEquipment.ahu) {
        const res = await fetch(`http://127.0.0.1:5000/api/thresholds?equipment_type=ahu`);
        const json = await res.json();
        newThresholds.ahu = json.data?.find(t => t.parameter === parameter);
      }
      setThresholds(newThresholds);
    };
    fetchThresholds();
  }, [selectedEquipment, parameter]);

  useEffect(() => {
    setLoading(true);
    const combinedReadings = [];

    // Aggregate all readings by timestamp
    if (selectedEquipment.chiller && chillerReadings.data?.data) {
      chillerReadings.data.data.forEach(r => {
        combinedReadings.push({ ...r, eqType: 'chiller' });
      });
    }
    if (selectedEquipment.pump && pumpReadings.data?.data) {
      pumpReadings.data.data.forEach(r => {
        combinedReadings.push({ ...r, eqType: 'pump' });
      });
    }
    if (selectedEquipment.ahu && ahuReadings.data?.data) {
      ahuReadings.data.data.forEach(r => {
        combinedReadings.push({ ...r, eqType: 'ahu' });
      });
    }

    // Create graph data by grouping by timestamp
    const timeMap = new Map();
    combinedReadings.forEach(r => {
      const timestamp = new Date(r.timestamp).toLocaleDateString('id-ID');
      if (!timeMap.has(timestamp)) {
        timeMap.set(timestamp, { timestamp });
      }

      const entry = timeMap.get(timestamp);
      const getValueForParam = (reading, param) => {
        const paramMap = {
          'voltage_R': reading.R,
          'voltage_S': reading.S,
          'voltage_T': reading.T,
          'temp_in': reading.in_temp,
          'temp_out': reading.out_temp,
        };
        return paramMap[param] || 0;
      };

      const key = `${r.eqType.toUpperCase()}_${parameter}`;
      entry[key] = getValueForParam(r, parameter);
    });

    let processedData = Array.from(timeMap.values());
    processedData = filterByTimeRange(processedData, timeRange);

    setData(processedData);
    setLoading(false);
  }, [selectedEquipment, chillerReadings.data, pumpReadings.data, ahuReadings.data, parameter, timeRange]);

  const filterByTimeRange = (data, range) => {
    const now = new Date();
    let startDate;

    switch(range) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '6-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        return data;
    }

    return data.filter(d => new Date(d.timestamp) >= startDate);
  };

  if (loading) {
    return (
      <div className="graph-loading">
        <div className="spinner"></div>
        <p>Loading equipment data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    const selectedEquipmentList = Object.keys(selectedEquipment)
      .filter(k => selectedEquipment[k])
      .join(', ');

    return (
      <div className="graph-empty">
        <p>📭 No data available</p>
        <small>
          Equipment: {selectedEquipmentList || 'None selected'} |
          Parameter: {parameter} |
          Time Range: {timeRange}
        </small>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '12px' }}>
          💡 Tips:
          <br />• Ensure you have recorded readings in Daily Check for selected equipment
          <br />• Try a longer time range (yearly instead of monthly)
          <br />• Check if threshold data exists for the selected parameter
        </p>
      </div>
    );
  }

  const handleExportGraph = async () => {
    const graphContainer = document.querySelector('.graph-viewer');
    if (!graphContainer) return;

    try {
      const equipmentNames = Object.keys(selectedEquipment)
        .filter(k => selectedEquipment[k])
        .map(k => k.charAt(0).toUpperCase() + k.slice(1))
        .join('-');

      const timestamp = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');

      // Capture graph as image
      const canvas = await html2canvas(graphContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const image = canvas.toDataURL('image/png');

      // Download as PNG
      const link = document.createElement('a');
      link.href = image;
      link.download = `graph-${equipmentNames}-${parameter}-${timeRange}-${timestamp}.png`;
      link.click();

      // Also create PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(image, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.text(`Equipment: ${equipmentNames} | Parameter: ${parameter} | Range: ${timeRange}`, 10, imgHeight + 20);
      pdf.text(`Exported: ${new Date().toLocaleString('id-ID')}`, 10, imgHeight + 25);
      pdf.save(`graph-${equipmentNames}-${parameter}-${timeRange}-${timestamp}.pdf`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export graph. Please try again.');
    }
  };

  return (
    <div className="graph-viewer">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>📈 Multi-Equipment Comparison</h3>
        <button
          onClick={handleExportGraph}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0284C7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          📥 Export (PNG + PDF)
        </button>
      </div>

      <div className="graph-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => [value?.toFixed(2) || 'N/A', 'Value']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />

            {/* Chiller Lines - Blue */}
            {selectedEquipment.chiller && (
              <>
                <Line
                  type="monotone"
                  dataKey={`CHILLER_${parameter}`}
                  stroke="#0284C7"
                  name={`Chiller ${parameter}`}
                  strokeWidth={2}
                  isAnimationActive={true}
                />
                {thresholds.chiller?.min_value && (
                  <ReferenceLine
                    y={thresholds.chiller.min_value}
                    stroke="#10B981"
                    strokeDasharray="5 5"
                    label={{ value: `Chiller Min: ${thresholds.chiller.min_value}`, position: 'left', fill: '#10B981', fontSize: 12 }}
                  />
                )}
                {thresholds.chiller?.max_value && (
                  <ReferenceLine
                    y={thresholds.chiller.max_value}
                    stroke="#EF4444"
                    strokeDasharray="5 5"
                    label={{ value: `Chiller Max: ${thresholds.chiller.max_value}`, position: 'left', fill: '#EF4444', fontSize: 12 }}
                  />
                )}
              </>
            )}

            {/* Pump Lines - Green */}
            {selectedEquipment.pump && (
              <>
                <Line
                  type="monotone"
                  dataKey={`PUMP_${parameter}`}
                  stroke="#10B981"
                  name={`Pump ${parameter}`}
                  strokeWidth={2}
                  isAnimationActive={true}
                />
                {thresholds.pump?.min_value && (
                  <ReferenceLine
                    y={thresholds.pump.min_value}
                    stroke="#10B981"
                    strokeDasharray="10 5"
                    label={{ value: `Pump Min: ${thresholds.pump.min_value}`, position: 'right', fill: '#10B981', fontSize: 12 }}
                  />
                )}
                {thresholds.pump?.max_value && (
                  <ReferenceLine
                    y={thresholds.pump.max_value}
                    stroke="#EF4444"
                    strokeDasharray="10 5"
                    label={{ value: `Pump Max: ${thresholds.pump.max_value}`, position: 'right', fill: '#EF4444', fontSize: 12 }}
                  />
                )}
              </>
            )}

            {/* AHU Lines - Amber */}
            {selectedEquipment.ahu && (
              <>
                <Line
                  type="monotone"
                  dataKey={`AHU_${parameter}`}
                  stroke="#F59E0B"
                  name={`AHU ${parameter}`}
                  strokeWidth={2}
                  isAnimationActive={true}
                />
                {thresholds.ahu?.min_value && (
                  <ReferenceLine
                    y={thresholds.ahu.min_value}
                    stroke="#10B981"
                    strokeDasharray="5 10"
                    label={{ value: `AHU Min: ${thresholds.ahu.min_value}`, position: 'left', fill: '#10B981', fontSize: 12 }}
                  />
                )}
                {thresholds.ahu?.max_value && (
                  <ReferenceLine
                    y={thresholds.ahu.max_value}
                    stroke="#EF4444"
                    strokeDasharray="5 10"
                    label={{ value: `AHU Max: ${thresholds.ahu.max_value}`, position: 'right', fill: '#EF4444', fontSize: 12 }}
                  />
                )}
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="graph-legend">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {selectedEquipment.chiller && (
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#0284C7' }}></div>
              <span>❄️ Chiller {parameter}</span>
            </div>
          )}
          {selectedEquipment.pump && (
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#10B981' }}></div>
              <span>💧 Pump {parameter}</span>
            </div>
          )}
          {selectedEquipment.ahu && (
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#F59E0B' }}></div>
              <span>🌬️ AHU {parameter}</span>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="graph-stats" style={{ marginTop: '24px' }}>
        <div className="stat-item">
          <span className="stat-label">Total Data Points</span>
          <span className="stat-value">{data.length}</span>
        </div>
      </div>
    </div>
  );
};

export default GraphViewerMulti;
